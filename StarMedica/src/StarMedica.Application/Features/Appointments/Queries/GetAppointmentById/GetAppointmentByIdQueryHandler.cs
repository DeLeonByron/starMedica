using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Appointments.Queries.GetAppointmentById;

public sealed class GetAppointmentByIdQueryHandler : IRequestHandler<GetAppointmentByIdQuery, Result<AppointmentDto>>
{
    private readonly IAppointmentRepository _appointments;

    public GetAppointmentByIdQueryHandler(IAppointmentRepository appointments)
    {
        _appointments = appointments;
    }

    public async Task<Result<AppointmentDto>> Handle(
        GetAppointmentByIdQuery request,
        CancellationToken cancellationToken)
    {
        var appointment = await _appointments.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (appointment is null)
        {
            return Result<AppointmentDto>.NotFound("La cita no existe.");
        }

        return Result<AppointmentDto>.Success(new AppointmentDto(
            appointment.Id,
            appointment.PatientId,
            appointment.Patient.FullName,
            appointment.DoctorId,
            appointment.Doctor.FullName,
            appointment.StartsAt,
            appointment.StartsAt.AddMinutes(appointment.DurationMinutes),
            appointment.DurationMinutes,
            appointment.Reason,
            appointment.Status));
    }
}