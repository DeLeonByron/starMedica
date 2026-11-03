using System.Data;
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

    public async Task<BillingDraft?> UpdateDraftAsync(
        BillingDraft draft,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var existing = await _context.BillingDrafts
            .Include(candidate => candidate.Lines)
            .SingleOrDefaultAsync(candidate => candidate.Id == draft.Id, cancellationToken);
        if (existing is null)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        existing.CustomerName = draft.CustomerName;
        existing.CustomerNit = draft.CustomerNit;
        existing.CustomerAddress = draft.CustomerAddress;
        existing.Notes = draft.Notes;
        existing.Total = draft.Total;
        existing.UpdatedAt = draft.UpdatedAt;
        existing.UpdatedBy = draft.UpdatedBy;

        var currentLines = existing.Lines.OrderBy(line => line.LineNumber).ToArray();
        foreach (var line in currentLines)
        {
            line.LineNumber += 1000;
        }

        if (currentLines.Length > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        var replacementLines = draft.Lines.OrderBy(line => line.LineNumber).ToArray();
        for (var index = 0; index < replacementLines.Length; index++)
        {
            var replacement = replacementLines[index];
            if (index < currentLines.Length)
            {
                var current = currentLines[index];
                current.LineNumber = index + 1;
                current.Description = replacement.Description;
                current.Quantity = replacement.Quantity;
                current.UnitPrice = replacement.UnitPrice;
                current.LineTotal = replacement.LineTotal;
                current.UpdatedAt = draft.UpdatedAt;
                current.UpdatedBy = draft.UpdatedBy;
                continue;
            }

            existing.Lines.Add(replacement);
        }

        foreach (var removedLine in currentLines.Skip(replacementLines.Length))
        {
            existing.Lines.Remove(removedLine);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return existing;
    }

    public async Task<(IReadOnlyList<BillingDraft> Items, int TotalCount)> SearchDraftsAsync(
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var drafts = _context.BillingDrafts.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var isId = int.TryParse(term, out var draftId);
            drafts = drafts.Where(draft =>
                draft.CustomerName.Contains(term) ||
                (draft.CustomerNit != null && draft.CustomerNit.Contains(term)) ||
                draft.Lines.Any(line => line.Description.Contains(term)) ||
                (isId && draft.Id == draftId));
        }

        var totalCount = await drafts.CountAsync(cancellationToken);
        var items = await drafts
            .Include(draft => draft.Lines)
            .OrderByDescending(draft => draft.CreatedAt)
            .ThenByDescending(draft => draft.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
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
