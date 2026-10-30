using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Consultations.Queries.GetAvailableAppointments;

public sealed record GetAvailableAppointmentsQuery(int PatientId)
    : IRequest<Result<IReadOnlyList<AvailableConsultationAppointmentDto>>>;