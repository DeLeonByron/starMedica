using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class Vaccine : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string TargetDisease { get; set; } = string.Empty;
    public int DosesRequired { get; set; }
    public bool IsActive { get; set; } = true;
}