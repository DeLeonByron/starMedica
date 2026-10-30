using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Vaccines.Queries.GetVaccines;

public sealed record GetVaccinesQuery : IRequest<Result<IReadOnlyList<VaccineDto>>>;