using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class MedicineBatchConfiguration : IEntityTypeConfiguration<MedicineBatch>
{
    public void Configure(EntityTypeBuilder<MedicineBatch> builder)
    {
        builder.ToTable("MedicineBatches", table =>
        {
            table.HasCheckConstraint("CK_MedicineBatches_QuantityAvailable_NonNegative", "[QuantityAvailable] >= 0");
        });
        builder.HasKey(batch => batch.Id);
        builder.Property(batch => batch.BatchNumber).IsRequired().HasMaxLength(100);
        builder.Property(batch => batch.QuantityAvailable).HasPrecision(12, 3);
        builder.Property(batch => batch.ReceivedAt).IsRequired();
        builder.HasOne(batch => batch.Medicine)
            .WithMany()
            .HasForeignKey(batch => batch.MedicineId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(batch => new { batch.MedicineId, batch.BatchNumber }).IsUnique();
        builder.HasIndex(batch => new { batch.MedicineId, batch.ExpiresOn });
    }
}