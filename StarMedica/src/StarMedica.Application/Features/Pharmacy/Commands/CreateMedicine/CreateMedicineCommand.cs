using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Commands.CreateMedicine;

public sealed record CreateMedicineCommand(
    string Code,
    string Name,
    string ActiveIngredient,
    string Strength,
    string DosageForm,
    string StockUnit,
    decimal ReorderLevel) : IRequest<Result<MedicineDto>>;