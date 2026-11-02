using StarMedica.Application.Features.Pharmacy.Commands.CreateMedicine;
using StarMedica.Application.Features.Pharmacy.Commands.DispenseStock;
using StarMedica.Application.Features.Pharmacy.Commands.ReceiveStock;

namespace StarMedica.Application.Tests;

public sealed class PharmacyCommandValidatorTests
{
    [Fact]
    public async Task CreateMedicineValidator_AcceptsCompleteCatalogItem()
    {
        var result = await new CreateMedicineCommandValidator().ValidateAsync(new CreateMedicineCommand(
            "MED-001", "Solución de prueba", "Principio activo", "10 mg/5 ml", "Suspensión", "frasco", 5));

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task CreateMedicineValidator_RejectsNegativeReorderLevel()
    {
        var result = await new CreateMedicineCommandValidator().ValidateAsync(new CreateMedicineCommand(
            "MED-001", "Medicamento", "Activo", "10 mg", "Tableta", "unidad", -0.001m));

        Assert.Contains(result.Errors, error => error.PropertyName == "ReorderLevel");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task ReceiveStockValidator_RejectsNonPositiveQuantity(decimal quantity)
    {
        var result = await new ReceiveStockCommandValidator().ValidateAsync(new ReceiveStockCommand(
            1, "LOT-001", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)), quantity, 2, null));

        Assert.Contains(result.Errors, error => error.PropertyName == "Quantity");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-2)]
    public async Task DispenseStockValidator_RejectsNonPositiveQuantity(decimal quantity)
    {
        var result = await new DispenseStockCommandValidator().ValidateAsync(new DispenseStockCommand(
            1, quantity, 2, 1, null, null));

        Assert.Contains(result.Errors, error => error.PropertyName == "Quantity");
    }

    [Fact]
    public async Task DispenseStockValidator_RequiresPatient()
    {
        var result = await new DispenseStockCommandValidator().ValidateAsync(new DispenseStockCommand(
            1, 1, 2, 0, null, null));

        Assert.Contains(result.Errors, error => error.PropertyName == "PatientId");
    }
}