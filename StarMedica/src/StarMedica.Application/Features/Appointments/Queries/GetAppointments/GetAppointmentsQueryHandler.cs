using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Appointments.Queries.GetAppointments;

public sealed class GetAppointmentsQueryHandler : IRequestHandler<GetAppointmentsQuery, Result<IReadOnlyList<AppointmentDto>>>
{
    private readonly IAppointmentRepository _appointments;

    public GetAppointmentsQueryHandler(IAppointmentRepository appointments)
    {
        _appointments = appointments;
    }

    public async Task<Result<IReadOnlyList<AppointmentDto>>> Handle(
        GetAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        if (request.From >= request.To || request.To - request.From > TimeSpan.FromDays(31))
        {
            return Result<IReadOnlyList<AppointmentDto>>.Failure(
                "El intervalo debe ser válido y no puede superar 31 días.",
                400);
        }

        var appointments = await _appointments.GetBetweenAsync(
            request.From.ToUniversalTime(),
            request.To.ToUniversalTime(),
            cancellationToken);

        var results = appointments.Select(appointment => new AppointmentDto(
            appointment.Id,
            appointment.PatientId,
            appointment.Patient.FullName,
            appointment.DoctorId,
            appointment.Doctor.FullName,
            appointment.StartsAt,
            appointment.StartsAt.AddMinutes(appointment.DurationMinutes),
            appointment.DurationMinutes,
            appointment.Reason,
            appointment.Status)).ToArray();

        return Result<IReadOnlyList<AppointmentDto>>.Success(results);
    }
}