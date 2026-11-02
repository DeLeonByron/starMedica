using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetPharmacyPatients;

public sealed record GetPharmacyPatientsQuery : IRequest<Result<IReadOnlyList<PharmacyPatientOptionDto>>>;