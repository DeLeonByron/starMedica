using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Auth.Commands.GoogleLogin;

public sealed record GoogleLoginCommand(
    string GoogleId,
    string Email,
    string FullName,
    string? PhotoUrl,
    bool EmailVerified,
    bool IsBootstrapAdmin) : IRequest<Result<AuthTokensDto>>;