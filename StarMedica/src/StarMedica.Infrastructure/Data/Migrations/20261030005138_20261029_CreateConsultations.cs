using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StarMedica.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class _20261029_CreateConsultations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Consultations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    AppointmentId = table.Column<int>(type: "int", nullable: true),
                    ConsultedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ChiefComplaint = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    PresentIllness = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    PhysicalExam = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: false),
                    DiagnosisCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DiagnosisDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TreatmentPlan = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    WeightKg = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    HeightCm = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    TemperatureCelsius = table.Column<decimal>(type: "decimal(4,1)", precision: 4, scale: 1, nullable: true),
                    HeartRateBpm = table.Column<int>(type: "int", nullable: true),
                    RespiratoryRatePerMinute = table.Column<int>(type: "int", nullable: true),
                    SystolicBloodPressure = table.Column<int>(type: "int", nullable: true),
                    DiastolicBloodPressure = table.Column<int>(type: "int", nullable: true),
                    OxygenSaturationPercent = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Consultations_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Consultations_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Consultations_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_AppointmentId",
                table: "Consultations",
                column: "AppointmentId",
                unique: true,
                filter: "[AppointmentId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_DoctorId",
                table: "Consultations",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_PatientId_ConsultedAt",
                table: "Consultations",
                columns: new[] { "PatientId", "ConsultedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Consultations");
        }
    }
}
