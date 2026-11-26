using StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class AdministerVaccineCommandHandlerTests
{
    [Theory]
    [InlineData(2020, 1, 1, 5, 59, 2019, 12, 31)]
    [InlineData(2020, 1, 1, 6, 0, 2020, 1, 1)]
    public async Task Handler_RejectsExpiryOnGuatemalaAdministrationDateBeforePersistence(
        int utcYear,
        int utcMonth,
        int utcDay,
        int utcHour,
        int utcMinute,
        int expiryYear,
        int expiryMonth,
        int expiryDay)
    {
        var repository = new CapturingVaccinationRepository();
        var handler = new AdministerVaccineCommandHandler(repository, new AdministerVaccineCommandValidator());
        var administeredAt = new DateTimeOffset(utcYear, utcMonth, utcDay, utcHour, utcMinute, 0, TimeSpan.Zero);
        var expiresOn = new DateOnly(expiryYear, expiryMonth, expiryDay);
        var command = new AdministerVaccineCommand(
            PatientId: 1,
            VaccineId: 1,
            AdministeredById: 2,
            DoseNumber: 1,
            AdministeredAt: administeredAt,
            LotNumber: "LOT-001",
            ExpiresOn: expiresOn,
            AdverseEventNotes: null);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal(0, repository.AdministrationCalls);
    }

    private sealed class CapturingVaccinationRepository : IVaccinationRepository
    {
        public int AdministrationCalls { get; private set; }

        public Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public Task<IReadOnlyList<Vaccine>> GetActiveVaccinesAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Vaccine>>([]);

        public Task<bool> VaccineCodeExistsAsync(string code, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<bool> TryAddVaccineAsync(Vaccine vaccine, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<PatientVaccination?> GetByIdWithDetailsAsync(
            int id,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<PatientVaccination?>(null);

        public Task<VaccinationCreateOutcome> TryAdministerAsync(
            PatientVaccination vaccination,
            CancellationToken cancellationToken = default)
        {
            AdministrationCalls++;
            return Task.FromResult(VaccinationCreateOutcome.Created);
        }

        public Task<IReadOnlyList<PatientVaccination>> GetPatientHistoryAsync(
            int patientId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<PatientVaccination>>([]);
    }
}
