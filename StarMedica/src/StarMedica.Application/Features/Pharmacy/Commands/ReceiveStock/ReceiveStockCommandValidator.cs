using FluentValidation;

namespace StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;

public sealed class ReceiveStockCommandValidator : AbstractValidator<ReceiveStockCommand>
{
    public ReceiveStockCommandValidator()
    {
        RuleFor(command => command.MedicineId).GreaterThan(0);
        RuleFor(command => command.BatchNumber)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El número de lote es obligatorio.")
            .MaximumLength(100);
        RuleFor(command => command.Quantity)
            .GreaterThan(0m)
            .LessThanOrEqualTo(1_000_000m)
            .Must(value => decimal.Round(value, 3) == value)
            .WithMessage("La cantidad admite hasta tres decimales.");
        RuleFor(command => command.PerformedById).GreaterThan(0);
        RuleFor(command => command.Reference).MaximumLength(100);
    }
}