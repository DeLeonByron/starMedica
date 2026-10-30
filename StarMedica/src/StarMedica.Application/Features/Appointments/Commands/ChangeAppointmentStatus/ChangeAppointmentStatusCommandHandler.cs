using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Appointments.Commands.ChangeAppointmentStatus;

public sealed class ChangeAppointmentStatusCommandHandler
    : IRequestHandler<ChangeAppointmentStatusCommand, Result<AppointmentDto>>
{
    private readonly IAppointmentRepository _appointments;
    private readonly IUnitOfWork _unitOfWork;

    public ChangeAppointmentStatusCommandHandler(
        IAppointmentRepository appointments,
        IUnitOfWork unitOfWork)
    {
        _appointments = appointments;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AppointmentDto>> Handle(
        ChangeAppointmentStatusCommand request,
        CancellationToken cancellationToken)
    {
        var appointment = await _appointments.GetByIdWithDetailsAsync(request.AppointmentId, cancellationToken);
        if (appointment is null)
        {
            return Result<AppointmentDto>.NotFound("La cita no existe.");
        }

        if (!IsTransitionAllowed(appointment.Status, request.Status))
        {
            return Result<AppointmentDto>.Failure(
                "La transición de estado solicitada no está permitida.",
                409);
        }

        if (request.Status is AppointmentStatus.Completed or AppointmentStatus.NoShow &&
            appointment.StartsAt > DateTimeOffset.UtcNow)
        {
            return Result<AppointmentDto>.Failure(
                "Una cita futura no puede marcarse como completada o no asistida.",
                409);
        }

        appointment.Status = request.Status;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _appointments.GetByIdWithDetailsAsync(request.AppointmentId, cancellationToken);
        if (updated is null)
        {
            return Result<AppointmentDto>.NotFound("La cita ya no está disponible.");
        }

        return Result<AppointmentDto>.Success(new AppointmentDto(
            updated.Id,
            updated.PatientId,
            updated.Patient.FullName,
            updated.DoctorId,
            updated.Doctor.FullName,
            updated.StartsAt,
            updated.StartsAt.AddMinutes(updated.DurationMinutes),
            updated.DurationMinutes,
            updated.Reason,
            updated.Status));
    }

    private static bool IsTransitionAllowed(AppointmentStatus current, AppointmentStatus next)
    {
        return current switch
        {
            AppointmentStatus.Scheduled => next is AppointmentStatus.Confirmed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow,
            AppointmentStatus.Confirmed => next is AppointmentStatus.Completed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow,
            _ => false
        };
    }
}