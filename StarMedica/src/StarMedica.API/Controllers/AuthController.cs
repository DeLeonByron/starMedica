using Google.Apis.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.API.Services;
using StarMedica.Application.Abstractions;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Auth.Commands.GoogleLogin;
using StarMedica.Application.Features.Auth.Commands.RefreshToken;
using StarMedica.Application.Features.Auth.Commands.RevokeRefreshToken;
using System.ComponentModel.DataAnnotations;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private const string RefreshCookieName = "sm_refresh";
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly IAuthTokenService _authTokenService;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        IMediator mediator,
        IConfiguration configuration,
        IAuthTokenService authTokenService,
        IWebHostEnvironment environment)
    {
        _mediator = mediator;
        _configuration = configuration;
        _authTokenService = authTokenService;
        _environment = environment;
    }

    [AllowAnonymous]
    [HttpPost("google")]
    [ProducesResponseType<AuthResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<AuthResponseDto>> LoginWithGoogle(
        [FromBody] GoogleLoginRequest request,
        CancellationToken cancellationToken)
    {
        var clientId = _configuration["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Autenticación no configurada",
                detail: "Configure Google__ClientId para habilitar el inicio de sesión.");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                request.IdToken,
                new GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Token de Google inválido o expirado."
            });
        }

        var result = await _mediator.Send(
            new GoogleLoginCommand(
                payload.Subject,
                payload.Email,
                payload.Name ?? payload.Email,
                payload.Picture,
                payload.EmailVerified,
                IsBootstrapAdmin(payload.Email)),
            cancellationToken);

        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, new ProblemDetails
            {
                Status = result.StatusCode,
                Title = result.Error
            });
        }

        SetRefreshCookie(result.Value.RefreshToken);
        return Ok(new AuthResponseDto(
            result.Value.AccessToken,
            result.Value.ExpiresAt,
            result.Value.User));
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    [ProducesResponseType<AuthResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies[RefreshCookieName];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "No hay una sesión activa."
            });
        }

        var tokenHash = _authTokenService.HashRefreshToken(refreshToken);
        var result = await _mediator.Send(new RefreshTokenCommand(tokenHash), cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            DeleteRefreshCookie();
            return StatusCode(result.StatusCode, new ProblemDetails
            {
                Status = result.StatusCode,
                Title = result.Error
            });
        }

        SetRefreshCookie(result.Value.RefreshToken);
        return Ok(new AuthResponseDto(
            result.Value.AccessToken,
            result.Value.ExpiresAt,
            result.Value.User));
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies[RefreshCookieName];
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var tokenHash = _authTokenService.HashRefreshToken(refreshToken);
            await _mediator.Send(new RevokeRefreshTokenCommand(tokenHash), cancellationToken);
        }

        DeleteRefreshCookie();
        return NoContent();
    }

    private void SetRefreshCookie(string refreshToken)
    {
        Response.Cookies.Append(RefreshCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(),
            SameSite = _environment.IsDevelopment() ? SameSiteMode.Strict : SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/api/auth"
        });
    }

    private void DeleteRefreshCookie()
    {
        Response.Cookies.Delete(RefreshCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(),
            SameSite = _environment.IsDevelopment() ? SameSiteMode.Strict : SameSiteMode.None,
            Path = "/api/auth"
        });
    }

    private bool IsBootstrapAdmin(string email)
    {
        var bootstrapEmail = _configuration["BootstrapAdminEmail"];
        return !string.IsNullOrWhiteSpace(bootstrapEmail) &&
            string.Equals(email.Trim(), bootstrapEmail.Trim(), StringComparison.OrdinalIgnoreCase);
    }
}

public sealed record GoogleLoginRequest
{
    [Required]
    public required string IdToken { get; init; }
}