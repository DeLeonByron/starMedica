using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;

public sealed class CreateBillingDraftCommandHandler
    : IRequestHandler<CreateBillingDraftCommand, Result<BillingDraftDto>>
{
    private readonly IBillingRepository _billingRepository;
    private readonly IValidator<CreateBillingDraftCommand> _validator;

    public CreateBillingDraftCommandHandler(
        IBillingRepository billingRepository,
        IValidator<CreateBillingDraftCommand> validator)
    {
        _billingRepository = billingRepository;
        _validator = validator;
    }

    public async Task<Result<BillingDraftDto>> Handle(
        CreateBillingDraftCommand request,
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
            CustomerName = request.CustomerName.Trim(),
            CustomerNit = NormalizeOptional(request.CustomerNit),
            CustomerAddress = NormalizeOptional(request.CustomerAddress),
            Notes = NormalizeOptional(request.Notes),
            CreatedAt = now,
            CreatedBy = request.CreatedBy,
            Lines = request.Lines.Select((line, index) =>
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
                    CreatedBy = request.CreatedBy
                };
            }).ToArray()
        };
        draft.Total = draft.Lines.Sum(line => line.LineTotal);

        await _billingRepository.AddDraftAsync(draft, cancellationToken);
        return Result<BillingDraftDto>.Created(BillingDraftDto.FromEntity(draft));
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
