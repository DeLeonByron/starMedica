using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;
using StarMedica.Application.Features.Vaccines.Commands.CreateVaccine;
using StarMedica.Application.Features.Vaccines.Queries.GetPatientVaccinations;
using StarMedica.Application.Features.Vaccines.Queries.GetVaccines;
using StarMedica.Domain.Common;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Médico,Recepcionista")]
public sealed class VaccinesController : ControllerBase
{
    private readonly IMediator _mediator;

    public VaccinesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType<Result<IReadOnlyList<VaccineDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<VaccineDto>>>> GetCatalog(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetVaccinesQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    [ProducesResponseType<Result<VaccineDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<VaccineDto>>> CreateVaccine(
        [FromBody] CreateVaccineCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpGet("patients/{patientId:int}/vaccinations")]
    [ProducesResponseType<Result<IReadOnlyList<PatientVaccinationDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<PatientVaccinationDto>>>> GetPatientHistory(
        int patientId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPatientVaccinationsQuery(patientId), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost("patients/{patientId:int}/vaccinations")]
    [Authorize(Roles = "Médico")]
    [ProducesResponseType<Result<PatientVaccinationDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<PatientVaccinationDto>>> Administer(
        int patientId,
        [FromBody] AdministerVaccineRequest request,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var administratorId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        var command = new AdministerVaccineCommand(
            patientId,
            request.VaccineId,
            administratorId,
            request.DoseNumber,
            request.AdministeredAt,
            request.LotNumber,
            request.ExpiresOn,
            request.AdverseEventNotes);
        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }
}

public sealed record AdministerVaccineRequest(
    int VaccineId,
    int DoseNumber,
    DateTimeOffset? AdministeredAt,
    string LotNumber,
    DateOnly ExpiresOn,
    string? AdverseEventNotes);