using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Pharmacy.Commands.CreateMedicine;
using StarMedica.Application.Features.Pharmacy.Commands.DispenseStock;
using StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;
using StarMedica.Application.Features.Pharmacy.Queries.GetMedicines;
using StarMedica.Application.Features.Pharmacy.Queries.GetPharmacyPatients;
using StarMedica.Application.Features.Pharmacy.Queries.GetPharmacyStock;
using StarMedica.Application.Features.Pharmacy.Queries.GetStockMovements;
using StarMedica.Domain.Common;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Farmacéutico")]
public sealed class PharmacyController : ControllerBase
{
    private readonly IMediator _mediator;

    public PharmacyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("medicines")]
    [ProducesResponseType<Result<IReadOnlyList<MedicineDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<MedicineDto>>>> GetMedicines(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetMedicinesQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("patients")]
    [ProducesResponseType<Result<IReadOnlyList<PharmacyPatientOptionDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<PharmacyPatientOptionDto>>>> GetPatients(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPharmacyPatientsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("stock")]
    [ProducesResponseType<Result<IReadOnlyList<MedicineBatchDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<MedicineBatchDto>>>> GetStock(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPharmacyStockQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("movements")]
    [ProducesResponseType<Result<IReadOnlyList<StockMovementDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<StockMovementDto>>>> GetMovements(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetStockMovementsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost("medicines")]
    [Authorize(Roles = "SuperAdmin")]
    [ProducesResponseType<Result<MedicineDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<MedicineDto>>> CreateMedicine(
        [FromBody] CreateMedicineCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPost("stock/receipts")]
    [ProducesResponseType<Result<bool>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<bool>>> ReceiveStock(
        [FromBody] ReceiveStockRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetOperatorId(out var operatorId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        var result = await _mediator.Send(new ReceiveStockCommand(
            request.MedicineId,
            request.BatchNumber,
            request.ExpiresOn,
            request.Quantity,
            operatorId,
            request.Reference), cancellationToken);
        return result.IsSuccess ? StatusCode(StatusCodes.Status201Created, result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost("stock/dispenses")]
    [ProducesResponseType<Result<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<bool>>> DispenseStock(
        [FromBody] DispenseStockRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetOperatorId(out var operatorId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        var result = await _mediator.Send(new DispenseStockCommand(
            request.MedicineId,
            request.Quantity,
            operatorId,
            request.PatientId,
            request.ConsultationId,
            request.Reference), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    private bool TryGetOperatorId(out int operatorId)
    {
        return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out operatorId);
    }
}

public sealed record ReceiveStockRequest(
    int MedicineId,
    string BatchNumber,
    DateOnly ExpiresOn,
    decimal Quantity,
    string? Reference);

public sealed record DispenseStockRequest(
    int MedicineId,
    decimal Quantity,
    int PatientId,
    int? ConsultationId,
    string? Reference);