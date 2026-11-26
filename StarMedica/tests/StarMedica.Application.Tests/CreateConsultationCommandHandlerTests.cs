using StarMedica.Application.Features.Consultations.Commands.CreateConsultation;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class CreateConsultationCommandHandlerTests
{
    [Fact]
    public async Task Handler_RejectsConsultationMoreThanFiveMinutesInFutureBeforePersistence()
    {
        var repository = new CapturingConsultationRepository();
        var handler = new CreateConsultationCommandHandler(repository, new CreateConsultationCommandValidator());
        var command = CreateValidCommand() with { ConsultedAt = DateTimeOffset.UtcNow.AddMinutes(6) };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal(0, repository.CreateCalls);
    }

    private static CreateConsultationCommand CreateValidCommand() =>
        new(
            PatientId: 1,
            DoctorId: 2,
            AppointmentId: null,
            ConsultedAt: DateTimeOffset.UtcNow,
            ChiefComplaint: "Tos",
            PresentIllness: "Tos desde ayer",
            PhysicalExam: "Sin dificultad respiratoria",
            DiagnosisCode: "J06.9",
            DiagnosisDescription: "Infección respiratoria aguda",
            TreatmentPlan: "Hidratación y vigilancia",
            Notes: null,
            WeightKg: 20,
            HeightCm: 110,
            TemperatureCelsius: 37,
            HeartRateBpm: 90,
            RespiratoryRatePerMinute: 20,
            SystolicBloodPressure: 100,
            DiastolicBloodPressure: 65,
            OxygenSaturationPercent: 98);

    private sealed class CapturingConsultationRepository : IConsultationRepository
    {
        public int CreateCalls { get; private set; }

        public Task<Consultation?> GetByIdWithDetailsAsync(
            int consultationId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<Consultation?>(null);

        public Task<ConsultationCreateOutcome> TryCreateAsync(
            Consultation consultation,
            CancellationToken cancellationToken = default)
        {
            CreateCalls++;
            return Task.FromResult(ConsultationCreateOutcome.Created);
        }

        public Task<IReadOnlyList<Consultation>> GetPatientHistoryAsync(
            int patientId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Consultation>>([]);

        public Task<Consultation?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<Consultation?>(null);

        public Task<IReadOnlyList<Consultation>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Consultation>>([]);

        public Task AddAsync(Consultation entity, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public void Update(Consultation entity) { }

        public void Delete(Consultation entity) { }
    }
}
