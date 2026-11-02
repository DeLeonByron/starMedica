using FluentValidation;

namespace StarMedica.Application.Features.Pharmacy.Commands.DispenseStock;

public sealed class DispenseStockCommandValidator : AbstractValidator<DispenseStockCommand>
{
    public DispenseStockCommandValidator()
    {
        RuleFor(command => command.MedicineId).GreaterThan(0);
        RuleFor(command => command.Quantity).GreaterThan(0m).LessThanOrEqualTo(1_000_000m);
        RuleFor(command => command.PerformedById).GreaterThan(0);
        RuleFor(command => command.PatientId).GreaterThan(0);
        RuleFor(command => command.ConsultationId).GreaterThan(0).When(command => command.ConsultationId.HasValue);
        RuleFor(command => command.Reference).MaximumLength(100);
    }
}