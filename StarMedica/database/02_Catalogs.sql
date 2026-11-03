SET XACT_ABORT ON;
BEGIN TRANSACTION;

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

    CREATE UNIQUE INDEX IX_Departments_Name ON dbo.Departments (Name);
END;

SET IDENTITY_INSERT dbo.Departments ON;

WITH source AS
(
    SELECT 1 AS Id, N'Alta Verapaz' AS Name
    UNION ALL SELECT 2, N'Baja Verapaz'
    UNION ALL SELECT 3, N'Chimaltenango'
    UNION ALL SELECT 4, N'Chiquimula'
    UNION ALL SELECT 5, N'El Progreso'
    UNION ALL SELECT 6, N'Escuintla'
    UNION ALL SELECT 7, N'Guatemala'
    UNION ALL SELECT 8, N'Huehuetenango'
    UNION ALL SELECT 9, N'Izabal'
    UNION ALL SELECT 10, N'Jalapa'
    UNION ALL SELECT 11, N'Jutiapa'
    UNION ALL SELECT 12, N'Pet' + NCHAR(233) + N'n'
    UNION ALL SELECT 13, N'Quetzaltenango'
    UNION ALL SELECT 14, N'Quich' + NCHAR(233)
    UNION ALL SELECT 15, N'Retalhuleu'
    UNION ALL SELECT 16, N'Sacatep' + NCHAR(233) + N'quez'
    UNION ALL SELECT 17, N'San Marcos'
    UNION ALL SELECT 18, N'Santa Rosa'
    UNION ALL SELECT 19, N'Solol' + NCHAR(225)
    UNION ALL SELECT 20, N'Suchitep' + NCHAR(233) + N'quez'
    UNION ALL SELECT 21, N'Totonicap' + NCHAR(225) + N'n'
    UNION ALL SELECT 22, N'Zacapa'
)
UPDATE department
SET Name = source.Name
FROM dbo.Departments AS department
INNER JOIN source ON source.Id = department.Id
WHERE department.Name <> source.Name;

WITH source AS
(
    SELECT 1 AS Id, N'Alta Verapaz' AS Name
    UNION ALL SELECT 2, N'Baja Verapaz'
    UNION ALL SELECT 3, N'Chimaltenango'
    UNION ALL SELECT 4, N'Chiquimula'
    UNION ALL SELECT 5, N'El Progreso'
    UNION ALL SELECT 6, N'Escuintla'
    UNION ALL SELECT 7, N'Guatemala'
    UNION ALL SELECT 8, N'Huehuetenango'
    UNION ALL SELECT 9, N'Izabal'
    UNION ALL SELECT 10, N'Jalapa'
    UNION ALL SELECT 11, N'Jutiapa'
    UNION ALL SELECT 12, N'Pet' + NCHAR(233) + N'n'
    UNION ALL SELECT 13, N'Quetzaltenango'
    UNION ALL SELECT 14, N'Quich' + NCHAR(233)
    UNION ALL SELECT 15, N'Retalhuleu'
    UNION ALL SELECT 16, N'Sacatep' + NCHAR(233) + N'quez'
    UNION ALL SELECT 17, N'San Marcos'
    UNION ALL SELECT 18, N'Santa Rosa'
    UNION ALL SELECT 19, N'Solol' + NCHAR(225)
    UNION ALL SELECT 20, N'Suchitep' + NCHAR(233) + N'quez'
    UNION ALL SELECT 21, N'Totonicap' + NCHAR(225) + N'n'
    UNION ALL SELECT 22, N'Zacapa'
)
INSERT INTO dbo.Departments (Id, Name)
SELECT source.Id, source.Name
FROM source
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Departments AS department
    WHERE department.Id = source.Id
);

SET IDENTITY_INSERT dbo.Departments OFF;

COMMIT TRANSACTION;
