using FluentValidation;
using MediatR;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;

public sealed class ReceiveStockCommandHandler : IRequestHandler<ReceiveStockCommand, Result<bool>>
{
    private static readonly TimeSpan GuatemalaOffset = TimeSpan.FromHours(-6);
    private readonly IPharmacyRepository _pharmacy;
    private readonly IValidator<ReceiveStockCommand> _validator;

    public ReceiveStockCommandHandler(IPharmacyRepository pharmacy, IValidator<ReceiveStockCommand> validator)
    {
        _pharmacy = pharmacy;
        _validator = validator;
    }

    public async Task<Result<bool>> Handle(ReceiveStockCommand request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<bool>.Failure(string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)), 400);
        }

        var todayInGuatemala = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(GuatemalaOffset).DateTime);
        if (request.ExpiresOn <= todayInGuatemala)
        {
            return Result<bool>.Failure("No se puede recibir un lote vencido o que vence hoy.", 400);
        }

        var batch = new MedicineBatch
        {
            MedicineId = request.MedicineId,
            BatchNumber = request.BatchNumber.Trim(),
            ExpiresOn = request.ExpiresOn,
            QuantityAvailable = request.Quantity,
            ReceivedAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        var outcome = await _pharmacy.TryReceiveAsync(batch, request.PerformedById, request.Reference, cancellationToken);
        return outcome switch
        {
            StockOperationOutcome.Completed => Result<bool>.Created(true),
            StockOperationOutcome.MedicineUnavailable => Result<bool>.NotFound("El medicamento no existe o está inactivo."),
            StockOperationOutcome.BatchAlreadyExists => Result<bool>.Failure("Ese lote ya está registrado para el medicamento.", 409),
            StockOperationOutcome.OperatorUnavailable => Result<bool>.Failure("El usuario no tiene permisos de farmacia.", 403),
            _ => Result<bool>.Failure("No se pudo recibir el lote.", 500)
        };
    }
}