using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;

public sealed record CreateBillingDraftLineCommand(
    string Description,
    decimal Quantity,
    decimal UnitPrice);

public sealed record CreateBillingDraftCommand(
    string CustomerName,
    string? CustomerNit,
    string? CustomerAddress,
    string? Notes,
    IReadOnlyList<CreateBillingDraftLineCommand> Lines,
    int CreatedBy) : IRequest<Result<BillingDraftDto>>;
