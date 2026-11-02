using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetMedicines;

public sealed record GetMedicinesQuery : IRequest<Result<IReadOnlyList<MedicineDto>>>;