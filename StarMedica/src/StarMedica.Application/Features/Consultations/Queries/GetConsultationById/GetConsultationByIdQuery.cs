using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Consultations.Queries.GetConsultationById;

public sealed record GetConsultationByIdQuery(int Id) : IRequest<Result<ConsultationDto>>;