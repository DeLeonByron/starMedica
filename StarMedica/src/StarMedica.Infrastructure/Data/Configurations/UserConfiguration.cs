using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.PhotoUrl).HasMaxLength(500);
        builder.Property(u => u.GoogleId).HasMaxLength(100);
        builder.Property(u => u.RefreshTokenHash).HasMaxLength(500);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.GoogleId)
            .IsUnique()
            .HasFilter("[GoogleId] IS NOT NULL");
        builder.HasIndex(u => u.RefreshTokenHash)
            .IsUnique()
            .HasFilter("[RefreshTokenHash] IS NOT NULL");
        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}
