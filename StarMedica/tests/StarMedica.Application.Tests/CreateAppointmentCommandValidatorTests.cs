using StarMedica.Application.Features.Appointments.Commands.CreateAppointment;

namespace StarMedica.Application.Tests;

public sealed class CreateAppointmentCommandValidatorTests
{
    private readonly CreateAppointmentCommandValidator _validator = new();

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("   ")]
    [InlineData("\t")]
    public async Task ValidateAsync_RejectsEmptyOrWhitespaceOnlyReason(string reason)
    {
        var result = await _validator.ValidateAsync(CreateValidCommand() with { Reason = reason });

        Assert.Contains(result.Errors, error => error.PropertyName == "Reason");
    }

    [Fact]
    public async Task ValidateAsync_AcceptsNonEmptyReason()
    {
        var result = await _validator.ValidateAsync(CreateValidCommand());

        Assert.True(result.IsValid);
    }

    private static CreateAppointmentCommand CreateValidCommand()
    {
        return new CreateAppointmentCommand(
            PatientId: 1,
            DoctorId: 2,
            StartsAt: DateTimeOffset.UtcNow.AddHours(1),
            DurationMinutes: 30,
            Reason: "Control");
    }
}
