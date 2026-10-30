using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Consultations.Commands.CreateConsultation;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Consultations.Queries.GetConsultationById;

public sealed class GetConsultationByIdQueryHandler : IRequestHandler<GetConsultationByIdQuery, Result<ConsultationDto>>
{
    private readonly IConsultationRepository _consultations;

    public GetConsultationByIdQueryHandler(IConsultationRepository consultations)
    {
        _consultations = consultations;
    }

    public async Task<Result<ConsultationDto>> Handle(
        GetConsultationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var consultation = await _consultations.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        return consultation is null
            ? Result<ConsultationDto>.NotFound("El expediente clínico no existe.")
            : Result<ConsultationDto>.Success(CreateConsultationCommandHandler.ToDto(consultation));
    }
}