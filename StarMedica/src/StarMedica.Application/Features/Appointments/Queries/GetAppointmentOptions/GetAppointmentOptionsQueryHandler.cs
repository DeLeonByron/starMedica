using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Appointments.Queries.GetAppointmentOptions;

public sealed class GetAppointmentOptionsQueryHandler : IRequestHandler<GetAppointmentOptionsQuery, Result<AppointmentOptionsDto>>
{
    private readonly IAppointmentRepository _appointments;

    public GetAppointmentOptionsQueryHandler(IAppointmentRepository appointments)
    {
        _appointments = appointments;
    }

    public async Task<Result<AppointmentOptionsDto>> Handle(
        GetAppointmentOptionsQuery request,
        CancellationToken cancellationToken)
    {
        var patients = await _appointments.GetActivePatientsAsync(cancellationToken);
        var doctors = await _appointments.GetActiveDoctorsAsync(cancellationToken);
        var options = new AppointmentOptionsDto(
            patients.Select(patient => new AppointmentOptionDto(patient.Id, patient.FullName)).ToArray(),
            doctors.Select(doctor => new AppointmentOptionDto(doctor.Id, doctor.FullName)).ToArray());

        return Result<AppointmentOptionsDto>.Success(options);
    }
}