using StarMedica.Application.Features.Appointments.Commands.CreateAppointment;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class CreateAppointmentCommandHandlerTests
{
    [Fact]
    public async Task Handler_RejectsPastAppointmentBeforeCheckingAvailability()
    {
        var repository = new CapturingAppointmentRepository();
        var handler = new CreateAppointmentCommandHandler(repository, new CreateAppointmentCommandValidator());
        var command = CreateCommand(DateTimeOffset.UtcNow.AddMinutes(-1));

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal(0, repository.PatientAvailabilityChecks);
        Assert.Equal(0, repository.DoctorAvailabilityChecks);
        Assert.Null(repository.ScheduledAppointment);
    }

    [Fact]
    public async Task Handler_NormalizesStartTimeAndReasonBeforeScheduling()
    {
        var repository = new CapturingAppointmentRepository();
        var handler = new CreateAppointmentCommandHandler(repository, new CreateAppointmentCommandValidator());
        var startsAt = DateTimeOffset.UtcNow.AddHours(1).ToOffset(TimeSpan.FromHours(2));

        var result = await handler.Handle(CreateCommand(startsAt), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(repository.ScheduledAppointment);
        Assert.Equal(startsAt.ToUniversalTime(), repository.ScheduledAppointment.StartsAt);
        Assert.Equal("Control", repository.ScheduledAppointment.Reason);
        Assert.Equal(startsAt.ToUniversalTime(), result.Value?.StartsAt);
        Assert.Equal(startsAt.ToUniversalTime().AddMinutes(30), result.Value?.EndsAt);
    }

    private static CreateAppointmentCommand CreateCommand(DateTimeOffset startsAt) =>
        new(1, 2, startsAt, 30, "  Control  ");

    private sealed class CapturingAppointmentRepository : IAppointmentRepository
    {
        public int PatientAvailabilityChecks { get; private set; }
        public int DoctorAvailabilityChecks { get; private set; }
        public Appointment? ScheduledAppointment { get; private set; }

        public Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default)
        {
            PatientAvailabilityChecks++;
            return Task.FromResult(true);
        }

        public Task<bool> IsActiveDoctorAsync(int doctorId, CancellationToken cancellationToken = default)
        {
            DoctorAvailabilityChecks++;
            return Task.FromResult(true);
        }

        public Task<bool> TryScheduleAsync(Appointment appointment, CancellationToken cancellationToken = default)
        {
            appointment.Id = 42;
            appointment.Patient = new Patient { FullName = "Paciente de prueba" };
            appointment.Doctor = new User { FullName = "Médico de prueba" };
            ScheduledAppointment = appointment;
            return Task.FromResult(true);
        }

        public Task<Appointment?> GetByIdWithDetailsAsync(
            int appointmentId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(ScheduledAppointment);

        public Task<IReadOnlyList<Appointment>> GetBetweenAsync(
            DateTimeOffset from,
            DateTimeOffset to,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Appointment>>([]);

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
