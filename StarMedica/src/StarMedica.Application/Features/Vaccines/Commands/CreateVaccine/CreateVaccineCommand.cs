using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Vaccines.Commands.CreateVaccine;

public sealed record CreateVaccineCommand(
    string Code,
    string Name,
    string TargetDisease,
    int DosesRequired) : IRequest<Result<VaccineDto>>;