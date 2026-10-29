using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class UserRepository : Repository<User>, IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return _context.Users.SingleOrDefaultAsync(
            user => user.Email == email,
            cancellationToken);
    }

    public Task<User?> FindByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default)
    {
        return _context.Users.SingleOrDefaultAsync(
            user => user.GoogleId == googleId,
            cancellationToken);
    }

    public Task<User?> FindByRefreshTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return _context.Users.SingleOrDefaultAsync(
            user => user.RefreshTokenHash == tokenHash,
            cancellationToken);
    }

    public Task<string[]> GetRolesAsync(int userId, CancellationToken cancellationToken = default)
    {
        return _context.UserRoles
            .Where(userRole => userRole.UserId == userId && userRole.Role.IsActive)
            .Select(userRole => userRole.Role.Name)
            .ToArrayAsync(cancellationToken);
    }

    public async Task EnsureRoleAssignedAsync(
        User user,
        string roleName,
        CancellationToken cancellationToken = default)
    {
        var role = await _context.Roles.SingleAsync(
            candidate => candidate.Name == roleName && candidate.IsActive,
            cancellationToken);
        var isAssigned = await _context.UserRoles.AnyAsync(
            userRole => userRole.UserId == user.Id && userRole.RoleId == role.Id,
            cancellationToken);

        if (!isAssigned)
        {
            await _context.UserRoles.AddAsync(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                AssignedAt = DateTime.UtcNow
            }, cancellationToken);
        }
    }
}