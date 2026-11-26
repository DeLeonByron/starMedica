using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class PatientRepository : Repository<Patient>, IPatientRepository
{
    private readonly AppDbContext _context;

    public PatientRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<bool> TryAddPatientAsync(Patient patient, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var exists = await _context.Patients.AnyAsync(
            existing => existing.Code.Trim() == patient.Code ||
                existing.DocumentNumber.Trim() == patient.DocumentNumber,
            cancellationToken);
        if (exists)
        {
            await transaction.RollbackAsync(cancellationToken);
            return false;
        }

        await _context.Patients.AddAsync(patient, cancellationToken);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException exception) when (IsUniqueConstraintViolation(exception))
        {
            await transaction.RollbackAsync(CancellationToken.None);
            _context.Entry(patient).State = EntityState.Detached;
            return false;
        }
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception) =>
        exception.GetBaseException() is SqlException { Number: 2601 or 2627 };
}
