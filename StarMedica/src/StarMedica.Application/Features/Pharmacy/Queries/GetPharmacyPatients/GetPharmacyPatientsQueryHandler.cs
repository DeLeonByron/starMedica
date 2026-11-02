using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Pharmacy.Queries.GetPharmacyPatients;

public sealed class GetPharmacyPatientsQueryHandler
    : IRequestHandler<GetPharmacyPatientsQuery, Result<IReadOnlyList<PharmacyPatientOptionDto>>>
{
    private readonly IPharmacyRepository _pharmacy;

    public GetPharmacyPatientsQueryHandler(IPharmacyRepository pharmacy)
    {
        _pharmacy = pharmacy;
    }

    public async Task<Result<IReadOnlyList<PharmacyPatientOptionDto>>> Handle(
        GetPharmacyPatientsQuery request,
        CancellationToken cancellationToken)
    {
        var patients = await _pharmacy.GetActivePatientsAsync(cancellationToken);
        var options = patients.Select(patient => new PharmacyPatientOptionDto(patient.Id, patient.FullName)).ToArray();
        return Result<IReadOnlyList<PharmacyPatientOptionDto>>.Success(options);
    }
}