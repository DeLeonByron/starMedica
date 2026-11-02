using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Billing.Queries.GetBillingDraft;

public sealed record GetBillingDraftQuery(int Id) : IRequest<Result<BillingDraftDto>>;
