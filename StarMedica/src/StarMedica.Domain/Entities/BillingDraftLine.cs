using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public sealed class BillingDraftLine : BaseEntity
{
    public int BillingDraftId { get; set; }
    public BillingDraft BillingDraft { get; set; } = null!;
    public int LineNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
