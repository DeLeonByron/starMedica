using StarMedica.Domain.Enums;

namespace StarMedica.Application.DTOs;

public sealed record MedicineDto(
    int Id,
    string Code,
    string Name,
    string ActiveIngredient,
    string Strength,
    string DosageForm,
    string StockUnit,
    decimal ReorderLevel);

public sealed record MedicineBatchDto(
    int Id,
    int MedicineId,
    string MedicineName,
    string MedicineCode,
    string BatchNumber,
    DateOnly ExpiresOn,
    decimal QuantityAvailable,
    string StockUnit);

public sealed record StockMovementDto(
    int Id,
    string MedicineName,
    string BatchNumber,
    StockMovementType Type,
    decimal Quantity,
    DateTimeOffset OccurredAt,
    string PerformedByName,
    int? PatientId,
    string? PatientName,
    int? ConsultationId,
    string? Reference,
    string? Notes);