using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Billing.Queries.GetBillingDraft;

public sealed class GetBillingDraftQueryHandler
    : IRequestHandler<GetBillingDraftQuery, Result<BillingDraftDto>>
{
    private readonly IBillingRepository _billingRepository;

    public GetBillingDraftQueryHandler(IBillingRepository billingRepository)
    {
        _billingRepository = billingRepository;
    }

    public async Task<Result<BillingDraftDto>> Handle(
        GetBillingDraftQuery request,
        CancellationToken cancellationToken)
    {
        var draft = await _billingRepository.GetDraftByIdAsync(request.Id, cancellationToken);
        return draft is null
            ? Result<BillingDraftDto>.NotFound("No se encontró el borrador.")
            : Result<BillingDraftDto>.Success(BillingDraftDto.FromEntity(draft));
    }
}
