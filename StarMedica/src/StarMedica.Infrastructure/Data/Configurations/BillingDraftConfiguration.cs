using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public sealed class BillingDraftConfiguration : IEntityTypeConfiguration<BillingDraft>
{
    public void Configure(EntityTypeBuilder<BillingDraft> builder)
    {
        builder.ToTable("BillingDrafts", table =>
            table.HasCheckConstraint("CK_BillingDrafts_Total", "[Total] >= 0"));
        builder.HasKey(draft => draft.Id);
        builder.Property(draft => draft.CustomerName).IsRequired().HasMaxLength(200);
        builder.Property(draft => draft.CustomerNit).HasMaxLength(20);
        builder.Property(draft => draft.CustomerAddress).HasMaxLength(300);
        builder.Property(draft => draft.Notes).HasMaxLength(500);
        builder.Property(draft => draft.Total).HasPrecision(18, 2);
        builder.HasIndex(draft => new { draft.CreatedAt, draft.Id }).IsDescending(true, true);
        builder.HasMany(draft => draft.Lines)
            .WithOne(line => line.BillingDraft)
            .HasForeignKey(line => line.BillingDraftId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
