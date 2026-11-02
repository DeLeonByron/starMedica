using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Commands.CreateMedicine;

public sealed class CreateMedicineCommandHandler : IRequestHandler<CreateMedicineCommand, Result<MedicineDto>>
{
    private readonly IPharmacyRepository _pharmacy;
    private readonly IValidator<CreateMedicineCommand> _validator;

    public CreateMedicineCommandHandler(IPharmacyRepository pharmacy, IValidator<CreateMedicineCommand> validator)
    {
        _pharmacy = pharmacy;
        _validator = validator;
    }

    public async Task<Result<MedicineDto>> Handle(CreateMedicineCommand request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<MedicineDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        var medicine = new Medicine
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            ActiveIngredient = request.ActiveIngredient.Trim(),
            Strength = request.Strength.Trim(),
            DosageForm = request.DosageForm.Trim(),
            StockUnit = request.StockUnit.Trim(),
            ReorderLevel = request.ReorderLevel,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        if (!await _pharmacy.TryAddMedicineAsync(medicine, cancellationToken))
        {
            return Result<MedicineDto>.Failure("Ya existe un medicamento con ese código.", 409);
        }

        return Result<MedicineDto>.Created(new MedicineDto(
            medicine.Id,
            medicine.Code,
            medicine.Name,
            medicine.ActiveIngredient,
            medicine.Strength,
            medicine.DosageForm,
            medicine.StockUnit,
            medicine.ReorderLevel));
    }
}