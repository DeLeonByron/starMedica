using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class PatientVaccinationConfiguration : IEntityTypeConfiguration<PatientVaccination>
{
    public void Configure(EntityTypeBuilder<PatientVaccination> builder)
    {
        builder.ToTable("PatientVaccinations");
        builder.HasKey(vaccination => vaccination.Id);
        builder.Property(vaccination => vaccination.AdministeredAt).IsRequired();
        builder.Property(vaccination => vaccination.LotNumber).IsRequired().HasMaxLength(100);
        builder.Property(vaccination => vaccination.ExpiresOn).IsRequired();
        builder.Property(vaccination => vaccination.AdverseEventNotes).HasMaxLength(2000);
        builder.HasOne(vaccination => vaccination.Patient)
            .WithMany()
            .HasForeignKey(vaccination => vaccination.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(vaccination => vaccination.Vaccine)
            .WithMany()
            .HasForeignKey(vaccination => vaccination.VaccineId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(vaccination => vaccination.AdministeredBy)
            .WithMany()
            .HasForeignKey(vaccination => vaccination.AdministeredById)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(vaccination => new { vaccination.PatientId, vaccination.VaccineId, vaccination.DoseNumber })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
        builder.HasIndex(vaccination => new { vaccination.PatientId, vaccination.AdministeredAt });
        builder.HasQueryFilter(vaccination =>
            !vaccination.IsDeleted &&
            !vaccination.Patient.IsDeleted &&
            !vaccination.AdministeredBy.IsDeleted);
    }
}