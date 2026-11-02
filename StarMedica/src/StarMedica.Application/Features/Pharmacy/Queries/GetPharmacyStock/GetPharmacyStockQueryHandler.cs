using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetPharmacyStock;

public sealed class GetPharmacyStockQueryHandler : IRequestHandler<GetPharmacyStockQuery, Result<IReadOnlyList<MedicineBatchDto>>>
{
    private readonly IPharmacyRepository _pharmacy;

    public GetPharmacyStockQueryHandler(IPharmacyRepository pharmacy)
    {
        _pharmacy = pharmacy;
    }

    public async Task<Result<IReadOnlyList<MedicineBatchDto>>> Handle(
        GetPharmacyStockQuery request,
        CancellationToken cancellationToken)
    {
        var batches = await _pharmacy.GetStockAsync(cancellationToken);
        var records = batches.Select(batch => new MedicineBatchDto(
            batch.Id,
            batch.MedicineId,
            batch.Medicine.Name,
            batch.Medicine.Code,
            batch.BatchNumber,
            batch.ExpiresOn,
            batch.QuantityAvailable,
            batch.Medicine.StockUnit)).ToArray();
        return Result<IReadOnlyList<MedicineBatchDto>>.Success(records);
    }
}