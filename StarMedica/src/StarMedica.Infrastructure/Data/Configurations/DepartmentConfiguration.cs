using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StarMedica.Domain.Entities;

namespace StarMedica.Infrastructure.Data.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments", table =>
            table.HasCheckConstraint(
                "CK_Departments_Name_NotEmpty",
                "LEN(LTRIM(RTRIM([Name]))) > 0"));
        builder.HasKey(department => department.Id);
        builder.Property(department => department.Name).IsRequired().HasMaxLength(100);
        builder.Property(department => department.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(department => department.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        builder.Property(department => department.IsDeleted).HasDefaultValue(false);
        builder.HasIndex(department => department.Name).IsUnique();
        builder.HasQueryFilter(department => !department.IsDeleted);
    }
}
