using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Consultations.Commands.CreateConsultation;
using StarMedica.Application.Features.Consultations.Queries.GetConsultationById;
using StarMedica.Application.Features.Consultations.Queries.GetAvailableAppointments;
using StarMedica.Application.Features.Consultations.Queries.GetPatientConsultations;
using StarMedica.Domain.Common;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Médico")]
public sealed class ConsultationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConsultationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("patients/{patientId:int}")]
    [ProducesResponseType<Result<IReadOnlyList<ConsultationDto>>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<Result<IReadOnlyList<ConsultationDto>>>> GetPatientHistory(
        int patientId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPatientConsultationsQuery(patientId), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("patients/{patientId:int}/available-appointments")]
    [ProducesResponseType<Result<IReadOnlyList<AvailableConsultationAppointmentDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Result<IReadOnlyList<AvailableConsultationAppointmentDto>>>> GetAvailableAppointments(
        int patientId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAvailableAppointmentsQuery(patientId), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<Result<ConsultationDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Result<ConsultationDto>>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetConsultationByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    [ProducesResponseType<ConsultationDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<Result<ConsultationDto>>> Create(
        [FromBody] CreateConsultationRequest request,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var doctorId))
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "El token no contiene un identificador de usuario válido."
            });
        }

        var command = new CreateConsultationCommand(
            request.PatientId,
            doctorId,
            request.AppointmentId,
            request.ConsultedAt,
            request.ChiefComplaint,
            request.PresentIllness,
            request.PhysicalExam,
            request.DiagnosisCode,
            request.DiagnosisDescription,
            request.TreatmentPlan,
            request.Notes,
            request.WeightKg,
            request.HeightCm,
            request.TemperatureCelsius,
            request.HeartRateBpm,
            request.RespiratoryRatePerMinute,
            request.SystolicBloodPressure,
            request.DiastolicBloodPressure,
            request.OxygenSaturationPercent);

        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Value is null)
        {
            return StatusCode(result.StatusCode, result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result);
    }
}

public sealed record CreateConsultationRequest(
    int PatientId,
    int? AppointmentId,
    DateTimeOffset? ConsultedAt,
    string ChiefComplaint,
    string PresentIllness,
    string PhysicalExam,
    string DiagnosisCode,
    string DiagnosisDescription,
    string TreatmentPlan,
    string? Notes,
    decimal? WeightKg,
    decimal? HeightCm,
    decimal? TemperatureCelsius,
    int? HeartRateBpm,
    int? RespiratoryRatePerMinute,
    int? SystolicBloodPressure,
    int? DiastolicBloodPressure,
    int? OxygenSaturationPercent);