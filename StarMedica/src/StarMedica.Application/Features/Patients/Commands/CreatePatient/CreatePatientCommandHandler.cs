using MediatR;
using FluentValidation;
using StarMedica.Application.DTOs;
using StarMedica.Domain.Common;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Features.Patients.Commands.CreatePatient;

public sealed class CreatePatientCommandHandler : IRequestHandler<CreatePatientCommand, Result<PatientDto>>
{
    private readonly IRepository<Patient> _patientRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CreatePatientCommand> _validator;

    public CreatePatientCommandHandler(
        IRepository<Patient> patientRepository,
        IUnitOfWork unitOfWork,
        IValidator<CreatePatientCommand> validator)
    {
        _patientRepository = patientRepository;
        _unitOfWork = unitOfWork;
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

        var existingPatients = await _patientRepository.GetAllAsync(cancellationToken);
        var exists = existingPatients.Any(patient =>
            patient.Code == request.Code || patient.DocumentNumber == request.DocumentNumber);

        if (exists)
        {
            return Result<PatientDto>.Failure("Ya existe un paciente con ese código o documento.", 409);
        }

        var patient = new Patient
        {
            Code = request.Code.Trim(),
            FullName = request.FullName.Trim(),
            DateOfBirth = request.DateOfBirth,
            DocumentNumber = request.DocumentNumber.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email.Trim(),
            Address = request.Address.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _patientRepository.AddAsync(patient, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
