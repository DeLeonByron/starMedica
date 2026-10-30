using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Vaccines.Queries.GetVaccines;

public sealed class GetVaccinesQueryHandler : IRequestHandler<GetVaccinesQuery, Result<IReadOnlyList<VaccineDto>>>
{
    private readonly IVaccinationRepository _vaccinations;

    public GetVaccinesQueryHandler(IVaccinationRepository vaccinations)
    {
        _vaccinations = vaccinations;
    }

    public async Task<Result<IReadOnlyList<VaccineDto>>> Handle(
        GetVaccinesQuery request,
        CancellationToken cancellationToken)
    {
        var vaccines = await _vaccinations.GetActiveVaccinesAsync(cancellationToken);
        var records = vaccines.Select(vaccine => new VaccineDto(
            vaccine.Id,
            vaccine.Code,
            vaccine.Name,
            vaccine.TargetDisease,
            vaccine.DosesRequired,
            vaccine.IsActive)).ToArray();
        return Result<IReadOnlyList<VaccineDto>>.Success(records);
    }
}