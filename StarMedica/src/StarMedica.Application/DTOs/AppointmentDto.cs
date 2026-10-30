using StarMedica.Domain.Enums;

namespace StarMedica.Application.DTOs;

public sealed record AppointmentDto(
    int Id,
    int PatientId,
    string PatientName,
    int DoctorId,
    string DoctorName,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    int DurationMinutes,
    string Reason,
    AppointmentStatus Status);