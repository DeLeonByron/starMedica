using FluentValidation;

namespace StarMedica.Application.Features.Billing.Queries.GetBillingDrafts;

public sealed class GetBillingDraftsQueryValidator : AbstractValidator<GetBillingDraftsQuery>
{
    public GetBillingDraftsQueryValidator()
    {
        RuleFor(query => query.Search)
            .MaximumLength(200)
            .When(query => query.Search is not null);
        RuleFor(query => query.PageNumber).InclusiveBetween(1, 1_000_000);
        RuleFor(query => query.PageSize).InclusiveBetween(1, 100);
    }
}
