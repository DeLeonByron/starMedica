namespace StarMedica.Domain.Enums;

public enum VaccinationCreateOutcome
{
    Created,
    PatientUnavailable,
    VaccineUnavailable,
    AdministratorUnavailable,
    DoseOutOfRange,
    DuplicateDose
}