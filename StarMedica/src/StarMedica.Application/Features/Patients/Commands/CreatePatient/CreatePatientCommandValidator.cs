using FluentValidation;

namespace StarMedica.Application.Features.Patients.Commands.CreatePatient;

public sealed class CreatePatientCommandValidator : AbstractValidator<CreatePatientCommand>
{
    public CreatePatientCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El código del paciente es obligatorio.")
            .MaximumLength(50);

        RuleFor(x => x.FullName)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El nombre completo es obligatorio.")
            .MaximumLength(200);

        RuleFor(x => x.DocumentNumber)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El documento del paciente es obligatorio.")
            .MaximumLength(50);

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .MaximumLength(200);

        RuleFor(x => x.Phone)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("El teléfono del paciente es obligatorio.")
            .MaximumLength(25);

        RuleFor(x => x.Address)
            .MaximumLength(500);
    }
}
