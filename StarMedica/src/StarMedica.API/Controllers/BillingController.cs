using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;
using StarMedica.Application.Features.Billing.Commands.UpdateBillingDraft;
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
    [ProducesResponseType<Result<PagedResultDto<BillingDraftDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Result<PagedResultDto<BillingDraftDto>>>> GetDrafts(
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetBillingDraftsQuery(search, pageNumber, pageSize),
            cancellationToken);
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
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        if (!TryMapLines(request.Lines, out var lines))
        {
            return InvalidLines();
        }

        var command = new CreateBillingDraftCommand(
            request.CustomerName,
            request.CustomerNit,
            request.CustomerAddress,
            request.Notes,
            lines,
            userId);
        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, result);
        }

        return CreatedAtAction(nameof(GetDraft), new { id = result.Value.Id }, result);
    }

    [HttpPut("drafts/{id:int}")]
    [ProducesResponseType<Result<BillingDraftDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Result<BillingDraftDto>>> UpdateDraft(
        int id,
        [FromBody] CreateBillingDraftRequest request,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        if (!TryMapLines(request.Lines, out var lines))
        {
            return InvalidLines();
        }

        var command = new UpdateBillingDraftCommand(
            id,
            request.CustomerName,
            request.CustomerNit,
            request.CustomerAddress,
            request.Notes,
            lines,
            userId);
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    private static bool TryMapLines(
        IReadOnlyList<CreateBillingDraftLineRequest?>? requestLines,
        out List<CreateBillingDraftLineCommand> lines)
    {
        lines = [];
        if (requestLines is null)
        {
            return false;
        }

        foreach (var line in requestLines)
        {
            if (line is null)
            {
                return false;
            }

            lines.Add(new CreateBillingDraftLineCommand(line.Description, line.Quantity, line.UnitPrice));
        }

        return true;
    }

    private BadRequestObjectResult InvalidLines() => BadRequest(new ProblemDetails
    {
        Status = StatusCodes.Status400BadRequest,
        Title = "El borrador debe incluir una lista válida de conceptos."
    });
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
