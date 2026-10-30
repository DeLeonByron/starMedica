using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Appointments.Queries.GetAppointmentOptions;

public sealed record GetAppointmentOptionsQuery : IRequest<Result<AppointmentOptionsDto>>;