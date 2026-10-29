using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Auth.Commands.RefreshToken;

public sealed record RefreshTokenCommand(string TokenHash) : IRequest<Result<AuthTokensDto>>;