using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
{
    public void Configure(EntityTypeBuilder<Medicine> builder)
    {
        builder.ToTable("Medicines");
        builder.HasKey(medicine => medicine.Id);
        builder.Property(medicine => medicine.Code).IsRequired().HasMaxLength(40);
        builder.Property(medicine => medicine.Name).IsRequired().HasMaxLength(200);
        builder.Property(medicine => medicine.ActiveIngredient).IsRequired().HasMaxLength(200);
        builder.Property(medicine => medicine.Strength).IsRequired().HasMaxLength(100);
        builder.Property(medicine => medicine.DosageForm).IsRequired().HasMaxLength(100);
        builder.Property(medicine => medicine.StockUnit).IsRequired().HasMaxLength(40);
        builder.Property(medicine => medicine.ReorderLevel).HasPrecision(12, 3);
        builder.HasIndex(medicine => medicine.Code).IsUnique();
    }
}