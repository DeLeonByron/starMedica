using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class User : SoftDeleteEntity
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? GoogleId { get; set; }
    public bool IsActive { get; set; } = true;
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = [];
}
