using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetMedicines;

public sealed class GetMedicinesQueryHandler : IRequestHandler<GetMedicinesQuery, Result<IReadOnlyList<MedicineDto>>>
{
    private readonly IRepository<Medicine> _medicines;

    public GetMedicinesQueryHandler(IRepository<Medicine> medicines)
    {
        _medicines = medicines;
    }

    public async Task<Result<IReadOnlyList<MedicineDto>>> Handle(
        GetMedicinesQuery request,
        CancellationToken cancellationToken)
    {
        var medicines = await _medicines.GetAllAsync(cancellationToken);
        var records = medicines
            .Where(medicine => medicine.IsActive)
            .OrderBy(medicine => medicine.Name)
            .Select(medicine => new MedicineDto(
                medicine.Id,
                medicine.Code,
                medicine.Name,
                medicine.ActiveIngredient,
                medicine.Strength,
                medicine.DosageForm,
                medicine.StockUnit,
                medicine.ReorderLevel))
            .ToArray();
        return Result<IReadOnlyList<MedicineDto>>.Success(records);
    }
}