using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class ConsultationConfiguration : IEntityTypeConfiguration<Consultation>
{
    public void Configure(EntityTypeBuilder<Consultation> builder)
    {
        builder.ToTable("Consultations");
        builder.HasKey(consultation => consultation.Id);
        builder.Property(consultation => consultation.ConsultedAt).IsRequired();
        builder.Property(consultation => consultation.ChiefComplaint).IsRequired().HasMaxLength(300);
        builder.Property(consultation => consultation.PresentIllness).IsRequired().HasMaxLength(2000);
        builder.Property(consultation => consultation.PhysicalExam).IsRequired().HasMaxLength(5000);
        builder.Property(consultation => consultation.DiagnosisCode).IsRequired().HasMaxLength(10);
        builder.Property(consultation => consultation.DiagnosisDescription).IsRequired().HasMaxLength(500);
        builder.Property(consultation => consultation.TreatmentPlan).IsRequired().HasMaxLength(3000);
        builder.Property(consultation => consultation.Notes).HasMaxLength(2000);
        builder.Property(consultation => consultation.WeightKg).HasPrecision(5, 2);
        builder.Property(consultation => consultation.HeightCm).HasPrecision(5, 2);
        builder.Property(consultation => consultation.TemperatureCelsius).HasPrecision(4, 1);
        builder.HasOne(consultation => consultation.Patient)
            .WithMany()
            .HasForeignKey(consultation => consultation.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(consultation => consultation.Doctor)
            .WithMany()
            .HasForeignKey(consultation => consultation.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(consultation => consultation.Appointment)
            .WithMany()
            .HasForeignKey(consultation => consultation.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(consultation => new { consultation.PatientId, consultation.ConsultedAt });
        builder.HasIndex(consultation => consultation.AppointmentId)
            .IsUnique()
            .HasFilter("[AppointmentId] IS NOT NULL");
        builder.HasQueryFilter(consultation =>
            !consultation.Patient.IsDeleted &&
            !consultation.Doctor.IsDeleted);
    }
}