using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Vaccines.Queries.GetPatientVaccinations;

public sealed record GetPatientVaccinationsQuery(int PatientId)
    : IRequest<Result<IReadOnlyList<PatientVaccinationDto>>>;