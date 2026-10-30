using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Appointments.Commands.ChangeAppointmentStatus;
using StarMedica.Application.Features.Appointments.Commands.CreateAppointment;
using StarMedica.Application.Features.Appointments.Queries.GetAppointmentById;
using StarMedica.Application.Features.Appointments.Queries.GetAppointmentOptions;
using StarMedica.Application.Features.Appointments.Queries.GetAppointments;
using StarMedica.Domain.Common;
using StarMedica.Domain.Enums;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Médico,Recepcionista")]
public sealed class AppointmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AppointmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType<Result<IReadOnlyList<AppointmentDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Result<IReadOnlyList<AppointmentDto>>>> GetBetween(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var result = await _mediator.Send(
            new GetAppointmentsQuery(from ?? now.AddDays(-7), to ?? now.AddDays(24)),
            cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("options")]
    [ProducesResponseType<Result<AppointmentOptionsDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<AppointmentOptionsDto>>> GetOptions(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAppointmentOptionsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<Result<AppointmentDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Result<AppointmentDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAppointmentByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    [ProducesResponseType<AppointmentDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<AppointmentDto>>> Create(
        [FromBody] CreateAppointmentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result);
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType<Result<AppointmentDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<AppointmentDto>>> ChangeStatus(
        int id,
        [FromBody] ChangeAppointmentStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new ChangeAppointmentStatusCommand(id, request.Status),
            cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }
}

public sealed record ChangeAppointmentStatusRequest(AppointmentStatus Status);