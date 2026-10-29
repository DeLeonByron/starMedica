namespace StarMedica.Application.DTOs;

public sealed record PatientDto(
    int Id,
    string Code,
    string FullName,
    DateOnly? DateOfBirth,
    string DocumentNumber,
    string Phone,
    string Email,
    string Address,
    bool IsActive);
