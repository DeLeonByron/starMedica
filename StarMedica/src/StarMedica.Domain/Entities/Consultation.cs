using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class Consultation : BaseEntity
{
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int DoctorId { get; set; }
    public User Doctor { get; set; } = null!;
    public int? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }
    public DateTimeOffset ConsultedAt { get; set; }
    public string ChiefComplaint { get; set; } = string.Empty;
    public string PresentIllness { get; set; } = string.Empty;
    public string PhysicalExam { get; set; } = string.Empty;
    public string DiagnosisCode { get; set; } = string.Empty;
    public string DiagnosisDescription { get; set; } = string.Empty;
    public string TreatmentPlan { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? TemperatureCelsius { get; set; }
    public int? HeartRateBpm { get; set; }
    public int? RespiratoryRatePerMinute { get; set; }
    public int? SystolicBloodPressure { get; set; }
    public int? DiastolicBloodPressure { get; set; }
    public int? OxygenSaturationPercent { get; set; }
}