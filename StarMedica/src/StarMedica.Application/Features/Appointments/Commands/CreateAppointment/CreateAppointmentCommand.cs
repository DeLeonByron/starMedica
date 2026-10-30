using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Appointments.Commands.CreateAppointment;

public sealed record CreateAppointmentCommand(
    int PatientId,
    int DoctorId,
    DateTimeOffset StartsAt,
    int DurationMinutes,
    string Reason) : IRequest<Result<AppointmentDto>>;