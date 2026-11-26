using MediatR;
using FluentValidation;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Patients.Commands.CreatePatient;

public sealed class CreatePatientCommandHandler : IRequestHandler<CreatePatientCommand, Result<PatientDto>>
{
    private readonly IPatientRepository _patientRepository;
    private readonly IValidator<CreatePatientCommand> _validator;

    public CreatePatientCommandHandler(
        IPatientRepository patientRepository,
        IValidator<CreatePatientCommand> validator)
    {
        _patientRepository = patientRepository;
        _validator = validator;
    }

    public async Task<Result<PatientDto>> Handle(CreatePatientCommand request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result<PatientDto>.Failure(
                string.Join(" ", validation.Errors.Select(error => error.ErrorMessage)),
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return Result<PatientDto>.Failure("El código del paciente es obligatorio.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return Result<PatientDto>.Failure("El nombre completo es obligatorio.", 400);
        }

        var code = request.Code.Trim();
        var documentNumber = request.DocumentNumber.Trim();
        var patient = new Patient
        {
            Code = code,
            FullName = request.FullName.Trim(),
            DateOfBirth = request.DateOfBirth,
            DocumentNumber = documentNumber,
            Phone = request.Phone.Trim(),
            Email = request.Email.Trim(),
            Address = request.Address.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        if (!await _patientRepository.TryAddPatientAsync(patient, cancellationToken))
        {
            return Result<PatientDto>.Failure("Ya existe un paciente con ese código o documento.", 409);
        }

        var dto = new PatientDto(
            patient.Id,
            patient.Code,
            patient.FullName,
            patient.DateOfBirth,
            patient.DocumentNumber,
            patient.Phone,
            patient.Email,
            patient.Address,
            patient.IsActive);

        return Result<PatientDto>.Created(dto);
    }
}
