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
    public async Task CreateMedicineValidator_RejectsWhitespaceOnlyRequiredFields()
    {
        var result = await new CreateMedicineCommandValidator().ValidateAsync(new CreateMedicineCommand(
            " ", " ", " ", " ", " ", " ", 0));

        Assert.Contains(result.Errors, error => error.PropertyName == "Code");
        Assert.Contains(result.Errors, error => error.PropertyName == "Name");
        Assert.Contains(result.Errors, error => error.PropertyName == "ActiveIngredient");
        Assert.Contains(result.Errors, error => error.PropertyName == "Strength");
        Assert.Contains(result.Errors, error => error.PropertyName == "DosageForm");
        Assert.Contains(result.Errors, error => error.PropertyName == "StockUnit");
    }

    [Fact]
    public async Task CreateMedicineValidator_RejectsNegativeReorderLevel()
    {
        var result = await new CreateMedicineCommandValidator().ValidateAsync(new CreateMedicineCommand(
            "MED-001", "Medicamento", "Activo", "10 mg", "Tableta", "unidad", -0.001m));

        Assert.Contains(result.Errors, error => error.PropertyName == "ReorderLevel");
    }

    [Theory]
    [InlineData(0.001, true)]
    [InlineData(1.234, true)]
    [InlineData(1.2341, false)]
    public async Task CreateMedicineValidator_EnforcesThreeDecimalPlaceReorderPrecision(
        decimal reorderLevel,
        bool expectedValid)
    {
        var result = await new CreateMedicineCommandValidator().ValidateAsync(new CreateMedicineCommand(
            "MED-001", "Medicamento", "Activo", "10 mg", "Tableta", "unidad", reorderLevel));

        Assert.Equal(expectedValid, result.IsValid);
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

    [Fact]
    public async Task ReceiveStockValidator_RejectsWhitespaceOnlyBatchNumber()
    {
        var result = await new ReceiveStockCommandValidator().ValidateAsync(new ReceiveStockCommand(
            1, "   ", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)), 1, 2, null));

        Assert.Contains(result.Errors, error => error.PropertyName == "BatchNumber");
    }

    [Theory]
    [InlineData(0.001, true)]
    [InlineData(1.234, true)]
    [InlineData(1.2341, false)]
    public async Task ReceiveStockValidator_EnforcesThreeDecimalPlaceQuantityPrecision(
        decimal quantity,
        bool expectedValid)
    {
        var result = await new ReceiveStockCommandValidator().ValidateAsync(new ReceiveStockCommand(
            1, "LOT-001", DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)), quantity, 2, null));

        Assert.Equal(expectedValid, result.IsValid);
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

    [Theory]
    [InlineData(0.001, true)]
    [InlineData(1.234, true)]
    [InlineData(1.2341, false)]
    public async Task DispenseStockValidator_EnforcesThreeDecimalPlaceQuantityPrecision(
        decimal quantity,
        bool expectedValid)
    {
        var result = await new DispenseStockCommandValidator().ValidateAsync(new DispenseStockCommand(
            1, quantity, 2, 1, null, null));

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Fact]
    public async Task DispenseStockValidator_RequiresPatient()
    {
        var result = await new DispenseStockCommandValidator().ValidateAsync(new DispenseStockCommand(
            1, 1, 2, 0, null, null));

        Assert.Contains(result.Errors, error => error.PropertyName == "PatientId");
    }
}