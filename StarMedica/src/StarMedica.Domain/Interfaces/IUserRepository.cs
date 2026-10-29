using StarMedica.Domain.Entities;

namespace StarMedica.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> FindByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);
    Task<User?> FindByRefreshTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<string[]> GetRolesAsync(int userId, CancellationToken cancellationToken = default);
    Task EnsureRoleAssignedAsync(User user, string roleName, CancellationToken cancellationToken = default);
}