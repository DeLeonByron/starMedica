using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;

public sealed record AdministerVaccineCommand(
    int PatientId,
    int VaccineId,
    int AdministeredById,
    int DoseNumber,
    DateTimeOffset? AdministeredAt,
    string LotNumber,
    DateOnly ExpiresOn,
    string? AdverseEventNotes) : IRequest<Result<PatientVaccinationDto>>;