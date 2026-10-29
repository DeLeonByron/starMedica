using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Patients.Queries.GetPatientsList;

public sealed record GetPatientsListQuery : IRequest<Result<IReadOnlyList<PatientDto>>>;
