using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Patients.Queries.GetPatientsList;

public sealed class GetPatientsListQueryHandler : IRequestHandler<GetPatientsListQuery, Result<IReadOnlyList<PatientDto>>>
{
    private readonly IRepository<Patient> _patientRepository;

    public GetPatientsListQueryHandler(IRepository<Patient> patientRepository)
    {
        _patientRepository = patientRepository;
    }

    public async Task<Result<IReadOnlyList<PatientDto>>> Handle(GetPatientsListQuery request, CancellationToken cancellationToken)
    {
        var patients = (await _patientRepository.GetAllAsync(cancellationToken))
            .OrderBy(patient => patient.FullName)
            .Select(patient => new PatientDto(
                patient.Id,
                patient.Code,
                patient.FullName,
                patient.DateOfBirth,
                patient.DocumentNumber,
                patient.Phone,
                patient.Email,
                patient.Address,
                patient.IsActive))
            .ToList();

        return Result<IReadOnlyList<PatientDto>>.Success(patients);
    }
}
