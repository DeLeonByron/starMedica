using StarMedica.Domain.Entities;

namespace StarMedica.Application.DTOs;

public sealed record BillingDraftLineDto(
    int LineNumber,
    string Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public sealed record BillingDraftDto(
    int Id,
    string CustomerName,
    string? CustomerNit,
    string? CustomerAddress,
    string? Notes,
    decimal Total,
    DateTime CreatedAt,
    IReadOnlyList<BillingDraftLineDto> Lines)
{
    public static BillingDraftDto FromEntity(BillingDraft draft)
    {
        return new BillingDraftDto(
            draft.Id,
            draft.CustomerName,
            draft.CustomerNit,
            draft.CustomerAddress,
            draft.Notes,
            draft.Total,
            draft.CreatedAt,
            draft.Lines
                .OrderBy(line => line.LineNumber)
                .Select(line => new BillingDraftLineDto(
                    line.LineNumber,
                    line.Description,
                    line.Quantity,
                    line.UnitPrice,
                    line.LineTotal))
                .ToArray());
    }
}
