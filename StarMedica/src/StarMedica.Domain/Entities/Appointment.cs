using StarMedica.Domain.Common;
using StarMedica.Domain.Enums;

namespace StarMedica.Domain.Entities;

public class Appointment : SoftDeleteEntity
{
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int DoctorId { get; set; }
    public User Doctor { get; set; } = null!;
    public DateTimeOffset StartsAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Reason { get; set; } = string.Empty;
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
}