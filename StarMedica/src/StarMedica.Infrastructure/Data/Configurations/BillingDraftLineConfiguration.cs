using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public sealed class BillingDraftLineConfiguration : IEntityTypeConfiguration<BillingDraftLine>
{
    public void Configure(EntityTypeBuilder<BillingDraftLine> builder)
    {
        builder.ToTable("BillingDraftLines", table =>
        {
            table.HasCheckConstraint(
                "CK_BillingDraftLines_LineNumber",
                "[LineNumber] > 0");
            table.HasCheckConstraint(
                "CK_BillingDraftLines_Quantity",
                "[Quantity] > 0");
            table.HasCheckConstraint(
                "CK_BillingDraftLines_UnitPrice",
                "[UnitPrice] >= 0");
            table.HasCheckConstraint(
                "CK_BillingDraftLines_LineTotal",
                "[LineTotal] >= 0 AND [LineTotal] = ROUND([Quantity] * [UnitPrice], 2)");
        });
        builder.HasKey(line => line.Id);
        builder.Property(line => line.Description).IsRequired().HasMaxLength(300);
        builder.Property(line => line.Quantity).HasPrecision(12, 3);
        builder.Property(line => line.UnitPrice).HasPrecision(12, 2);
        builder.Property(line => line.LineTotal).HasPrecision(18, 2);
        builder.HasIndex(line => new { line.BillingDraftId, line.LineNumber }).IsUnique();
    }
}
