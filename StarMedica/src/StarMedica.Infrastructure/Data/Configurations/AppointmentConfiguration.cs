using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("Appointments");
        builder.HasKey(appointment => appointment.Id);
        builder.Property(appointment => appointment.StartsAt).IsRequired();
        builder.Property(appointment => appointment.DurationMinutes).IsRequired();
        builder.Property(appointment => appointment.Reason).IsRequired().HasMaxLength(500);
        builder.Property(appointment => appointment.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(appointment => appointment.Patient)
            .WithMany()
            .HasForeignKey(appointment => appointment.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(appointment => appointment.Doctor)
            .WithMany()
            .HasForeignKey(appointment => appointment.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(appointment => new { appointment.DoctorId, appointment.StartsAt });
        builder.HasIndex(appointment => new { appointment.PatientId, appointment.StartsAt });
        builder.HasQueryFilter(appointment =>
            !appointment.IsDeleted &&
            !appointment.Patient.IsDeleted &&
            !appointment.Doctor.IsDeleted);
    }
}