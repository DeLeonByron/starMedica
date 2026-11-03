using StarMedica.Domain.Entities;

namespace StarMedica.Domain.Interfaces;

public interface IBillingRepository
{
    Task AddDraftAsync(BillingDraft draft, CancellationToken cancellationToken = default);
    Task<BillingDraft?> UpdateDraftAsync(BillingDraft draft, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<BillingDraft> Items, int TotalCount)> SearchDraftsAsync(
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<BillingDraft?> GetDraftByIdAsync(int id, CancellationToken cancellationToken = default);
}
