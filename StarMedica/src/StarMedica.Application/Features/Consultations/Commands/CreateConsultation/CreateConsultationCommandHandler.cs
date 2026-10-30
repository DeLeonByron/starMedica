using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Consultations.Commands.CreateConsultation;

public sealed class CreateConsultationCommandHandler
    : IRequestHandler<CreateConsultationCommand, Result<ConsultationDto>>
{
    private readonly IConsultationRepository _consultations;
    private readonly IValidator<CreateConsultationCommand> _validator;

    public CreateConsultationCommandHandler(
        IConsultationRepository consultations,
        IValidator<CreateConsultationCommand> validator)
    {
        _consultations = consultations;
        _validator = validator;
    }

    public async Task<Result<ConsultationDto>> Handle(
        CreateConsultationCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<ConsultationDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        if (request.ConsultedAt > DateTimeOffset.UtcNow.AddMinutes(5))
        {
            return Result<ConsultationDto>.Failure("La fecha de consulta no puede estar en el futuro.", 400);
        }

        var consultation = new Consultation
        {
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            AppointmentId = request.AppointmentId,
            ConsultedAt = request.ConsultedAt?.ToUniversalTime() ?? DateTimeOffset.UtcNow,
            ChiefComplaint = request.ChiefComplaint.Trim(),
            PresentIllness = request.PresentIllness.Trim(),
            PhysicalExam = request.PhysicalExam.Trim(),
            DiagnosisCode = request.DiagnosisCode.Trim().ToUpperInvariant(),
            DiagnosisDescription = request.DiagnosisDescription.Trim(),
            TreatmentPlan = request.TreatmentPlan.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            WeightKg = request.WeightKg,
            HeightCm = request.HeightCm,
            TemperatureCelsius = request.TemperatureCelsius,
            HeartRateBpm = request.HeartRateBpm,
            RespiratoryRatePerMinute = request.RespiratoryRatePerMinute,
            SystolicBloodPressure = request.SystolicBloodPressure,
            DiastolicBloodPressure = request.DiastolicBloodPressure,
            OxygenSaturationPercent = request.OxygenSaturationPercent,
            CreatedAt = DateTime.UtcNow
        };

        var outcome = await _consultations.TryCreateAsync(consultation, cancellationToken);
        if (outcome != ConsultationCreateOutcome.Created)
        {
            return outcome switch
            {
                ConsultationCreateOutcome.PatientUnavailable => Result<ConsultationDto>.NotFound("El paciente no existe o está inactivo."),
                ConsultationCreateOutcome.DoctorUnavailable => Result<ConsultationDto>.Failure("El médico no existe, está inactivo o no tiene el rol requerido.", 403),
                ConsultationCreateOutcome.AppointmentUnavailable => Result<ConsultationDto>.Failure("La cita no corresponde al paciente y médico, no está disponible o aún no inicia.", 409),
                ConsultationCreateOutcome.AppointmentAlreadyHasConsultation => Result<ConsultationDto>.Failure("La cita ya tiene un expediente clínico.", 409),
                _ => Result<ConsultationDto>.Failure("No se pudo guardar la consulta.", 500)
            };
        }

        var created = await _consultations.GetByIdWithDetailsAsync(consultation.Id, cancellationToken);
        if (created is null)
        {
            return Result<ConsultationDto>.Failure("No se pudo recuperar el expediente creado.", 500);
        }

        return Result<ConsultationDto>.Created(ToDto(created));
    }

    internal static ConsultationDto ToDto(Consultation consultation)
    {
        return new ConsultationDto(
            consultation.Id,
            consultation.PatientId,
            consultation.Patient.FullName,
            consultation.DoctorId,
            consultation.Doctor.FullName,
            consultation.AppointmentId,
            consultation.ConsultedAt,
            consultation.ChiefComplaint,
            consultation.PresentIllness,
            consultation.PhysicalExam,
            consultation.DiagnosisCode,
            consultation.DiagnosisDescription,
            consultation.TreatmentPlan,
            consultation.Notes,
            consultation.WeightKg,
            consultation.HeightCm,
            consultation.TemperatureCelsius,
            consultation.HeartRateBpm,
            consultation.RespiratoryRatePerMinute,
            consultation.SystolicBloodPressure,
            consultation.DiastolicBloodPressure,
            consultation.OxygenSaturationPercent);
    }
}