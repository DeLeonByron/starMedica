using MediatR;
using StarMedica.Application.Abstractions;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Auth.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthTokensDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthTokenService _authTokenService;

    public RefreshTokenCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IAuthTokenService authTokenService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _authTokenService = authTokenService;
    }

    public async Task<Result<AuthTokensDto>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByRefreshTokenHashAsync(request.TokenHash, cancellationToken);
        if (user is null || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            return Result<AuthTokensDto>.Unauthorized("La sesión expiró. Inicie sesión nuevamente.");
        }

        if (!user.IsActive)
        {
            return Result<AuthTokensDto>.Failure("Usuario inactivo.", 403);
        }

        var roles = await _userRepository.GetRolesAsync(user.Id, cancellationToken);
        var tokens = _authTokenService.Issue(user, roles);
        user.RefreshTokenHash = _authTokenService.HashRefreshToken(tokens.RefreshToken);
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<AuthTokensDto>.Success(tokens);
    }
}