using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Billing.Queries.GetBillingDrafts;

public sealed record GetBillingDraftsQuery : IRequest<Result<IReadOnlyList<BillingDraftDto>>>;
