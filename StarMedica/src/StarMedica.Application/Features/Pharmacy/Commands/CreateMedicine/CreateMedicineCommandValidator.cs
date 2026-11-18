using FluentValidation;

namespace StarMedica.Application.Features.Pharmacy.Commands.CreateMedicine;

public sealed class CreateMedicineCommandValidator : AbstractValidator<CreateMedicineCommand>
{
    public CreateMedicineCommandValidator()
    {
        RuleFor(command => command.Code)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El código del medicamento es obligatorio.")
            .MaximumLength(40);
        RuleFor(command => command.Name)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El nombre del medicamento es obligatorio.")
            .MaximumLength(200);
        RuleFor(command => command.ActiveIngredient)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El principio activo es obligatorio.")
            .MaximumLength(200);
        RuleFor(command => command.Strength)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("La concentración es obligatoria.")
            .MaximumLength(100);
        RuleFor(command => command.DosageForm)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("La forma farmacéutica es obligatoria.")
            .MaximumLength(100);
        RuleFor(command => command.StockUnit)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("La unidad de inventario es obligatoria.")
            .MaximumLength(40);
        RuleFor(command => command.ReorderLevel)
            .InclusiveBetween(0m, 1_000_000m)
            .Must(value => decimal.Round(value, 3) == value)
            .WithMessage("El mínimo de reposición admite hasta tres decimales.");
    }
}