using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Billing.Queries.GetBillingDrafts;

public sealed class GetBillingDraftsQueryHandler
    : IRequestHandler<GetBillingDraftsQuery, Result<IReadOnlyList<BillingDraftDto>>>
{
    private readonly IBillingRepository _billingRepository;

    public GetBillingDraftsQueryHandler(IBillingRepository billingRepository)
    {
        _billingRepository = billingRepository;
    }

    public async Task<Result<IReadOnlyList<BillingDraftDto>>> Handle(
        GetBillingDraftsQuery request,
        CancellationToken cancellationToken)
    {
        var drafts = await _billingRepository.GetRecentDraftsAsync(cancellationToken);
        return Result<IReadOnlyList<BillingDraftDto>>.Success(
            drafts.Select(BillingDraftDto.FromEntity).ToArray());
    }
}
