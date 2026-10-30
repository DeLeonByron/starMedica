using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;

namespace StarMedica.Domain.Interfaces;

public interface IVaccinationRepository
{
    Task<bool> PatientExistsAsync(int patientId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Vaccine>> GetActiveVaccinesAsync(CancellationToken cancellationToken = default);
    Task<bool> VaccineCodeExistsAsync(string code, CancellationToken cancellationToken = default);
    Task<bool> TryAddVaccineAsync(Vaccine vaccine, CancellationToken cancellationToken = default);
    Task<PatientVaccination?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<VaccinationCreateOutcome> TryAdministerAsync(
        PatientVaccination vaccination,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PatientVaccination>> GetPatientHistoryAsync(
        int patientId,
        CancellationToken cancellationToken = default);
}