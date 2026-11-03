using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StarMedica.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class _20261102_CreateDepartmentsCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'dbo.Departments', N'U') IS NULL
                BEGIN
                    CREATE TABLE dbo.Departments
                    (
                        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_Departments PRIMARY KEY,
                        Name nvarchar(100) NOT NULL,
                        IsActive bit NOT NULL CONSTRAINT DF_Departments_IsActive DEFAULT 1,
                        CreatedAt datetime2 NOT NULL CONSTRAINT DF_Departments_CreatedAt DEFAULT SYSUTCDATETIME(),
                        CreatedBy int NULL,
                        UpdatedAt datetime2 NULL,
                        UpdatedBy int NULL,
                        IsDeleted bit NOT NULL CONSTRAINT DF_Departments_IsDeleted DEFAULT 0,
                        DeletedAt datetime2 NULL,
                        CONSTRAINT CK_Departments_Name_NotEmpty CHECK (LEN(LTRIM(RTRIM(Name))) > 0)
                    );
                END;

                IF NOT EXISTS
                (
                    SELECT 1
                    FROM sys.indexes
                    WHERE object_id = OBJECT_ID(N'dbo.Departments')
                      AND name = N'IX_Departments_Name'
                )
                BEGIN
                    CREATE UNIQUE INDEX IX_Departments_Name ON dbo.Departments (Name);
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'dbo.Departments', N'U') IS NOT NULL
                    DROP TABLE dbo.Departments;
                """);
        }
    }
}
