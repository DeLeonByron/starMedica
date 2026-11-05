using StarMedica.Application.Abstractions;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Auth.Commands.GoogleLogin;
using StarMedica.Application.Features.Auth.Commands.RefreshToken;
using StarMedica.Application.Features.Auth.Commands.RevokeRefreshToken;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class AuthCommandHandlerTests
{
    [Fact]
    public async Task GoogleLogin_RejectsUnverifiedEmailWithoutIssuingTokens()
    {
        var users = new CapturingUserRepository();
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new GoogleLoginCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new GoogleLoginCommand("google-id", "person@example.com", "Person", null, false, false),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(401, result.StatusCode);
        Assert.Empty(users.AddedUsers);
        Assert.Equal(0, tokens.IssueCount);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task GoogleLogin_CreatesUserAndPersistsRefreshTokenHash()
    {
        var users = new CapturingUserRepository { Roles = ["SuperAdmin"] };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new GoogleLoginCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new GoogleLoginCommand(
                "google-id",
                " person@example.com ",
                " Person ",
                "https://example.com/photo",
                true,
                true),
            CancellationToken.None);

        var user = Assert.Single(users.AddedUsers);
        Assert.True(result.IsSuccess);
        Assert.Equal("person@example.com", user.Email);
        Assert.Equal("Person", user.FullName);
        Assert.Equal("google-id", user.GoogleId);
        Assert.True(user.IsActive);
        Assert.Equal(["SuperAdmin"], users.AssignedRoles);
        Assert.Equal("hash:refresh-token", user.RefreshTokenHash);
        Assert.InRange(
            user.RefreshTokenExpiry!.Value,
            DateTime.UtcNow.AddDays(6).AddMinutes(-1),
            DateTime.UtcNow.AddDays(7).AddMinutes(1));
        Assert.Equal(1, tokens.IssueCount);
        Assert.Equal(3, unitOfWork.SaveCount);
        Assert.Equal("access-token", result.Value?.AccessToken);
    }

    [Fact]
    public async Task GoogleLogin_RejectsInactiveExistingUser()
    {
        var users = new CapturingUserRepository
        {
            ExistingEmailUser = new User
            {
                Id = 12,
                Email = "person@example.com",
                GoogleId = "google-id",
                IsActive = false
            }
        };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new GoogleLoginCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new GoogleLoginCommand("google-id", "person@example.com", "Person", null, true, false),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(403, result.StatusCode);
        Assert.Equal(0, tokens.IssueCount);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task GoogleLogin_LinksGoogleIdToExistingUnlinkedEmail()
    {
        var existingUser = new User
        {
            Id = 12,
            Email = "person@example.com",
            IsActive = true
        };
        var users = new CapturingUserRepository
        {
            ExistingEmailUser = existingUser,
            Roles = ["Recepcionista"]
        };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new GoogleLoginCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new GoogleLoginCommand(
                "google-id",
                "person@example.com",
                "Persona",
                "https://example.com/photo",
                true,
                false),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("google-id", existingUser.GoogleId);
        Assert.Equal("https://example.com/photo", existingUser.PhotoUrl);
        Assert.Equal("hash:refresh-token", existingUser.RefreshTokenHash);
        Assert.Equal(1, tokens.IssueCount);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task GoogleLogin_RejectsEmailAlreadyLinkedToAnotherGoogleAccount()
    {
        var users = new CapturingUserRepository
        {
            ExistingEmailUser = new User
            {
                Id = 12,
                Email = "person@example.com",
                GoogleId = "different-google-id",
                IsActive = true
            }
        };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new GoogleLoginCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new GoogleLoginCommand(
                "google-id",
                "person@example.com",
                "Persona",
                null,
                true,
                false),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(409, result.StatusCode);
        Assert.Equal(0, tokens.IssueCount);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task RefreshToken_RejectsExpiredSessionWithoutIssuingTokens()
    {
        var users = new CapturingUserRepository
        {
            RefreshTokenUser = new User
            {
                Id = 12,
                IsActive = true,
                RefreshTokenExpiry = DateTime.UtcNow.AddSeconds(-1)
            }
        };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new RefreshTokenCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new RefreshTokenCommand("stored-hash"),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(401, result.StatusCode);
        Assert.Equal(0, tokens.IssueCount);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task RefreshToken_RejectsInactiveUserWithoutIssuingTokens()
    {
        var users = new CapturingUserRepository
        {
            RefreshTokenUser = new User
            {
                Id = 12,
                IsActive = false,
                RefreshTokenExpiry = DateTime.UtcNow.AddDays(1)
            }
        };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new RefreshTokenCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new RefreshTokenCommand("stored-hash"),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(403, result.StatusCode);
        Assert.Equal(0, tokens.IssueCount);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task RefreshToken_RotatesAndPersistsRefreshTokenHash()
    {
        var users = new CapturingUserRepository
        {
            RefreshTokenUser = new User
            {
                Id = 12,
                IsActive = true,
                RefreshTokenExpiry = DateTime.UtcNow.AddDays(1)
            },
            Roles = ["Médico"]
        };
        var tokens = new CapturingAuthTokenService();
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new RefreshTokenCommandHandler(users, unitOfWork, tokens);

        var result = await handler.Handle(
            new RefreshTokenCommand("stored-hash"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("access-token", result.Value?.AccessToken);
        Assert.Equal("hash:refresh-token", users.RefreshTokenUser.RefreshTokenHash);
        Assert.InRange(
            users.RefreshTokenUser.RefreshTokenExpiry!.Value,
            DateTime.UtcNow.AddDays(6).AddMinutes(-1),
            DateTime.UtcNow.AddDays(7).AddMinutes(1));
        Assert.Equal(1, tokens.IssueCount);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task RevokeRefreshToken_ClearsStoredSession()
    {
        var user = new User
        {
            Id = 12,
            RefreshTokenHash = "stored-hash",
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(1)
        };
        var users = new CapturingUserRepository { RefreshTokenUser = user };
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new RevokeRefreshTokenCommandHandler(users, unitOfWork);

        var result = await handler.Handle(
            new RevokeRefreshTokenCommand("stored-hash"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Null(user.RefreshTokenHash);
        Assert.Null(user.RefreshTokenExpiry);
        Assert.NotNull(user.UpdatedAt);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    private sealed class CapturingUserRepository : IUserRepository
    {
        public List<User> AddedUsers { get; } = [];
        public List<string> AssignedRoles { get; } = [];
        public User? ExistingEmailUser { get; init; }
        public User? RefreshTokenUser { get; init; }
        public string[] Roles { get; init; } = [];

        public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            Task.FromResult(
                ExistingEmailUser is not null &&
                string.Equals(ExistingEmailUser.Email, email, StringComparison.OrdinalIgnoreCase)
                    ? ExistingEmailUser
                    : null);

        public Task<User?> FindByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default) =>
            Task.FromResult(
                ExistingEmailUser is not null &&
                string.Equals(ExistingEmailUser.GoogleId, googleId, StringComparison.Ordinal)
                    ? ExistingEmailUser
                    : null);

        public Task<User?> FindByRefreshTokenHashAsync(
            string tokenHash,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(RefreshTokenUser);

        public Task<string[]> GetRolesAsync(int userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Roles);

        public Task EnsureRoleAssignedAsync(
            User user,
            string roleName,
            CancellationToken cancellationToken = default)
        {
            AssignedRoles.Add(roleName);
            return Task.CompletedTask;
        }

        public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult(AddedUsers.SingleOrDefault(user => user.Id == id));

        public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<User>>(AddedUsers);

        public Task AddAsync(User entity, CancellationToken cancellationToken = default)
        {
            entity.Id = 31;
            AddedUsers.Add(entity);
            return Task.CompletedTask;
        }

        public void Update(User entity) { }

        public void Delete(User entity) { }
    }

    private sealed class CapturingUnitOfWork : IUnitOfWork
    {
        public int SaveCount { get; private set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveCount++;
            return Task.FromResult(1);
        }
    }

    private sealed class CapturingAuthTokenService : IAuthTokenService
    {
        public int IssueCount { get; private set; }

        public AuthTokensDto Issue(User user, string[] roles)
        {
            IssueCount++;
            return new AuthTokensDto(
                "access-token",
                DateTimeOffset.UtcNow.AddMinutes(15),
                new UserProfileDto(user.Id, user.FullName, user.Email, user.PhotoUrl, roles),
                "refresh-token");
        }

        public string HashRefreshToken(string refreshToken) => $"hash:{refreshToken}";
    }
}
