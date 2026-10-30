namespace StarMedica.Application.DTOs;

public sealed record AvailableConsultationAppointmentDto(
    int Id,
    DateTimeOffset StartsAt,
    int DoctorId,
    string DoctorName,
    string Reason);