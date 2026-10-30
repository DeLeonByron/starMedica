using FluentValidation;

namespace StarMedica.Application.Features.Vaccines.Commands.CreateVaccine;

public sealed class CreateVaccineCommandValidator : AbstractValidator<CreateVaccineCommand>
{
    public CreateVaccineCommandValidator()
    {
        RuleFor(command => command.Code)
            .NotEmpty()
            .Matches("^[A-Z0-9][A-Z0-9.-]{1,19}$")
            .WithMessage("El código solo puede contener letras, números, punto y guion.");
        RuleFor(command => command.Name).NotEmpty().MaximumLength(150);
        RuleFor(command => command.TargetDisease).NotEmpty().MaximumLength(300);
        RuleFor(command => command.DosesRequired).InclusiveBetween(1, 10);
    }
}