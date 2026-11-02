using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetStockMovements;

public sealed record GetStockMovementsQuery : IRequest<Result<IReadOnlyList<StockMovementDto>>>;