using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Billing.Commands.UpdateBillingDraft;

public sealed class UpdateBillingDraftCommandHandler
    : IRequestHandler<UpdateBillingDraftCommand, Result<BillingDraftDto>>
{
    private readonly IBillingRepository _billingRepository;
    private readonly IValidator<UpdateBillingDraftCommand> _validator;

    public UpdateBillingDraftCommandHandler(
        IBillingRepository billingRepository,
        IValidator<UpdateBillingDraftCommand> validator)
    {
        _billingRepository = billingRepository;
        _validator = validator;
    }

    public async Task<Result<BillingDraftDto>> Handle(
        UpdateBillingDraftCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<BillingDraftDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        var now = DateTime.UtcNow;
        var draft = new BillingDraft
        {
            Id = request.Id,
            CustomerName = request.CustomerName.Trim(),
            CustomerNit = NormalizeOptional(request.CustomerNit),
            CustomerAddress = NormalizeOptional(request.CustomerAddress),
            Notes = NormalizeOptional(request.Notes),
            UpdatedAt = now,
            UpdatedBy = request.UpdatedBy,
            Lines = request.Lines!.Select((line, index) =>
            {
                var lineTotal = decimal.Round(
                    line.Quantity * line.UnitPrice,
                    2,
                    MidpointRounding.AwayFromZero);

                return new BillingDraftLine
                {
                    LineNumber = index + 1,
                    Description = line.Description.Trim(),
                    Quantity = line.Quantity,
                    UnitPrice = line.UnitPrice,
                    LineTotal = lineTotal,
                    CreatedAt = now,
                    CreatedBy = request.UpdatedBy
                };
            }).ToArray()
        };
        draft.Total = draft.Lines.Sum(line => line.LineTotal);

        var updatedDraft = await _billingRepository.UpdateDraftAsync(draft, cancellationToken);
        return updatedDraft is null
            ? Result<BillingDraftDto>.NotFound("No se encontró el borrador.")
            : Result<BillingDraftDto>.Success(BillingDraftDto.FromEntity(updatedDraft));
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
