using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class VaccineConfiguration : IEntityTypeConfiguration<Vaccine>
{
    public void Configure(EntityTypeBuilder<Vaccine> builder)
    {
        builder.ToTable("Vaccines");
        builder.HasKey(vaccine => vaccine.Id);
        builder.Property(vaccine => vaccine.Code).IsRequired().HasMaxLength(20);
        builder.Property(vaccine => vaccine.Name).IsRequired().HasMaxLength(150);
        builder.Property(vaccine => vaccine.TargetDisease).IsRequired().HasMaxLength(300);
        builder.Property(vaccine => vaccine.DosesRequired).IsRequired();
        builder.HasIndex(vaccine => vaccine.Code).IsUnique();
    }
}