using System.Data;
using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class ConsultationRepository : Repository<Consultation>, IConsultationRepository
{
    private readonly AppDbContext _context;

    public ConsultationRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public Task<Consultation?> GetByIdWithDetailsAsync(
        int consultationId,
        CancellationToken cancellationToken = default)
    {
        return _context.Consultations
            .AsNoTracking()
            .Include(consultation => consultation.Patient)
            .Include(consultation => consultation.Doctor)
            .SingleOrDefaultAsync(consultation => consultation.Id == consultationId, cancellationToken);
    }

    public async Task<ConsultationCreateOutcome> TryCreateAsync(
        Consultation consultation,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var patientExists = await _context.Patients.AnyAsync(
            patient => patient.Id == consultation.PatientId && patient.IsActive,
            cancellationToken);
        if (!patientExists)
        {
            return ConsultationCreateOutcome.PatientUnavailable;
        }

        var doctorExists = await _context.UserRoles.AnyAsync(
            userRole => userRole.UserId == consultation.DoctorId &&
                userRole.User.IsActive &&
                userRole.Role.IsActive &&
                userRole.Role.Name == "Médico",
            cancellationToken);
        if (!doctorExists)
        {
            return ConsultationCreateOutcome.DoctorUnavailable;
        }

        Appointment? appointment = null;
        if (consultation.AppointmentId is int appointmentId)
        {
            appointment = await _context.Appointments.SingleOrDefaultAsync(
                candidate => candidate.Id == appointmentId &&
                    candidate.PatientId == consultation.PatientId &&
                    candidate.DoctorId == consultation.DoctorId &&
                    candidate.StartsAt <= DateTimeOffset.UtcNow &&
                    (candidate.Status == AppointmentStatus.Scheduled ||
                     candidate.Status == AppointmentStatus.Confirmed),
                cancellationToken);
            if (appointment is null)
            {
                return ConsultationCreateOutcome.AppointmentUnavailable;
            }

            var alreadyHasConsultation = await _context.Consultations
                .AnyAsync(existing => existing.AppointmentId == appointmentId, cancellationToken);
            if (alreadyHasConsultation)
            {
                return ConsultationCreateOutcome.AppointmentAlreadyHasConsultation;
            }
        }

        await _context.Consultations.AddAsync(consultation, cancellationToken);
        if (appointment is not null)
        {
            appointment.Status = AppointmentStatus.Completed;
            appointment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ConsultationCreateOutcome.Created;
    }

    public async Task<IReadOnlyList<Consultation>> GetPatientHistoryAsync(
        int patientId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Consultations
            .AsNoTracking()
            .Include(consultation => consultation.Patient)
            .Include(consultation => consultation.Doctor)
            .Where(consultation => consultation.PatientId == patientId)
            .OrderByDescending(consultation => consultation.ConsultedAt)
            .ThenByDescending(consultation => consultation.Id)
            .Take(100)
            .ToListAsync(cancellationToken);
    }
}