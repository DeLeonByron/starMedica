using MediatR;
using StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;
using StarMedica.Domain.Common;
using StarMedica.Application.DTOs;

namespace StarMedica.Application.Features.Billing.Commands.UpdateBillingDraft;

public sealed record UpdateBillingDraftCommand(
    int Id,
    string CustomerName,
    string? CustomerNit,
    string? CustomerAddress,
    string? Notes,
    IReadOnlyList<CreateBillingDraftLineCommand>? Lines,
    int UpdatedBy) : IRequest<Result<BillingDraftDto>>;
