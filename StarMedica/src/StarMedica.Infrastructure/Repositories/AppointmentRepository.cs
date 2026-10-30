using System.Data;
using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class AppointmentRepository : Repository<Appointment>, IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default)
    {
        return _context.Patients.AnyAsync(
            patient => patient.Id == patientId && patient.IsActive,
            cancellationToken);
    }

    public Task<bool> IsActiveDoctorAsync(int doctorId, CancellationToken cancellationToken = default)
    {
        return _context.UserRoles.AnyAsync(
            userRole => userRole.UserId == doctorId &&
                userRole.User.IsActive &&
                userRole.Role.IsActive &&
                userRole.Role.Name == "Médico",
            cancellationToken);
    }

    public async Task<bool> TryScheduleAsync(
        Appointment appointment,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var startsAt = appointment.StartsAt.ToUniversalTime();
        var endsAt = startsAt.AddMinutes(appointment.DurationMinutes);
        var earliestPossibleOverlap = startsAt.AddMinutes(-60);
        var overlapsExisting = _context.Appointments
            .Where(existing => existing.StartsAt >= earliestPossibleOverlap &&
                existing.StartsAt < endsAt &&
                (existing.Status == AppointmentStatus.Scheduled ||
                 existing.Status == AppointmentStatus.Confirmed));
        var hasDoctorConflict = await overlapsExisting
            .Where(existing => existing.DoctorId == appointment.DoctorId)
            .AnyAsync(cancellationToken);
        var hasPatientConflict = await overlapsExisting
            .Where(existing => existing.PatientId == appointment.PatientId)
            .AnyAsync(cancellationToken);

        if (hasDoctorConflict || hasPatientConflict)
        {
            await transaction.RollbackAsync(cancellationToken);
            return false;
        }

        appointment.StartsAt = startsAt;
        await _context.Appointments.AddAsync(appointment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<Appointment>> GetBetweenAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        return await _context.Appointments
            .AsNoTracking()
            .Include(appointment => appointment.Patient)
            .Include(appointment => appointment.Doctor)
            .Where(appointment => appointment.StartsAt >= from && appointment.StartsAt < to)
            .OrderBy(appointment => appointment.StartsAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Appointment?> GetByIdWithDetailsAsync(
        int appointmentId,
        CancellationToken cancellationToken = default)
    {
        return _context.Appointments
            .Include(appointment => appointment.Patient)
            .Include(appointment => appointment.Doctor)
            .SingleOrDefaultAsync(appointment => appointment.Id == appointmentId, cancellationToken);
    }

    public async Task<IReadOnlyList<Patient>> GetActivePatientsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Patients
            .AsNoTracking()
            .Where(patient => patient.IsActive)
            .OrderBy(patient => patient.FullName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetActiveDoctorsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.UserRoles
            .AsNoTracking()
            .Where(userRole => userRole.User.IsActive &&
                userRole.Role.IsActive &&
                userRole.Role.Name == "Médico")
            .Select(userRole => userRole.User)
            .Distinct()
            .OrderBy(doctor => doctor.FullName)
            .ToListAsync(cancellationToken);
    }
}