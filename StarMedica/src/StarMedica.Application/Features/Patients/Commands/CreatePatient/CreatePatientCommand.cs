using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Patients.Commands.CreatePatient;

public sealed record CreatePatientCommand(
    string Code,
    string FullName,
    DateOnly? DateOfBirth,
    string DocumentNumber,
    string Phone,
    string Email,
    string Address) : IRequest<Result<PatientDto>>;
