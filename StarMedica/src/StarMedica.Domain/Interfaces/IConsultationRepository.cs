using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;

namespace StarMedica.Domain.Interfaces;

public interface IConsultationRepository : IRepository<Consultation>
{
    Task<Consultation?> GetByIdWithDetailsAsync(int consultationId, CancellationToken cancellationToken = default);
    Task<ConsultationCreateOutcome> TryCreateAsync(
        Consultation consultation,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Consultation>> GetPatientHistoryAsync(
        int patientId,
        CancellationToken cancellationToken = default);
}