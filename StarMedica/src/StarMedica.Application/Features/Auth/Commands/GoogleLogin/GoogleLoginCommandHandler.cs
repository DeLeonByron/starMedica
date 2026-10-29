using MediatR;
using StarMedica.Application.Abstractions;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Auth.Commands.GoogleLogin;

public sealed class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, Result<AuthTokensDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthTokenService _authTokenService;

    public GoogleLoginCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IAuthTokenService authTokenService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _authTokenService = authTokenService;
    }

    public async Task<Result<AuthTokensDto>> Handle(
        GoogleLoginCommand request,
        CancellationToken cancellationToken)
    {
        if (!request.EmailVerified ||
            string.IsNullOrWhiteSpace(request.GoogleId) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return Result<AuthTokensDto>.Unauthorized("No se pudo verificar la identidad de Google.");
        }

        var user = await _userRepository.FindByGoogleIdAsync(request.GoogleId, cancellationToken);
        if (user is null)
        {
            user = await _userRepository.FindByEmailAsync(request.Email, cancellationToken);
            if (user is null)
            {
                user = new User
                {
                    Email = request.Email.Trim(),
                    FullName = request.FullName.Trim(),
                    PhotoUrl = request.PhotoUrl,
                    GoogleId = request.GoogleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            else if (user.GoogleId is null)
            {
                user.GoogleId = request.GoogleId;
                user.PhotoUrl = request.PhotoUrl;
                user.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                return Result<AuthTokensDto>.Failure(
                    "La cuenta de Google no coincide con el usuario registrado.",
                    409);
            }
        }

        if (!user.IsActive)
        {
            return Result<AuthTokensDto>.Failure(
                "Usuario inactivo. Contacte al administrador.",
                403);
        }

        if (request.IsBootstrapAdmin)
        {
            await _userRepository.EnsureRoleAssignedAsync(user, "SuperAdmin", cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
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