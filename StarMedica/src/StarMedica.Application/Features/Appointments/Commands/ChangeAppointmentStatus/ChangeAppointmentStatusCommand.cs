using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Enums;

namespace StarMedica.Application.Features.Appointments.Commands.ChangeAppointmentStatus;

public sealed record ChangeAppointmentStatusCommand(int AppointmentId, AppointmentStatus Status)
    : IRequest<Result<AppointmentDto>>;