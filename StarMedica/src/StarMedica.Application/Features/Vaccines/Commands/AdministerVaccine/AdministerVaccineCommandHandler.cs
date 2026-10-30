using FluentValidation;
using MediatR;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Enums;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;

public sealed class AdministerVaccineCommandHandler
    : IRequestHandler<AdministerVaccineCommand, Result<PatientVaccinationDto>>
{
    private static readonly TimeSpan GuatemalaOffset = TimeSpan.FromHours(-6);
    private readonly IVaccinationRepository _vaccinations;
    private readonly IValidator<AdministerVaccineCommand> _validator;

    public AdministerVaccineCommandHandler(
        IVaccinationRepository vaccinations,
        IValidator<AdministerVaccineCommand> validator)
    {
        _vaccinations = vaccinations;
        _validator = validator;
    }

    public async Task<Result<PatientVaccinationDto>> Handle(
        AdministerVaccineCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<PatientVaccinationDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        var administeredAt = request.AdministeredAt?.ToUniversalTime() ?? DateTimeOffset.UtcNow;
        if (administeredAt > DateTimeOffset.UtcNow.AddMinutes(5))
        {
            return Result<PatientVaccinationDto>.Failure("La fecha de aplicación no puede estar en el futuro.", 400);
        }

        var guatemalaDate = DateOnly.FromDateTime(administeredAt.ToOffset(GuatemalaOffset).DateTime);
        if (request.ExpiresOn <= guatemalaDate)
        {
            return Result<PatientVaccinationDto>.Failure(
                "El lote debe vencer después de la fecha de aplicación en Guatemala.",
                400);
        }

        var vaccination = new PatientVaccination
        {
            PatientId = request.PatientId,
            VaccineId = request.VaccineId,
            AdministeredById = request.AdministeredById,
            DoseNumber = request.DoseNumber,
            AdministeredAt = administeredAt,
            LotNumber = request.LotNumber.Trim(),
            ExpiresOn = request.ExpiresOn,
            AdverseEventNotes = string.IsNullOrWhiteSpace(request.AdverseEventNotes)
                ? null
                : request.AdverseEventNotes.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var outcome = await _vaccinations.TryAdministerAsync(vaccination, cancellationToken);
        if (outcome != VaccinationCreateOutcome.Created)
        {
            return outcome switch
            {
                VaccinationCreateOutcome.PatientUnavailable => Result<PatientVaccinationDto>.NotFound("El paciente no existe o está inactivo."),
                VaccinationCreateOutcome.VaccineUnavailable => Result<PatientVaccinationDto>.NotFound("La vacuna no existe o está inactiva."),
                VaccinationCreateOutcome.AdministratorUnavailable => Result<PatientVaccinationDto>.Failure("El usuario no es un médico activo.", 403),
                VaccinationCreateOutcome.DoseOutOfRange => Result<PatientVaccinationDto>.Failure("El número de dosis excede el esquema registrado para esta vacuna.", 400),
                VaccinationCreateOutcome.DuplicateDose => Result<PatientVaccinationDto>.Failure("Esta dosis ya está registrada para el paciente.", 409),
                _ => Result<PatientVaccinationDto>.Failure("No se pudo registrar la aplicación.", 500)
            };
        }

        var created = await _vaccinations.GetByIdWithDetailsAsync(vaccination.Id, cancellationToken);
        if (created is null)
        {
            return Result<PatientVaccinationDto>.Failure("No se pudo recuperar el registro de vacunación.", 500);
        }

        return Result<PatientVaccinationDto>.Created(ToDto(created));
    }

    internal static PatientVaccinationDto ToDto(PatientVaccination vaccination)
    {
        return new PatientVaccinationDto(
            vaccination.Id,
            vaccination.PatientId,
            vaccination.Patient.FullName,
            vaccination.VaccineId,
            vaccination.Vaccine.Code,
            vaccination.Vaccine.Name,
            vaccination.DoseNumber,
            vaccination.AdministeredAt,
            vaccination.LotNumber,
            vaccination.ExpiresOn,
            vaccination.AdministeredById,
            vaccination.AdministeredBy.FullName,
            vaccination.AdverseEventNotes);
    }
}