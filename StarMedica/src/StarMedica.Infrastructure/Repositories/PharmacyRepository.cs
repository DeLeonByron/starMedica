using System.Data;
using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class PharmacyRepository : IPharmacyRepository
{
    private static readonly TimeSpan GuatemalaOffset = TimeSpan.FromHours(-6);
    private readonly AppDbContext _context;

    public PharmacyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Patient>> GetActivePatientsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Patients
            .AsNoTracking()
            .Where(patient => patient.IsActive)
            .OrderBy(patient => patient.FullName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Medicine>> GetActiveMedicinesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Medicines
            .AsNoTracking()
            .Where(medicine => medicine.IsActive)
            .OrderBy(medicine => medicine.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> TryAddMedicineAsync(Medicine medicine, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var exists = await _context.Medicines.AnyAsync(
            candidate => candidate.Code == medicine.Code,
            cancellationToken);
        if (exists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return false;
        }

        await _context.Medicines.AddAsync(medicine, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<MedicineBatch>> GetStockAsync(CancellationToken cancellationToken = default)
    {
        return await _context.MedicineBatches
            .AsNoTracking()
            .Include(batch => batch.Medicine)
            .Where(batch => batch.Medicine.IsActive)
            .OrderBy(batch => batch.Medicine.Name)
            .ThenBy(batch => batch.ExpiresOn)
            .ThenBy(batch => batch.ReceivedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetRecentMovementsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.StockMovements
            .AsNoTracking()
            .Include(movement => movement.MedicineBatch)
                .ThenInclude(batch => batch.Medicine)
            .Include(movement => movement.PerformedBy)
            .Include(movement => movement.Patient)
            .OrderByDescending(movement => movement.OccurredAt)
            .ThenByDescending(movement => movement.Id)
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<StockOperationOutcome> TryReceiveAsync(
        MedicineBatch batch,
        int performedById,
        string? reference,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var medicineExists = await _context.Medicines.AnyAsync(
            medicine => medicine.Id == batch.MedicineId && medicine.IsActive,
            cancellationToken);
        if (!medicineExists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.MedicineUnavailable;
        }

        var operatorIsAuthorized = await IsPharmacyOperatorAsync(performedById, cancellationToken);
        if (!operatorIsAuthorized)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.OperatorUnavailable;
        }

        var batchExists = await _context.MedicineBatches.AnyAsync(
            existing => existing.MedicineId == batch.MedicineId && existing.BatchNumber == batch.BatchNumber,
            cancellationToken);
        if (batchExists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.BatchAlreadyExists;
        }

        batch.ReceivedAt = DateTimeOffset.UtcNow;
        await _context.MedicineBatches.AddAsync(batch, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await _context.StockMovements.AddAsync(new StockMovement
        {
            MedicineBatchId = batch.Id,
            Type = StockMovementType.Received,
            Quantity = batch.QuantityAvailable,
            OccurredAt = DateTimeOffset.UtcNow,
            PerformedById = performedById,
            Reference = string.IsNullOrWhiteSpace(reference) ? null : reference.Trim(),
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return StockOperationOutcome.Completed;
    }

    public async Task<StockOperationOutcome> TryDispenseFefoAsync(
        int medicineId,
        decimal quantity,
        int performedById,
        int patientId,
        int? consultationId,
        string? reference,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var medicineExists = await _context.Medicines.AnyAsync(
            medicine => medicine.Id == medicineId && medicine.IsActive,
            cancellationToken);
        if (!medicineExists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.MedicineUnavailable;
        }

        var patientExists = await _context.Patients.AnyAsync(
            patient => patient.Id == patientId && patient.IsActive,
            cancellationToken);
        if (!patientExists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.PatientUnavailable;
        }

        var operatorIsAuthorized = await IsPharmacyOperatorAsync(performedById, cancellationToken);
        if (!operatorIsAuthorized)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.OperatorUnavailable;
        }

        if (consultationId is int id && !await _context.Consultations.AnyAsync(
            consultation => consultation.Id == id && consultation.PatientId == patientId,
            cancellationToken))
        {
            await transaction.RollbackAsync(cancellationToken);
            return StockOperationOutcome.ConsultationMismatch;
        }

        var todayInGuatemala = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(GuatemalaOffset).DateTime);
        var batches = await _context.MedicineBatches
            .Where(batch => batch.MedicineId == medicineId &&
                batch.QuantityAvailable > 0 &&
                batch.ExpiresOn > todayInGuatemala)
            .OrderBy(batch => batch.ExpiresOn)
            .ThenBy(batch => batch.ReceivedAt)
            .ToListAsync(cancellationToken);

        if (batches.Sum(batch => batch.QuantityAvailable) < quantity)
        {
            await transaction.RollbackAsync(cancellationToken);
            return batches.Count == 0
                ? StockOperationOutcome.NoEligibleBatch
                : StockOperationOutcome.InsufficientStock;
        }

        var remaining = quantity;
        foreach (var batch in batches)
        {
            if (remaining <= 0)
            {
                break;
            }

            var dispensedFromBatch = Math.Min(batch.QuantityAvailable, remaining);
            batch.QuantityAvailable -= dispensedFromBatch;
            remaining -= dispensedFromBatch;
            await _context.StockMovements.AddAsync(new StockMovement
            {
                MedicineBatchId = batch.Id,
                Type = StockMovementType.Dispensed,
                Quantity = dispensedFromBatch,
                OccurredAt = DateTimeOffset.UtcNow,
                PerformedById = performedById,
                PatientId = patientId,
                ConsultationId = consultationId,
                Reference = string.IsNullOrWhiteSpace(reference) ? null : reference.Trim(),
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return StockOperationOutcome.Completed;
    }

    private Task<bool> IsPharmacyOperatorAsync(int userId, CancellationToken cancellationToken)
    {
        return _context.UserRoles.AnyAsync(
            userRole => userRole.UserId == userId &&
                userRole.User.IsActive &&
                userRole.Role.IsActive &&
                (userRole.Role.Name == "Farmacéutico" || userRole.Role.Name == "SuperAdmin"),
            cancellationToken);
    }
}