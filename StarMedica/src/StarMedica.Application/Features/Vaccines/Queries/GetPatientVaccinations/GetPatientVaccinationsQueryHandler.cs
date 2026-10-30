using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Vaccines.Queries.GetPatientVaccinations;

public sealed class GetPatientVaccinationsQueryHandler
    : IRequestHandler<GetPatientVaccinationsQuery, Result<IReadOnlyList<PatientVaccinationDto>>>
{
    private readonly IVaccinationRepository _vaccinations;

    public GetPatientVaccinationsQueryHandler(IVaccinationRepository vaccinations)
    {
        _vaccinations = vaccinations;
    }

    public async Task<Result<IReadOnlyList<PatientVaccinationDto>>> Handle(
        GetPatientVaccinationsQuery request,
        CancellationToken cancellationToken)
    {
        if (request.PatientId <= 0 || !await _vaccinations.PatientExistsAsync(request.PatientId, cancellationToken))
        {
            return Result<IReadOnlyList<PatientVaccinationDto>>.NotFound("El paciente no existe o está inactivo.");
        }

        var history = await _vaccinations.GetPatientHistoryAsync(request.PatientId, cancellationToken);
        var records = history.Select(AdministerVaccineCommandHandler.ToDto).ToArray();
        return Result<IReadOnlyList<PatientVaccinationDto>>.Success(records);
    }
}