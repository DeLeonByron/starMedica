using StarMedica.Application.Features.Consultations.Commands.CreateConsultation;

namespace StarMedica.Application.Tests;

public sealed class CreateConsultationCommandValidatorTests
{
    private readonly CreateConsultationCommandValidator _validator = new();

    [Theory]
    [InlineData("A00")]
    [InlineData("J06.9")]
    [InlineData("U07.1")]
    public async Task ValidateAsync_AcceptsValidIcd10Codes(string diagnosisCode)
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { DiagnosisCode = diagnosisCode });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ZZZ")]
    [InlineData("J6.9")]
    public async Task ValidateAsync_RejectsInvalidIcd10Codes(string diagnosisCode)
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { DiagnosisCode = diagnosisCode });

        Assert.Contains(result.Errors, error => error.PropertyName == "DiagnosisCode");
    }

    [Fact]
    public async Task ValidateAsync_RejectsWhitespaceOnlyRequiredClinicalText()
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with
        {
            ChiefComplaint = " ",
            PresentIllness = " ",
            PhysicalExam = " ",
            DiagnosisDescription = " ",
            TreatmentPlan = " "
        });

        Assert.Contains(result.Errors, error => error.PropertyName == "ChiefComplaint");
        Assert.Contains(result.Errors, error => error.PropertyName == "PresentIllness");
        Assert.Contains(result.Errors, error => error.PropertyName == "PhysicalExam");
        Assert.Contains(result.Errors, error => error.PropertyName == "DiagnosisDescription");
        Assert.Contains(result.Errors, error => error.PropertyName == "TreatmentPlan");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task ValidateAsync_RejectsNonPositiveAppointmentId(int appointmentId)
    {
        var result = await _validator.ValidateAsync(
            CreateValidCommand() with { AppointmentId = appointmentId });

        Assert.Contains(result.Errors, error => error.PropertyName == "AppointmentId");
    }

    [Fact]
    public async Task ValidateAsync_AcceptsPositiveAppointmentId()
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { AppointmentId = 12 });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(0.09)]
    [InlineData(200.01)]
    public async Task ValidateAsync_RejectsWeightOutsidePediatricBounds(decimal weightKg)
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { WeightKg = weightKg });

        Assert.Contains(result.Errors, error => error.PropertyName == "WeightKg");
    }

    [Theory]
    [InlineData(12.34, true)]
    [InlineData(12.345, false)]
    public async Task ValidateAsync_EnforcesWeightStoragePrecision(decimal weightKg, bool expectedValid)
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { WeightKg = weightKg });

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Theory]
    [InlineData(110.25, true)]
    [InlineData(110.256, false)]
    public async Task ValidateAsync_EnforcesHeightStoragePrecision(decimal heightCm, bool expectedValid)
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { HeightCm = heightCm });

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Theory]
    [InlineData(37.1, true)]
    [InlineData(37.15, false)]
    public async Task ValidateAsync_EnforcesTemperatureStoragePrecision(
        decimal temperatureCelsius,
        bool expectedValid)
    {
        var result = await _validator.ValidateAsync(
            CreateValidCommand() with { TemperatureCelsius = temperatureCelsius });

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Fact]
    public async Task ValidateAsync_RequiresBothBloodPressureValues()
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with
        {
            SystolicBloodPressure = 100,
            DiastolicBloodPressure = null
        });

        Assert.Contains(result.Errors, error => error.ErrorMessage.Contains("ambos valores", StringComparison.Ordinal));
    }

    [Fact]
    public async Task ValidateAsync_RequiresDiastolicPressureBelowSystolic()
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with
        {
            SystolicBloodPressure = 90,
            DiastolicBloodPressure = 100
        });

        Assert.Contains(result.Errors, error => error.ErrorMessage.Contains("menor que la sistólica", StringComparison.Ordinal));
    }

    private static CreateConsultationCommand CreateValidCommand()
    {
        return new CreateConsultationCommand(
            PatientId: 1,
            DoctorId: 2,
            AppointmentId: null,
            ConsultedAt: DateTimeOffset.UtcNow,
            ChiefComplaint: "Tos",
            PresentIllness: "Tos desde ayer",
            PhysicalExam: "Sin dificultad respiratoria",
            DiagnosisCode: "J06.9",
            DiagnosisDescription: "Infección respiratoria aguda",
            TreatmentPlan: "Hidratación y vigilancia",
            Notes: null,
            WeightKg: 20,
            HeightCm: 110,
            TemperatureCelsius: 37,
            HeartRateBpm: 90,
            RespiratoryRatePerMinute: 20,
            SystolicBloodPressure: 100,
            DiastolicBloodPressure: 65,
            OxygenSaturationPercent: 98);
    }
}