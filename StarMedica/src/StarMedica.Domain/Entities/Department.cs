using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class Department : SoftDeleteEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
