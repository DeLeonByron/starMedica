using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public sealed class BillingDraft : BaseEntity
{
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerNit { get; set; }
    public string? CustomerAddress { get; set; }
    public string? Notes { get; set; }
    public decimal Total { get; set; }
    public ICollection<BillingDraftLine> Lines { get; set; } = new List<BillingDraftLine>();
}
