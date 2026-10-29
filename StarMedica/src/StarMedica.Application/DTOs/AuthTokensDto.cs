namespace StarMedica.Application.DTOs;

public sealed record UserProfileDto(
    int Id,
    string FullName,
    string Email,
    string? PhotoUrl,
    string[] Roles);

public sealed record AuthTokensDto(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    UserProfileDto User,
    string RefreshToken);

public sealed record AuthResponseDto(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    UserProfileDto User);