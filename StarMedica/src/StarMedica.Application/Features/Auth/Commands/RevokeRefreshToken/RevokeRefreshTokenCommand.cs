using MediatR;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Auth.Commands.RevokeRefreshToken;

public sealed record RevokeRefreshTokenCommand(string TokenHash) : IRequest<Result<bool>>;