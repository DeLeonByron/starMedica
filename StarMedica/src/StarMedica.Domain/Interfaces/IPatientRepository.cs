using StarMedica.Domain.Entities;

namespace StarMedica.Domain.Interfaces;

public interface IPatientRepository : IRepository<Patient>
{
    Task<bool> TryAddPatientAsync(Patient patient, CancellationToken cancellationToken = default);
}
