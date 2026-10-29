using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Patients.Commands.CreatePatient;
using StarMedica.Application.Features.Patients.Queries.GetPatientsList;
using StarMedica.Domain.Common;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Médico,Recepcionista")]
public class PatientsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PatientsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<Result<IReadOnlyList<PatientDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPatientsListQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result) : StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    public async Task<ActionResult<Result<PatientDto>>> Create([FromBody] CreatePatientCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? StatusCode(result.StatusCode, result) : StatusCode(result.StatusCode, result);
    }
}
