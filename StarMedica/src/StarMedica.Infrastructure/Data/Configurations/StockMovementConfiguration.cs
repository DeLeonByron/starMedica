using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements", table =>
        {
            table.HasCheckConstraint("CK_StockMovements_Quantity_Positive", "[Quantity] > 0");
        });
        builder.HasKey(movement => movement.Id);
        builder.Property(movement => movement.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(movement => movement.Quantity).HasPrecision(12, 3);
        builder.Property(movement => movement.OccurredAt).IsRequired();
        builder.Property(movement => movement.Reference).HasMaxLength(100);
        builder.Property(movement => movement.Notes).HasMaxLength(500);
        builder.HasOne(movement => movement.MedicineBatch)
            .WithMany()
            .HasForeignKey(movement => movement.MedicineBatchId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(movement => movement.PerformedBy)
            .WithMany()
            .HasForeignKey(movement => movement.PerformedById)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(movement => movement.Patient)
            .WithMany()
            .HasForeignKey(movement => movement.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(movement => movement.Consultation)
            .WithMany()
            .HasForeignKey(movement => movement.ConsultationId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(movement => new { movement.MedicineBatchId, movement.OccurredAt });
        builder.HasIndex(movement => movement.PatientId);
        builder.HasQueryFilter(movement =>
            !movement.PerformedBy.IsDeleted &&
            (movement.Patient == null || !movement.Patient.IsDeleted));
    }
}