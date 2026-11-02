using MediatR;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Commands.DispenseStock;

public sealed record DispenseStockCommand(
    int MedicineId,
    decimal Quantity,
    int PerformedById,
    int PatientId,
    int? ConsultationId,
    string? Reference) : IRequest<Result<bool>>;