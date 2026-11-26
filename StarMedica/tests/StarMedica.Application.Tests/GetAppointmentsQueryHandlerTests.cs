using StarMedica.Application.Features.Appointments.Queries.GetAppointments;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class GetAppointmentsQueryHandlerTests
{
    [Fact]
    public async Task Handler_AcceptsExactlyThirtyOneDaysAndNormalizesRangeToUtc()
    {
        var repository = new CapturingAppointmentRepository();
        var handler = new GetAppointmentsQueryHandler(repository);
        var from = new DateTimeOffset(2026, 11, 1, 0, 0, 0, TimeSpan.FromHours(-6));
        var to = from.AddDays(31);

        var result = await handler.Handle(new GetAppointmentsQuery(from, to), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, repository.QueryCount);
        Assert.Equal(from.ToUniversalTime(), repository.From);
        Assert.Equal(to.ToUniversalTime(), repository.To);
    }

    [Fact]
    public async Task Handler_RejectsRangeLongerThanThirtyOneDaysWithoutQueryingRepository()
    {
        var repository = new CapturingAppointmentRepository();
        var handler = new GetAppointmentsQueryHandler(repository);
        var from = new DateTimeOffset(2026, 11, 1, 0, 0, 0, TimeSpan.Zero);
        var to = from.AddDays(31).AddTicks(1);

        var result = await handler.Handle(new GetAppointmentsQuery(from, to), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal(0, repository.QueryCount);
    }

    private sealed class CapturingAppointmentRepository : IAppointmentRepository
    {
        public int QueryCount { get; private set; }
        public DateTimeOffset? From { get; private set; }
        public DateTimeOffset? To { get; private set; }

        public Task<IReadOnlyList<Appointment>> GetBetweenAsync(
            DateTimeOffset from,
            DateTimeOffset to,
            CancellationToken cancellationToken = default)
        {
            QueryCount++;
            From = from;
            To = to;
            return Task.FromResult<IReadOnlyList<Appointment>>([]);
        }

        public Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public Task<bool> IsActiveDoctorAsync(int doctorId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public Task<bool> TryScheduleAsync(Appointment appointment, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<Appointment?> GetByIdWithDetailsAsync(
            int appointmentId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<Appointment?>(null);

        public Task<IReadOnlyList<Patient>> GetActivePatientsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Patient>>([]);

        public Task<IReadOnlyList<User>> GetActiveDoctorsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<User>>([]);

        public Task<IReadOnlyList<Appointment>> GetAvailableForConsultationAsync(
            int patientId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Appointment>>([]);

        public Task<Appointment?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<Appointment?>(null);

        public Task<IReadOnlyList<Appointment>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Appointment>>([]);

        public Task AddAsync(Appointment entity, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public void Update(Appointment entity) { }

        public void Delete(Appointment entity) { }
    }
}
