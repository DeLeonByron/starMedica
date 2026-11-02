using Microsoft.EntityFrameworkCore;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;

namespace StarMedica.Infrastructure.Repositories;

public sealed class BillingRepository : IBillingRepository
{
    private readonly AppDbContext _context;

    public BillingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddDraftAsync(BillingDraft draft, CancellationToken cancellationToken = default)
    {
        await _context.BillingDrafts.AddAsync(draft, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BillingDraft>> GetRecentDraftsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.BillingDrafts
            .AsNoTracking()
            .Include(draft => draft.Lines)
            .OrderByDescending(draft => draft.CreatedAt)
            .ThenByDescending(draft => draft.Id)
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<BillingDraft?> GetDraftByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.BillingDrafts
            .AsNoTracking()
            .Include(draft => draft.Lines)
            .SingleOrDefaultAsync(draft => draft.Id == id, cancellationToken);
    }
}
