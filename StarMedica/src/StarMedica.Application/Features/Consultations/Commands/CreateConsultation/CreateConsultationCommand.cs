using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Consultations.Commands.CreateConsultation;

public sealed record CreateConsultationCommand(
    int PatientId,
    int DoctorId,
    int? AppointmentId,
    DateTimeOffset? ConsultedAt,
    string ChiefComplaint,
    string PresentIllness,
    string PhysicalExam,
    string DiagnosisCode,
    string DiagnosisDescription,
    string TreatmentPlan,
    string? Notes,
    decimal? WeightKg,
    decimal? HeightCm,
    decimal? TemperatureCelsius,
    int? HeartRateBpm,
    int? RespiratoryRatePerMinute,
    int? SystolicBloodPressure,
    int? DiastolicBloodPressure,
    int? OxygenSaturationPercent) : IRequest<Result<ConsultationDto>>;