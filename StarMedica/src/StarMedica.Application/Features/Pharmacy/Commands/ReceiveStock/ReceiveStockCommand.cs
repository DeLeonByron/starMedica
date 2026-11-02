using MediatR;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;

public sealed record ReceiveStockCommand(
    int MedicineId,
    string BatchNumber,
    DateOnly ExpiresOn,
    decimal Quantity,
    int PerformedById,
    string? Reference) : IRequest<Result<bool>>;