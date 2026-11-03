using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Billing.Queries.GetBillingDrafts;

public sealed class GetBillingDraftsQueryHandler
    : IRequestHandler<GetBillingDraftsQuery, Result<PagedResultDto<BillingDraftDto>>>
{
    private readonly IBillingRepository _billingRepository;
    private readonly IValidator<GetBillingDraftsQuery> _validator;

    public GetBillingDraftsQueryHandler(
        IBillingRepository billingRepository,
        IValidator<GetBillingDraftsQuery> validator)
    {
        _billingRepository = billingRepository;
        _validator = validator;
    }

    public async Task<Result<PagedResultDto<BillingDraftDto>>> Handle(
        GetBillingDraftsQuery request,
        CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<PagedResultDto<BillingDraftDto>>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        var (drafts, totalCount) = await _billingRepository.SearchDraftsAsync(
            request.Search,
            request.PageNumber,
            request.PageSize,
            cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
        return Result<PagedResultDto<BillingDraftDto>>.Success(new PagedResultDto<BillingDraftDto>(
            drafts.Select(BillingDraftDto.FromEntity).ToArray(),
            totalCount,
            request.PageNumber,
            request.PageSize,
            totalPages));
    }
}
