using StarMedica.Application.DTOs;
using StarMedica.Domain.Entities;

namespace StarMedica.Application.Abstractions;

public interface IAuthTokenService
{
    AuthTokensDto Issue(User user, string[] roles);
    string HashRefreshToken(string refreshToken);
}