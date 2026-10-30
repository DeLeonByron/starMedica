using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Consultations.Queries.GetPatientConsultations;

public sealed record GetPatientConsultationsQuery(int PatientId)
    : IRequest<Result<IReadOnlyList<ConsultationDto>>>;