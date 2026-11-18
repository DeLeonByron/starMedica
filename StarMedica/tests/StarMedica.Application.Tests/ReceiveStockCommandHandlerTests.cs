using StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class ReceiveStockCommandHandlerTests
{
    [Fact]
    public async Task Handler_RejectsExpiredBatchWithoutWritingToRepository()
    {
        var repository = new CapturingPharmacyRepository();
        var handler = new ReceiveStockCommandHandler(repository, new ReceiveStockCommandValidator());
        var guatemalaToday = DateOnly.FromDateTime(
            DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-6)).DateTime);

        var result = await handler.Handle(CreateCommand(guatemalaToday.AddDays(-1)), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal(0, repository.ReceiveCalls);
        Assert.Null(repository.ReceivedBatch);
    }

    [Fact]
    public async Task Handler_ReceivesBatchWithFutureExpiry()
    {
        var repository = new CapturingPharmacyRepository();
        var handler = new ReceiveStockCommandHandler(repository, new ReceiveStockCommandValidator());
        var guatemalaToday = DateOnly.FromDateTime(
            DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-6)).DateTime);
        var expiryDate = guatemalaToday.AddDays(2);

        var result = await handler.Handle(CreateCommand(expiryDate), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, repository.ReceiveCalls);
        Assert.Equal(expiryDate, repository.ReceivedBatch?.ExpiresOn);
    }

    private static ReceiveStockCommand CreateCommand(DateOnly expiresOn) =>
        new(1, "LOT-001", expiresOn, 1m, 2, null);

    private sealed class CapturingPharmacyRepository : IPharmacyRepository
    {
        public int ReceiveCalls { get; private set; }
        public MedicineBatch? ReceivedBatch { get; private set; }

        public Task<IReadOnlyList<Patient>> GetActivePatientsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Patient>>([]);

        public Task<IReadOnlyList<Medicine>> GetActiveMedicinesAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Medicine>>([]);

        public Task<bool> TryAddMedicineAsync(Medicine medicine, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<IReadOnlyList<MedicineBatch>> GetStockAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<MedicineBatch>>([]);

        public Task<IReadOnlyList<StockMovement>> GetRecentMovementsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<StockMovement>>([]);

        public Task<StockOperationOutcome> TryReceiveAsync(
            MedicineBatch batch,
            int performedById,
            string? reference,
            CancellationToken cancellationToken = default)
        {
            ReceiveCalls++;
            ReceivedBatch = batch;
            return Task.FromResult(StockOperationOutcome.Completed);
        }

        public Task<StockOperationOutcome> TryDispenseFefoAsync(
            int medicineId,
            decimal quantity,
            int performedById,
            int patientId,
            int? consultationId,
            string? reference,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(StockOperationOutcome.Completed);
    }
}
