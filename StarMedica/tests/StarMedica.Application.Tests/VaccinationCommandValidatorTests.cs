using StarMedica.Application.Features.Vaccines.Commands.AdministerVaccine;
using StarMedica.Application.Features.Vaccines.Commands.CreateVaccine;

namespace StarMedica.Application.Tests;

public sealed class VaccinationCommandValidatorTests
{
    private readonly CreateVaccineCommandValidator _createVaccineValidator = new();
    private readonly AdministerVaccineCommandValidator _administerValidator = new();

    [Theory]
    [InlineData("BCG-01")]
    [InlineData("PENTA.1")]
    public async Task CreateVaccineValidator_AcceptsInstitutionalCodes(string code)
    {
        var result = await _createVaccineValidator.ValidateAsync(CreateVaccineCommand() with { Code = code });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    public async Task CreateVaccineValidator_RejectsDoseCountOutsideRange(int dosesRequired)
    {
        var result = await _createVaccineValidator.ValidateAsync(
            CreateVaccineCommand() with { DosesRequired = dosesRequired });

        Assert.Contains(result.Errors, error => error.PropertyName == "DosesRequired");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    public async Task AdministerVaccineValidator_RejectsDoseNumberOutsideRange(int doseNumber)
    {
        var result = await _administerValidator.ValidateAsync(
            AdministerCommand() with { DoseNumber = doseNumber });

        Assert.Contains(result.Errors, error => error.PropertyName == "DoseNumber");
    }

    [Fact]
    public async Task AdministerVaccineValidator_RequiresLotNumber()
    {
        var result = await _administerValidator.ValidateAsync(AdministerCommand() with { LotNumber = " " });

        Assert.Contains(result.Errors, error => error.PropertyName == "LotNumber");
    }

    private static CreateVaccineCommand CreateVaccineCommand()
    {
        return new CreateVaccineCommand("BCG", "BCG", "Tuberculosis", 1);
    }

    private static AdministerVaccineCommand AdministerCommand()
    {
        return new AdministerVaccineCommand(
            PatientId: 1,
            VaccineId: 1,
            AdministeredById: 2,
            DoseNumber: 1,
            AdministeredAt: DateTimeOffset.UtcNow,
            LotNumber: "LOT-001",
            ExpiresOn: DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
            AdverseEventNotes: null);
    }
}