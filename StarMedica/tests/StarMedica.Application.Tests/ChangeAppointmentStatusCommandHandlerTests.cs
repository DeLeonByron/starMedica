using StarMedica.Application.Features.Appointments.Commands.ChangeAppointmentStatus;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class ChangeAppointmentStatusCommandHandlerTests
{
    [Theory]
    [InlineData(AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.NoShow)]
    public async Task Handler_RejectsClosingFutureAppointmentWithoutSaving(AppointmentStatus nextStatus)
    {
        var repository = new CapturingAppointmentRepository(CreateAppointment(
            AppointmentStatus.Confirmed,
            DateTimeOffset.UtcNow.AddMinutes(30)));
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new ChangeAppointmentStatusCommandHandler(repository, unitOfWork);

        var result = await handler.Handle(
            new ChangeAppointmentStatusCommand(12, nextStatus),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(409, result.StatusCode);
        Assert.Equal(0, unitOfWork.SaveChangesCount);
        Assert.Equal(AppointmentStatus.Confirmed, repository.Appointment.Status);
    }

    [Fact]
    public async Task Handler_CompletesPastConfirmedAppointment()
    {
        var repository = new CapturingAppointmentRepository(CreateAppointment(
            AppointmentStatus.Confirmed,
            DateTimeOffset.UtcNow.AddMinutes(-30)));
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new ChangeAppointmentStatusCommandHandler(repository, unitOfWork);

        var result = await handler.Handle(
            new ChangeAppointmentStatusCommand(12, AppointmentStatus.Completed),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, unitOfWork.SaveChangesCount);
        Assert.Equal(AppointmentStatus.Completed, repository.Appointment.Status);
        Assert.Equal(AppointmentStatus.Completed, result.Value?.Status);
    }

    [Theory]
    [InlineData(AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.Cancelled)]
    [InlineData(AppointmentStatus.NoShow)]
    public async Task Handler_DoesNotReopenTerminalAppointment(AppointmentStatus currentStatus)
    {
        var repository = new CapturingAppointmentRepository(CreateAppointment(
            currentStatus,
            DateTimeOffset.UtcNow.AddHours(-1)));
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new ChangeAppointmentStatusCommandHandler(repository, unitOfWork);

        var result = await handler.Handle(
            new ChangeAppointmentStatusCommand(12, AppointmentStatus.Scheduled),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(409, result.StatusCode);
        Assert.Equal(0, unitOfWork.SaveChangesCount);
        Assert.Equal(currentStatus, repository.Appointment.Status);
    }

    [Fact]
    public async Task Handler_ConfirmsScheduledAppointment()
    {
        var repository = new CapturingAppointmentRepository(CreateAppointment(
            AppointmentStatus.Scheduled,
            DateTimeOffset.UtcNow.AddHours(1)));
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new ChangeAppointmentStatusCommandHandler(repository, unitOfWork);

        var result = await handler.Handle(
            new ChangeAppointmentStatusCommand(12, AppointmentStatus.Confirmed),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, unitOfWork.SaveChangesCount);
        Assert.Equal(AppointmentStatus.Confirmed, repository.Appointment.Status);
        Assert.Equal(AppointmentStatus.Confirmed, result.Value?.Status);
    }

    private static Appointment CreateAppointment(AppointmentStatus status, DateTimeOffset startsAt) =>
        new()
        {
            Id = 12,
            PatientId = 3,
            Patient = new Patient { FullName = "Paciente de prueba" },
            DoctorId = 7,
            Doctor = new User { FullName = "Médico de prueba" },
            StartsAt = startsAt,
            DurationMinutes = 30,
            Reason = "Control",
            Status = status
        };

    private sealed class CapturingAppointmentRepository : IAppointmentRepository
    {
        public CapturingAppointmentRepository(Appointment appointment)
        {
            Appointment = appointment;
        }

        public Appointment Appointment { get; }

        public Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public Task<bool> IsActiveDoctorAsync(int doctorId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public Task<bool> TryScheduleAsync(Appointment appointment, CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<Appointment?> GetByIdWithDetailsAsync(
            int appointmentId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<Appointment?>(appointmentId == Appointment.Id ? Appointment : null);

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

    private sealed class CapturingUnitOfWork : IUnitOfWork
    {
        public int SaveChangesCount { get; private set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCount++;
            return Task.FromResult(1);
        }
    }
}
