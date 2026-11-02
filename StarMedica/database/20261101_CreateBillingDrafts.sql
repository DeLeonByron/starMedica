-- Internal drafts only; this schema does not create or certify SAT FEL documents.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.BillingDrafts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.BillingDrafts
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_BillingDrafts PRIMARY KEY,
        CustomerName nvarchar(200) NOT NULL,
        CustomerNit nvarchar(20) NULL,
        CustomerAddress nvarchar(300) NULL,
        Notes nvarchar(500) NULL,
        Total decimal(18,2) NOT NULL,
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_BillingDrafts_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy int NULL,
        UpdatedAt datetime2 NULL,
        UpdatedBy int NULL,
        CONSTRAINT CK_BillingDrafts_Total CHECK (Total >= 0)
    );

    CREATE INDEX IX_BillingDrafts_CreatedAt_Id
        ON dbo.BillingDrafts (CreatedAt DESC, Id DESC);
END;

IF OBJECT_ID(N'dbo.BillingDraftLines', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.BillingDraftLines
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_BillingDraftLines PRIMARY KEY,
        BillingDraftId int NOT NULL,
        LineNumber int NOT NULL,
        Description nvarchar(300) NOT NULL,
        Quantity decimal(12,3) NOT NULL,
        UnitPrice decimal(12,2) NOT NULL,
        LineTotal decimal(18,2) NOT NULL,
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_BillingDraftLines_CreatedAt DEFAULT SYSUTCDATETIME(),
        CreatedBy int NULL,
        UpdatedAt datetime2 NULL,
        UpdatedBy int NULL,
        CONSTRAINT FK_BillingDraftLines_BillingDrafts_BillingDraftId
            FOREIGN KEY (BillingDraftId) REFERENCES dbo.BillingDrafts (Id) ON DELETE CASCADE,
        CONSTRAINT CK_BillingDraftLines_LineNumber CHECK (LineNumber > 0),
        CONSTRAINT CK_BillingDraftLines_Quantity CHECK (Quantity > 0),
        CONSTRAINT CK_BillingDraftLines_UnitPrice CHECK (UnitPrice >= 0),
        CONSTRAINT CK_BillingDraftLines_LineTotal CHECK
            (LineTotal >= 0 AND LineTotal = ROUND(Quantity * UnitPrice, 2)),
        CONSTRAINT UQ_BillingDraftLines_Draft_LineNumber UNIQUE (BillingDraftId, LineNumber)
    );
END;

COMMIT TRANSACTION;
