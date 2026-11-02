using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetPharmacyStock;

public sealed record GetPharmacyStockQuery : IRequest<Result<IReadOnlyList<MedicineBatchDto>>>;