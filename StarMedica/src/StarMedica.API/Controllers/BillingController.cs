using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;
using StarMedica.Application.Features.Billing.Queries.GetBillingDraft;
using StarMedica.Application.Features.Billing.Queries.GetBillingDrafts;
using StarMedica.Domain.Common;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/billing")]
[Authorize(Roles = "SuperAdmin,Recepcionista")]
public sealed class BillingController : ControllerBase
{
    private readonly IMediator _mediator;

    public BillingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("drafts")]
    [ProducesResponseType<Result<IReadOnlyList<BillingDraftDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<BillingDraftDto>>>> GetDrafts(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBillingDraftsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("drafts/{id:int}")]
    [ProducesResponseType<Result<BillingDraftDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Result<BillingDraftDto>>> GetDraft(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBillingDraftQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost("drafts")]
    [ProducesResponseType<Result<BillingDraftDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Result<BillingDraftDto>>> CreateDraft(
        [FromBody] CreateBillingDraftRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Lines is null)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "El borrador debe incluir una lista válida de conceptos."
            });
        }

        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        var lines = new List<CreateBillingDraftLineCommand>(request.Lines.Count);
        foreach (var line in request.Lines)
        {
            if (line is null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "El borrador debe incluir una lista válida de conceptos."
                });
            }

            lines.Add(new CreateBillingDraftLineCommand(line.Description, line.Quantity, line.UnitPrice));
        }

        var command = new CreateBillingDraftCommand(
            request.CustomerName,
            request.CustomerNit,
            request.CustomerAddress,
            request.Notes,
            lines,
            userId);
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess && result.Value is not null
            ? StatusCode(StatusCodes.Status201Created, result)
            : StatusCode(result.StatusCode, result);
    }
}

public sealed record CreateBillingDraftRequest(
    string CustomerName,
    string? CustomerNit,
    string? CustomerAddress,
    string? Notes,
    IReadOnlyList<CreateBillingDraftLineRequest?>? Lines);

public sealed record CreateBillingDraftLineRequest(
    string Description,
    decimal Quantity,
    decimal UnitPrice);
