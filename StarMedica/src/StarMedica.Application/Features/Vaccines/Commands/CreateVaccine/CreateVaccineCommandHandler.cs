using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Vaccines.Commands.CreateVaccine;

public sealed class CreateVaccineCommandHandler : IRequestHandler<CreateVaccineCommand, Result<VaccineDto>>
{
    private readonly IVaccinationRepository _vaccinations;
    private readonly IValidator<CreateVaccineCommand> _validator;

    public CreateVaccineCommandHandler(
        IVaccinationRepository vaccinations,
        IValidator<CreateVaccineCommand> validator)
    {
        _vaccinations = vaccinations;
        _validator = validator;
    }

    public async Task<Result<VaccineDto>> Handle(
        CreateVaccineCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<VaccineDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        var vaccine = new Vaccine
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            TargetDisease = request.TargetDisease.Trim(),
            DosesRequired = request.DosesRequired,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        if (!await _vaccinations.TryAddVaccineAsync(vaccine, cancellationToken))
        {
            return Result<VaccineDto>.Failure("Ya existe una vacuna con ese código.", 409);
        }

        return Result<VaccineDto>.Created(new VaccineDto(
            vaccine.Id,
            vaccine.Code,
            vaccine.Name,
            vaccine.TargetDisease,
            vaccine.DosesRequired,
            vaccine.IsActive));
    }
}