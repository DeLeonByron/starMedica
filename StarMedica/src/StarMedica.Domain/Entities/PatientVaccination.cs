using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class PatientVaccination : SoftDeleteEntity
{
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int VaccineId { get; set; }
    public Vaccine Vaccine { get; set; } = null!;
    public int DoseNumber { get; set; }
    public DateTimeOffset AdministeredAt { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public DateOnly ExpiresOn { get; set; }
    public int AdministeredById { get; set; }
    public User AdministeredBy { get; set; } = null!;
    public string? AdverseEventNotes { get; set; }
}