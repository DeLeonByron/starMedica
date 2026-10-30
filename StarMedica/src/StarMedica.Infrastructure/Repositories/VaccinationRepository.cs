using System.Data;
using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class VaccinationRepository : IVaccinationRepository
{
    private readonly AppDbContext _context;

    public VaccinationRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default)
    {
        return _context.Patients.AnyAsync(
            patient => patient.Id == patientId && patient.IsActive,
            cancellationToken);
    }

    public async Task<IReadOnlyList<Vaccine>> GetActiveVaccinesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Vaccines
            .AsNoTracking()
            .Where(vaccine => vaccine.IsActive)
            .OrderBy(vaccine => vaccine.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> VaccineCodeExistsAsync(string code, CancellationToken cancellationToken = default)
    {
        return _context.Vaccines.AnyAsync(vaccine => vaccine.Code == code, cancellationToken);
    }

    public async Task<bool> TryAddVaccineAsync(Vaccine vaccine, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var exists = await _context.Vaccines.AnyAsync(
            candidate => candidate.Code == vaccine.Code,
            cancellationToken);
        if (exists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return false;
        }

        await _context.Vaccines.AddAsync(vaccine, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public Task<PatientVaccination?> GetByIdWithDetailsAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return _context.PatientVaccinations
            .AsNoTracking()
            .Include(vaccination => vaccination.Patient)
            .Include(vaccination => vaccination.Vaccine)
            .Include(vaccination => vaccination.AdministeredBy)
            .SingleOrDefaultAsync(vaccination => vaccination.Id == id, cancellationToken);
    }

    public async Task<VaccinationCreateOutcome> TryAdministerAsync(
        PatientVaccination vaccination,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var patientExists = await _context.Patients.AnyAsync(
            patient => patient.Id == vaccination.PatientId && patient.IsActive,
            cancellationToken);
        if (!patientExists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return VaccinationCreateOutcome.PatientUnavailable;
        }

        var vaccine = await _context.Vaccines.SingleOrDefaultAsync(
            candidate => candidate.Id == vaccination.VaccineId && candidate.IsActive,
            cancellationToken);
        if (vaccine is null)
        {
            await transaction.RollbackAsync(cancellationToken);
            return VaccinationCreateOutcome.VaccineUnavailable;
        }

        var administratorIsDoctor = await _context.UserRoles.AnyAsync(
            userRole => userRole.UserId == vaccination.AdministeredById &&
                userRole.User.IsActive &&
                userRole.Role.IsActive &&
                userRole.Role.Name == "Médico",
            cancellationToken);
        if (!administratorIsDoctor)
        {
            await transaction.RollbackAsync(cancellationToken);
            return VaccinationCreateOutcome.AdministratorUnavailable;
        }

        if (vaccination.DoseNumber < 1 || vaccination.DoseNumber > vaccine.DosesRequired)
        {
            await transaction.RollbackAsync(cancellationToken);
            return VaccinationCreateOutcome.DoseOutOfRange;
        }

        var hasDose = await _context.PatientVaccinations.AnyAsync(
            existing => existing.PatientId == vaccination.PatientId &&
                existing.VaccineId == vaccination.VaccineId &&
                existing.DoseNumber == vaccination.DoseNumber,
            cancellationToken);
        if (hasDose)
        {
            await transaction.RollbackAsync(cancellationToken);
            return VaccinationCreateOutcome.DuplicateDose;
        }

        await _context.PatientVaccinations.AddAsync(vaccination, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return VaccinationCreateOutcome.Created;
    }

    public async Task<IReadOnlyList<PatientVaccination>> GetPatientHistoryAsync(
        int patientId,
        CancellationToken cancellationToken = default)
    {
        return await _context.PatientVaccinations
            .AsNoTracking()
            .Include(vaccination => vaccination.Vaccine)
            .Include(vaccination => vaccination.AdministeredBy)
            .Where(vaccination => vaccination.PatientId == patientId)
            .OrderByDescending(vaccination => vaccination.AdministeredAt)
            .ThenByDescending(vaccination => vaccination.Id)
            .Take(100)
            .ToListAsync(cancellationToken);
    }
}