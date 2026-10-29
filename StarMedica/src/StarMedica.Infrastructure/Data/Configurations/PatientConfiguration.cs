using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.FullName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.DocumentNumber).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Phone).HasMaxLength(25);
        builder.Property(p => p.Email).HasMaxLength(200);
        builder.Property(p => p.Address).HasMaxLength(500);
        builder.HasIndex(p => p.Code).IsUnique();
        builder.HasIndex(p => p.DocumentNumber).IsUnique();
        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
