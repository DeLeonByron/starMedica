using FluentValidation;

namespace StarMedica.Application.Features.Appointments.Commands.CreateAppointment;

public sealed class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(command => command.PatientId).GreaterThan(0);
        RuleFor(command => command.DoctorId).GreaterThan(0);
        RuleFor(command => command.DurationMinutes)
            .Must(duration => duration is 15 or 30 or 45 or 60)
            .WithMessage("La duración debe ser de 15, 30, 45 o 60 minutos.");
        RuleFor(command => command.Reason).NotEmpty().MaximumLength(500);
    }
}