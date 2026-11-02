using FluentValidation;

namespace StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;

public sealed class CreateBillingDraftCommandValidator : AbstractValidator<CreateBillingDraftCommand>
{
    public CreateBillingDraftCommandValidator()
    {
        RuleFor(command => command.CustomerName)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El nombre del cliente es obligatorio.")
            .MaximumLength(200);
        RuleFor(command => command.CustomerNit).MaximumLength(20);
        RuleFor(command => command.CustomerAddress).MaximumLength(300);
        RuleFor(command => command.Notes).MaximumLength(500);
        RuleFor(command => command.CreatedBy).GreaterThan(0);
        RuleFor(command => command.Lines)
            .NotNull()
            .NotEmpty()
            .Must(lines => lines is { Count: <= 100 })
            .WithMessage("El borrador admite hasta 100 conceptos.");
        RuleForEach(command => command.Lines).ChildRules(line =>
        {
            line.RuleFor(item => item.Description)
                .NotEmpty()
                .Must(value => !string.IsNullOrWhiteSpace(value))
                .WithMessage("La descripción del concepto es obligatoria.")
                .MaximumLength(300);
            line.RuleFor(item => item.Quantity)
                .InclusiveBetween(0.001m, 100_000m)
                .Must(value => decimal.Round(value, 3) == value)
                .WithMessage("La cantidad debe tener como máximo tres decimales.");
            line.RuleFor(item => item.UnitPrice)
                .InclusiveBetween(0m, 100_000m)
                .Must(value => decimal.Round(value, 2) == value)
                .WithMessage("El precio debe tener como máximo dos decimales.");
        });
    }
}
