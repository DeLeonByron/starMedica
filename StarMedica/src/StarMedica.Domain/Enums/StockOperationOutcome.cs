namespace StarMedica.Domain.Enums;

public enum StockOperationOutcome
{
    Completed,
    MedicineUnavailable,
    BatchAlreadyExists,
    PatientUnavailable,
    OperatorUnavailable,
    ConsultationMismatch,
    InsufficientStock,
    NoEligibleBatch
}