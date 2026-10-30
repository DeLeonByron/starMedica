namespace StarMedica.Application.DTOs;

public sealed record VaccineDto(
    int Id,
    string Code,
    string Name,
    string TargetDisease,
    int DosesRequired,
    bool IsActive);

public sealed record PatientVaccinationDto(
    int Id,
    int PatientId,
    string PatientName,
    int VaccineId,
    string VaccineCode,
    string VaccineName,
    int DoseNumber,
    DateTimeOffset AdministeredAt,
    string LotNumber,
    DateOnly ExpiresOn,
    int AdministeredById,
    string AdministeredByName,
    string? AdverseEventNotes);