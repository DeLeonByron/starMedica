using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Appointments.Commands.CreateAppointment;

public sealed class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, Result<AppointmentDto>>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IValidator<CreateAppointmentCommand> _validator;

    public CreateAppointmentCommandHandler(
        IAppointmentRepository appointments,
        IValidator<CreateAppointmentCommand> validator)
    {
        _appointments = appointments;
        _validator = validator;
    }

    public async Task<Result<AppointmentDto>> Handle(
        CreateAppointmentCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<AppointmentDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        if (request.StartsAt <= DateTimeOffset.UtcNow)
        {
            return Result<AppointmentDto>.Failure("La cita debe programarse en una fecha futura.", 400);
        }

        if (!await _appointments.PatientExistsAsync(request.PatientId, cancellationToken))
        {
            return Result<AppointmentDto>.NotFound("El paciente no existe o está inactivo.");
        }

        if (!await _appointments.IsActiveDoctorAsync(request.DoctorId, cancellationToken))
        {
            return Result<AppointmentDto>.Failure("El médico no existe, está inactivo o no tiene el rol requerido.", 400);
        }

        var appointment = new Appointment
        {
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            StartsAt = request.StartsAt.ToUniversalTime(),
            DurationMinutes = request.DurationMinutes,
            Reason = request.Reason.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        if (!await _appointments.TryScheduleAsync(appointment, cancellationToken))
        {
            return Result<AppointmentDto>.Failure("El médico ya tiene una cita en ese horario.", 409);
        }

        var created = await _appointments.GetByIdWithDetailsAsync(appointment.Id, cancellationToken);
        if (created is null)
        {
            return Result<AppointmentDto>.Failure("No se pudo recuperar la cita creada.", 500);
        }

        return Result<AppointmentDto>.Created(ToDto(created));
    }

    private static AppointmentDto ToDto(Appointment appointment)
    {
        return new AppointmentDto(
            appointment.Id,
            appointment.PatientId,
            appointment.Patient.FullName,
            appointment.DoctorId,
            appointment.Doctor.FullName,
            appointment.StartsAt,
            appointment.StartsAt.AddMinutes(appointment.DurationMinutes),
            appointment.DurationMinutes,
            appointment.Reason,
            appointment.Status);
    }
}