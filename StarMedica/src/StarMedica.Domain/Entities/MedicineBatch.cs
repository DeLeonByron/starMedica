using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class MedicineBatch : BaseEntity
{
    public int MedicineId { get; set; }
    public Medicine Medicine { get; set; } = null!;
    public string BatchNumber { get; set; } = string.Empty;
    public DateOnly ExpiresOn { get; set; }
    public decimal QuantityAvailable { get; set; }
    public DateTimeOffset ReceivedAt { get; set; }
}