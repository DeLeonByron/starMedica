using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StarMedica.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class _20261029_CreateVaccinationRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Vaccines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TargetDisease = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    DosesRequired = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vaccines", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PatientVaccinations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    VaccineId = table.Column<int>(type: "int", nullable: false),
                    DoseNumber = table.Column<int>(type: "int", nullable: false),
                    AdministeredAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LotNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExpiresOn = table.Column<DateOnly>(type: "date", nullable: false),
                    AdministeredById = table.Column<int>(type: "int", nullable: false),
                    AdverseEventNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientVaccinations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientVaccinations_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientVaccinations_Users_AdministeredById",
                        column: x => x.AdministeredById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientVaccinations_Vaccines_VaccineId",
                        column: x => x.VaccineId,
                        principalTable: "Vaccines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientVaccinations_AdministeredById",
                table: "PatientVaccinations",
                column: "AdministeredById");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVaccinations_PatientId_AdministeredAt",
                table: "PatientVaccinations",
                columns: new[] { "PatientId", "AdministeredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientVaccinations_PatientId_VaccineId_DoseNumber",
                table: "PatientVaccinations",
                columns: new[] { "PatientId", "VaccineId", "DoseNumber" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_PatientVaccinations_VaccineId",
                table: "PatientVaccinations",
                column: "VaccineId");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccines_Code",
                table: "Vaccines",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientVaccinations");

            migrationBuilder.DropTable(
                name: "Vaccines");
        }
    }
}
