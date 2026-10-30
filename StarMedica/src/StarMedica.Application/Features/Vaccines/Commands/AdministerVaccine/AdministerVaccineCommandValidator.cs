using FluentValidation;

namespace StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;

public sealed class AdministerVaccineCommandValidator : AbstractValidator<AdministerVaccineCommand>
{
    public AdministerVaccineCommandValidator()
    {
        RuleFor(command => command.PatientId).GreaterThan(0);
        RuleFor(command => command.VaccineId).GreaterThan(0);
        RuleFor(command => command.AdministeredById).GreaterThan(0);
        RuleFor(command => command.DoseNumber).InclusiveBetween(1, 10);
        RuleFor(command => command.LotNumber).NotEmpty().MaximumLength(100);
        RuleFor(command => command.AdverseEventNotes).MaximumLength(2000);
    }
}