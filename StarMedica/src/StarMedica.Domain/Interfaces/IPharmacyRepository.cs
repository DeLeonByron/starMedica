using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;

namespace StarMedica.Domain.Interfaces;

public interface IPharmacyRepository
{
    Task<IReadOnlyList<Patient>> GetActivePatientsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Medicine>> GetActiveMedicinesAsync(CancellationToken cancellationToken = default);
    Task<bool> TryAddMedicineAsync(Medicine medicine, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MedicineBatch>> GetStockAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockMovement>> GetRecentMovementsAsync(CancellationToken cancellationToken = default);
    Task<StockOperationOutcome> TryReceiveAsync(
        MedicineBatch batch,
        int performedById,
        string? reference,
        CancellationToken cancellationToken = default);
    Task<StockOperationOutcome> TryDispenseFefoAsync(
        int medicineId,
        decimal quantity,
        int performedById,
        int patientId,
        int? consultationId,
        string? reference,
        CancellationToken cancellationToken = default);
}