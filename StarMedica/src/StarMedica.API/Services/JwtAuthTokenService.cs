using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using StarMedica.Application.Abstractions;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Entities;

namespace StarMedica.API.Services;

public sealed class JwtAuthTokenService : IAuthTokenService
{
    private readonly IConfiguration _configuration;

    public JwtAuthTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public AuthTokensDto Issue(User user, string[] roles)
    {
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(
            _configuration.GetValue<int>("Jwt:ExpiresInMinutes"));
        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new("photo", user.PhotoUrl ?? string.Empty)
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        return new AuthTokensDto(
            accessToken,
            expiresAt,
            new UserProfileDto(user.Id, user.FullName, user.Email, user.PhotoUrl, roles),
            refreshToken);
    }

    public string HashRefreshToken(string refreshToken)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken)));
    }
}