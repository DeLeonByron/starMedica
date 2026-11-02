using StarMedica.Domain.Entities;

namespace StarMedica.Domain.Interfaces;

public interface IBillingRepository
{
    Task AddDraftAsync(BillingDraft draft, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BillingDraft>> GetRecentDraftsAsync(CancellationToken cancellationToken = default);
    Task<BillingDraft?> GetDraftByIdAsync(int id, CancellationToken cancellationToken = default);
}
