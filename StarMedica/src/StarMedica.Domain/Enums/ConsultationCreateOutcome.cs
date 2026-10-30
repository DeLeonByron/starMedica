namespace StarMedica.Domain.Enums;

public enum ConsultationCreateOutcome
{
    Created,
    PatientUnavailable,
    DoctorUnavailable,
    AppointmentUnavailable,
    AppointmentAlreadyHasConsultation
}