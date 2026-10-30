using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Appointments.Queries.GetAppointments;

public sealed record GetAppointmentsQuery(DateTimeOffset From, DateTimeOffset To)
    : IRequest<Result<IReadOnlyList<AppointmentDto>>>;