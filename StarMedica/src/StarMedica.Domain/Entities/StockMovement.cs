using StarMedica.Domain.Common;
using StarMedica.Domain.Enums;

namespace StarMedica.Domain.Entities;

public class StockMovement : BaseEntity
{
    public int MedicineBatchId { get; set; }
    public MedicineBatch MedicineBatch { get; set; } = null!;
    public StockMovementType Type { get; set; }
    public decimal Quantity { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public int PerformedById { get; set; }
    public User PerformedBy { get; set; } = null!;
    public int? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public int? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}