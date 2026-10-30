namespace StarMedica.Application.DTOs;

public sealed record AppointmentOptionDto(int Id, string Name);

public sealed record AppointmentOptionsDto(
    IReadOnlyList<AppointmentOptionDto> Patients,
    IReadOnlyList<AppointmentOptionDto> Doctors);