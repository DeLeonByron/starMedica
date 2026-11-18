using StarMedica.Application.Features.Patients.Commands.CreatePatient;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class CreatePatientCommandTests
{
    [Fact]
    public async Task Validator_RejectsPhoneLongerThanDatabaseColumnLimit()
    {
        var result = await new CreatePatientCommandValidator().ValidateAsync(
            CreateValidCommand() with { Phone = new string('1', 26) });

        Assert.Contains(result.Errors, error => error.PropertyName == "Phone");
    }

    [Fact]
    public async Task Validator_RejectsWhitespaceOnlyRequiredFields()
    {
        var result = await new CreatePatientCommandValidator().ValidateAsync(
            CreateValidCommand() with
            {
                Code = " ",
                FullName = " ",
                DocumentNumber = " ",
                Phone = " "
            });

        Assert.Contains(result.Errors, error => error.PropertyName == "Code");
        Assert.Contains(result.Errors, error => error.PropertyName == "FullName");
        Assert.Contains(result.Errors, error => error.PropertyName == "DocumentNumber");
        Assert.Contains(result.Errors, error => error.PropertyName == "Phone");
    }

    [Theory]
    [InlineData("DocumentNumber")]
    [InlineData("Phone")]
    public async Task Handler_RejectsWhitespaceOnlyDocumentAndPhoneBeforePersistence(string field)
    {
        var repository = new CapturingPatientRepository();
        var unitOfWork = new CapturingUnitOfWork();
        var command = field switch
        {
            "DocumentNumber" => CreateValidCommand() with { DocumentNumber = " " },
            "Phone" => CreateValidCommand() with { Phone = " " },
            _ => throw new ArgumentOutOfRangeException(nameof(field))
        };
        var handler = new CreatePatientCommandHandler(
            repository,
            unitOfWork,
            new CreatePatientCommandValidator());

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        Assert.Null(repository.AddedPatient);
        Assert.Equal(0, unitOfWork.SaveChangesCount);
    }

    [Theory]
    [InlineData(" PAT-001 ", "DOC-NEW", "PAT-001", "DOC-OLD")]
    [InlineData("PAT-NEW", " DOC-001 ", "PAT-OLD", "DOC-001")]
    public async Task Handler_RejectsDuplicatesAfterTrimmingIdentifiers(
        string code,
        string documentNumber,
        string existingCode,
        string existingDocumentNumber)
    {
        var repository = new CapturingPatientRepository
        {
            ExistingPatients =
            [
                new Patient { Code = existingCode, DocumentNumber = existingDocumentNumber }
            ]
        };
        var unitOfWork = new CapturingUnitOfWork();
        var handler = new CreatePatientCommandHandler(
            repository,
            unitOfWork,
            new CreatePatientCommandValidator());

        var result = await handler.Handle(
            CreateValidCommand() with { Code = code, DocumentNumber = documentNumber },
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(409, result.StatusCode);
        Assert.Null(repository.AddedPatient);
        Assert.Equal(0, unitOfWork.SaveChangesCount);
    }

    [Fact]
    public async Task Handler_TrimsIdentifiersBeforeCheckingAndPersistingPatient()
    {
        var repository = new CapturingPatientRepository();
        var handler = new CreatePatientCommandHandler(
            repository,
            new CapturingUnitOfWork(),
            new CreatePatientCommandValidator());

        var result = await handler.Handle(
            CreateValidCommand() with
            {
                Code = " PAT-002 ",
                FullName = " Paciente de prueba ",
                DocumentNumber = " DOC-002 "
            },
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(repository.AddedPatient);
        Assert.Equal("PAT-002", repository.AddedPatient.Code);
        Assert.Equal("DOC-002", repository.AddedPatient.DocumentNumber);
        Assert.Equal("Paciente de prueba", repository.AddedPatient.FullName);
    }

    private static CreatePatientCommand CreateValidCommand() => new(
        "PAT-001",
        "Paciente de prueba",
        null,
        "DOC-001",
        "5550100",
        "paciente@example.com",
        "Dirección de prueba");

    private sealed class CapturingPatientRepository : IRepository<Patient>
    {
        public IReadOnlyList<Patient> ExistingPatients { get; init; } = [];
        public Patient? AddedPatient { get; private set; }

        public Task<Patient?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<Patient?>(null);

        public Task<IReadOnlyList<Patient>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(ExistingPatients);

        public Task AddAsync(Patient entity, CancellationToken cancellationToken = default)
        {
            entity.Id = 1;
            AddedPatient = entity;
            return Task.CompletedTask;
        }

        public void Update(Patient entity) { }

        public void Delete(Patient entity) { }
    }

    private sealed class CapturingUnitOfWork : IUnitOfWork
    {
        public int SaveChangesCount { get; private set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCount++;
            return Task.FromResult(1);
        }
    }
}
