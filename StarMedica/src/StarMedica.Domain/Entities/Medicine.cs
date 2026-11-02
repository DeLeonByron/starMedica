using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class Medicine : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ActiveIngredient { get; set; } = string.Empty;
    public string Strength { get; set; } = string.Empty;
    public string DosageForm { get; set; } = string.Empty;
    public string StockUnit { get; set; } = string.Empty;
    public decimal ReorderLevel { get; set; }
    public bool IsActive { get; set; } = true;
}