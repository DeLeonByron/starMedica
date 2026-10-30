using StarMedica.Domain.Entities;

namespace StarMedica.Domain.Interfaces;

public interface IAppointmentRepository : IRepository<Appointment>
{
    Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default);
    Task<bool> IsActiveDoctorAsync(int doctorId, CancellationToken cancellationToken = default);
    Task<bool> TryScheduleAsync(Appointment appointment, CancellationToken cancellationToken = default);
    Task<Appointment?> GetByIdWithDetailsAsync(int appointmentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Appointment>> GetBetweenAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Patient>> GetActivePatientsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetActiveDoctorsAsync(CancellationToken cancellationToken = default);
}