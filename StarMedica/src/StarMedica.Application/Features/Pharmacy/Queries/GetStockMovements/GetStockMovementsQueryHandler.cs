using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetStockMovements;

public sealed class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, Result<IReadOnlyList<StockMovementDto>>>
{
    private readonly IPharmacyRepository _pharmacy;

    public GetStockMovementsQueryHandler(IPharmacyRepository pharmacy)
    {
        _pharmacy = pharmacy;
    }

    public async Task<Result<IReadOnlyList<StockMovementDto>>> Handle(
        GetStockMovementsQuery request,
        CancellationToken cancellationToken)
    {
        var movements = await _pharmacy.GetRecentMovementsAsync(cancellationToken);
        var records = movements.Select(movement => new StockMovementDto(
            movement.Id,
            movement.MedicineBatch.Medicine.Name,
            movement.MedicineBatch.BatchNumber,
            movement.Type,
            movement.Quantity,
            movement.OccurredAt,
            movement.PerformedBy.FullName,
            movement.PatientId,
            movement.Patient?.FullName,
            movement.ConsultationId,
            movement.Reference,
            movement.Notes)).ToArray();
        return Result<IReadOnlyList<StockMovementDto>>.Success(records);
    }
}