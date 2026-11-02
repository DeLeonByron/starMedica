using FluentValidation;

namespace StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;

public sealed class ReceiveStockCommandValidator : AbstractValidator<ReceiveStockCommand>
{
    public ReceiveStockCommandValidator()
    {
        RuleFor(command => command.MedicineId).GreaterThan(0);
        RuleFor(command => command.BatchNumber).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Quantity).GreaterThan(0m).LessThanOrEqualTo(1_000_000m);
        RuleFor(command => command.PerformedById).GreaterThan(0);
        RuleFor(command => command.Reference).MaximumLength(100);
    }
}