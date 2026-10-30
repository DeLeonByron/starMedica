using FluentValidation;

namespace StarMedica.Application.Features.Consultations.Commands.CreateConsultation;

public sealed class CreateConsultationCommandValidator : AbstractValidator<CreateConsultationCommand>
{
    public CreateConsultationCommandValidator()
    {
        RuleFor(command => command.PatientId).GreaterThan(0);
        RuleFor(command => command.DoctorId).GreaterThan(0);
        RuleFor(command => command.ChiefComplaint).NotEmpty().MaximumLength(300);
        RuleFor(command => command.PresentIllness).NotEmpty().MaximumLength(2000);
        RuleFor(command => command.PhysicalExam).NotEmpty().MaximumLength(5000);
        RuleFor(command => command.DiagnosisCode)
            .NotEmpty()
            .Matches("^[A-Z][0-9][0-9A-Z](\\.[0-9A-Z]{1,4})?$")
            .WithMessage("El código diagnóstico no tiene un formato CIE-10 válido.");
        RuleFor(command => command.DiagnosisDescription).NotEmpty().MaximumLength(500);
        RuleFor(command => command.TreatmentPlan).NotEmpty().MaximumLength(3000);
        RuleFor(command => command.Notes).MaximumLength(2000);
        RuleFor(command => command.WeightKg).InclusiveBetween(0.1m, 200m).When(command => command.WeightKg.HasValue);
        RuleFor(command => command.HeightCm).InclusiveBetween(20m, 250m).When(command => command.HeightCm.HasValue);
        RuleFor(command => command.TemperatureCelsius).InclusiveBetween(30m, 45m).When(command => command.TemperatureCelsius.HasValue);
        RuleFor(command => command.HeartRateBpm).InclusiveBetween(20, 250).When(command => command.HeartRateBpm.HasValue);
        RuleFor(command => command.RespiratoryRatePerMinute).InclusiveBetween(5, 100)
            .When(command => command.RespiratoryRatePerMinute.HasValue);
        RuleFor(command => command.SystolicBloodPressure).InclusiveBetween(40, 250)
            .When(command => command.SystolicBloodPressure.HasValue);
        RuleFor(command => command.DiastolicBloodPressure).InclusiveBetween(20, 150)
            .When(command => command.DiastolicBloodPressure.HasValue);
        RuleFor(command => command.OxygenSaturationPercent).InclusiveBetween(50, 100)
            .When(command => command.OxygenSaturationPercent.HasValue);
        RuleFor(command => command)
            .Must(command => command.SystolicBloodPressure.HasValue == command.DiastolicBloodPressure.HasValue)
            .WithMessage("Debe registrar ambos valores de presión arterial o ninguno.");
        RuleFor(command => command)
            .Must(command => !command.SystolicBloodPressure.HasValue ||
                command.DiastolicBloodPressure < command.SystolicBloodPressure)
            .WithMessage("La presión diastólica debe ser menor que la sistólica.");
    }
}