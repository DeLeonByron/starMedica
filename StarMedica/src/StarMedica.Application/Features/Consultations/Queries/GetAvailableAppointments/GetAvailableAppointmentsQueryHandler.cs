using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Consultations.Queries.GetAvailableAppointments;

public sealed class GetAvailableAppointmentsQueryHandler
    : IRequestHandler<GetAvailableAppointmentsQuery, Result<IReadOnlyList<AvailableConsultationAppointmentDto>>>
{
    private readonly IAppointmentRepository _appointments;

    public GetAvailableAppointmentsQueryHandler(IAppointmentRepository appointments)
    {
        _appointments = appointments;
    }

    public async Task<Result<IReadOnlyList<AvailableConsultationAppointmentDto>>> Handle(
        GetAvailableAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        if (request.PatientId <= 0)
        {
            return Result<IReadOnlyList<AvailableConsultationAppointmentDto>>.Failure(
                "El paciente indicado no es válido.",
                400);
        }

        var appointments = await _appointments.GetAvailableForConsultationAsync(
            request.PatientId,
            cancellationToken);
        var options = appointments.Select(appointment => new AvailableConsultationAppointmentDto(
            appointment.Id,
            appointment.StartsAt,
            appointment.DoctorId,
            appointment.Doctor.FullName,
            appointment.Reason)).ToArray();

        return Result<IReadOnlyList<AvailableConsultationAppointmentDto>>.Success(options);
    }
}