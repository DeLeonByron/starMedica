using FluentValidation;

namespace StarMedica.Application.Features.Pharmacy.Commands.CreateMedicine;

public sealed class CreateMedicineCommandValidator : AbstractValidator<CreateMedicineCommand>
{
    public CreateMedicineCommandValidator()
    {
        RuleFor(command => command.Code).NotEmpty().MaximumLength(40);
        RuleFor(command => command.Name).NotEmpty().MaximumLength(200);
        RuleFor(command => command.ActiveIngredient).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Strength).NotEmpty().MaximumLength(100);
        RuleFor(command => command.DosageForm).NotEmpty().MaximumLength(100);
        RuleFor(command => command.StockUnit).NotEmpty().MaximumLength(40);
        RuleFor(command => command.ReorderLevel).InclusiveBetween(0m, 1_000_000m);
    }
}