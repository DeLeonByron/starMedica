using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Consultations.Commands.CreateConsultation;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Consultations.Queries.GetPatientConsultations;

public sealed class GetPatientConsultationsQueryHandler
    : IRequestHandler<GetPatientConsultationsQuery, Result<IReadOnlyList<ConsultationDto>>>
{
    private readonly IConsultationRepository _consultations;

    public GetPatientConsultationsQueryHandler(IConsultationRepository consultations)
    {
        _consultations = consultations;
    }

    public async Task<Result<IReadOnlyList<ConsultationDto>>> Handle(
        GetPatientConsultationsQuery request,
        CancellationToken cancellationToken)
    {
        if (request.PatientId <= 0)
        {
            return Result<IReadOnlyList<ConsultationDto>>.Failure("El paciente indicado no es válido.", 400);
        }

        var consultations = await _consultations.GetPatientHistoryAsync(request.PatientId, cancellationToken);
        var records = consultations.Select(CreateConsultationCommandHandler.ToDto).ToArray();
        return Result<IReadOnlyList<ConsultationDto>>.Success(records);
    }
}