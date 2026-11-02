using FluentValidation;
using MediatR;
using StarMedica.Domain.Common;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Commands.DispenseStock;

public sealed class DispenseStockCommandHandler : IRequestHandler<DispenseStockCommand, Result<bool>>
{
    private readonly IPharmacyRepository _pharmacy;
    private readonly IValidator<DispenseStockCommand> _validator;

    public DispenseStockCommandHandler(IPharmacyRepository pharmacy, IValidator<DispenseStockCommand> validator)
    {
        _pharmacy = pharmacy;
        _validator = validator;
    }

    public async Task<Result<bool>> Handle(DispenseStockCommand request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<bool>.Failure(string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)), 400);
        }

        var outcome = await _pharmacy.TryDispenseFefoAsync(
            request.MedicineId,
            request.Quantity,
            request.PerformedById,
            request.PatientId,
            request.ConsultationId,
            request.Reference,
            cancellationToken);

        return outcome switch
        {
            StockOperationOutcome.Completed => Result<bool>.Success(true),
            StockOperationOutcome.MedicineUnavailable => Result<bool>.NotFound("El medicamento no existe o está inactivo."),
            StockOperationOutcome.PatientUnavailable => Result<bool>.NotFound("El paciente no existe o está inactivo."),
            StockOperationOutcome.OperatorUnavailable => Result<bool>.Failure("El usuario no tiene permisos de farmacia.", 403),
            StockOperationOutcome.ConsultationMismatch => Result<bool>.Failure("La consulta no corresponde al paciente.", 400),
            StockOperationOutcome.InsufficientStock => Result<bool>.Failure("No hay suficiente cantidad en lotes vigentes.", 409),
            StockOperationOutcome.NoEligibleBatch => Result<bool>.Failure("No hay lotes vigentes disponibles.", 409),
            _ => Result<bool>.Failure("No se pudo dispensar el medicamento.", 500)
        };
    }
}