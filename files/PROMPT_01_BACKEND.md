# 🔧 PROMPT-01 BACKEND — ERP Star Médica
## .NET 9 · EF Core 9 · MediatR 12 · Clean Architecture · SQL Server Express 2022
## ⚠️ USAR JUNTO AL MASTER PROMPT v6.0 — No reemplaza, complementa.

---

## 🧠 INSTRUCCIONES BACKEND

```
REGLAS ESPECÍFICAS BACKEND:
  1. Clean Architecture estricta — nunca saltarse capas (API → App → Domain).
  2. NUNCA lógica de negocio en Controllers — siempre en Handlers.
  3. NUNCA DbContext en Application — solo en Infrastructure.
  4. SIEMPRE Record types para Commands y Queries (inmutabilidad).
  5. SIEMPRE Result<T> para retornar éxito/error — nunca lanzar excepciones de negocio.
  6. SIEMPRE decimal para montos GTQ — NUNCA float ni double.
  7. SIEMPRE DateOnly para fechas puras, DateTime/DateTimeOffset para timestamps.
  8. SIEMPRE GETUTCDATE() en SQL — conversión a UTC-6 en la capa de presentación.
  9. SIEMPRE soft delete (IsDeleted) con query filter en DbContext.
  10. DESPUÉS de generar cada capa, incluir checkpoint dotnet build.

CHECKPOINT OBLIGATORIO BACKEND:
  Después de cada feature completa ejecutar:
  ┌──────────────────────────────────────────────────────┐
  │ ✅ CHECKPOINT BACKEND                                │
  │ cd StarMedica && dotnet build                        │
  │ Esperado: Build succeeded. 0 Error(s), 0 Warning(s) │
  │ Si hay error: revisar using statements y namespaces  │
  └──────────────────────────────────────────────────────┘
```

---

## 📦 ARCHIVOS .CSPROJ — COPIAR EXACTO

```xml
<!-- StarMedica.Domain.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="MediatR" Version="12.4.1" />
    <PackageReference Include="FluentValidation" Version="11.11.0" />
  </ItemGroup>
</Project>

<!-- StarMedica.Application.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="MediatR" Version="12.4.1" />
    <!-- MediatR 12: DI INCLUIDO en paquete base — NO agregar Extensions -->
    <PackageReference Include="FluentValidation" Version="11.11.0" />
    <PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.11.0" />
    <PackageReference Include="AutoMapper" Version="13.0.1" />
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="13.0.1" />
    <ProjectReference Include="..\StarMedica.Domain\StarMedica.Domain.csproj" />
  </ItemGroup>
</Project>

<!-- StarMedica.Infrastructure.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Serilog.AspNetCore" Version="9.0.0" />
    <PackageReference Include="Serilog.Sinks.File" Version="6.0.0" />
    <PackageReference Include="QuestPDF" Version="2024.12.0" />
    <PackageReference Include="MailKit" Version="4.8.0" />
    <PackageReference Include="CloudinaryDotNet" Version="1.27.0" />
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    <ProjectReference Include="..\StarMedica.Application\StarMedica.Application.csproj" />
  </ItemGroup>
</Project>

<!-- StarMedica.API.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
    <PackageReference Include="Google.Apis.Auth" Version="1.68.0" />
    <!-- Google.Apis.Auth: valida ID tokens de Google Identity Services (GIS) -->
    <!-- NO instalar Firebase Admin SDK — no se usa para auth -->
    <PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
    <ProjectReference Include="..\StarMedica.Infrastructure\StarMedica.Infrastructure.csproj" />
  </ItemGroup>
</Project>
```

---

## 👤 ENTIDAD USER — SEGURIDAD

```csharp
// [EF-ENTITY] Domain/Entities/User.cs
using StarMedica.Domain.Common;

namespace StarMedica.Domain.Entities;

public class User : SoftDeleteEntity
{
    public string  Email              { get; set; } = string.Empty;
    public string  FullName           { get; set; } = string.Empty;
    public string? PhotoUrl           { get; set; }
    public string? GoogleId           { get; set; }      // Sub del token GIS
    public bool    IsActive           { get; set; } = true;
    // Refresh token — solo el hash se guarda en BD
    public string? RefreshTokenHash   { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    // Relaciones
    public ICollection<UserRole> UserRoles { get; set; } = [];
}

// [EF-ENTITY] Domain/Entities/Role.cs
public class Role : BaseEntity
{
    public string Name        { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool   IsActive    { get; set; } = true;
    public ICollection<UserRole> UserRoles { get; set; } = [];
}

// [EF-ENTITY] Domain/Entities/UserRole.cs (tabla de unión)
public class UserRole
{
    public int UserId    { get; set; }
    public int RoleId    { get; set; }
    public User User     { get; set; } = null!;
    public Role Role     { get; set; } = null!;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public int? AssignedBy     { get; set; }
}

// [EF-CONFIG] Infrastructure/Data/Configurations/UserConfiguration.cs
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.PhotoUrl).HasMaxLength(500);
        builder.Property(u => u.GoogleId).HasMaxLength(100);
        builder.Property(u => u.RefreshTokenHash).HasMaxLength(500);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.GoogleId);
        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}

// [EF-CONFIG] Infrastructure/Data/Configurations/UserRoleConfiguration.cs
public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");
        builder.HasKey(ur => new { ur.UserId, ur.RoleId });
        builder.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
        builder.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
    }
}
```

---

## 🏛️ ENTIDADES BASE — DOMAIN

```csharp
// Domain/Common/BaseEntity.cs
namespace StarMedica.Domain.Common;
public abstract class BaseEntity
{
    public int       Id        { get; set; }
    public DateTime  CreatedAt { get; set; } = DateTime.UtcNow;
    public int?      CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int?      UpdatedBy { get; set; }
}

// Domain/Common/SoftDeleteEntity.cs
namespace StarMedica.Domain.Common;
public abstract class SoftDeleteEntity : BaseEntity
{
    public bool      IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}

// Domain/Common/Result.cs
namespace StarMedica.Domain.Common;
public class Result<T>
{
    public bool    IsSuccess  { get; }
    public T?      Value      { get; }
    public string? Error      { get; }
    public int     StatusCode { get; }

    private Result(bool ok, T? value, string? error, int code)
    { IsSuccess = ok; Value = value; Error = error; StatusCode = code; }

    public static Result<T> Success(T value)          => new(true,  value,   null,  200);
    public static Result<T> Created(T value)           => new(true,  value,   null,  201);
    public static Result<T> Failure(string err, int code = 400) => new(false, default, err, code);
    public static Result<T> NotFound(string err = "No encontrado")  => new(false, default, err, 404);
    public static Result<T> Unauthorized(string err = "No autorizado") => new(false, default, err, 401);
}
```

---

## 🗂️ INTERFACES — DOMAIN LAYER

```csharp
// Domain/Interfaces/IRepository.cs
namespace StarMedica.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Delete(T entity);                           // Soft delete si hereda SoftDeleteEntity
}

// Domain/Interfaces/IUnitOfWork.cs
namespace StarMedica.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

// Domain/Interfaces/IPatientRepository.cs
namespace StarMedica.Domain.Interfaces;

public interface IPatientRepository : IRepository<Patient>
{
    Task<(IReadOnlyList<Patient> Items, int TotalCount)> GetPagedAsync(
        string? search, string? status,
        int pageNumber, int pageSize, CancellationToken ct);
    Task<int> CountByYearAsync(int year, CancellationToken ct);
    Task<Patient?> FindByCodeAsync(string code, CancellationToken ct);
}

// Domain/Interfaces/IUserRepository.cs
namespace StarMedica.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> FindByEmailAsync(string email, CancellationToken ct);
    Task<User?> FindByGoogleIdAsync(string googleId, CancellationToken ct);
    Task<string[]> GetRolesAsync(int userId, CancellationToken ct);
}

// Infrastructure/Data/Repositories/GenericRepository.cs
// (Implementación base — el agente sigue este patrón para cada repo)
namespace StarMedica.Infrastructure.Data.Repositories;

public class GenericRepository<T>(AppDbContext db) : IRepository<T>
    where T : BaseEntity
{
    protected readonly DbSet<T> _set = db.Set<T>();

    public async Task<T?> GetByIdAsync(int id, CancellationToken ct) =>
        await _set.FindAsync([id], ct);

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct) =>
        await _set.AsNoTracking().ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct) =>
        await _set.AddAsync(entity, ct);

    public void Update(T entity) => db.Entry(entity).State = EntityState.Modified;

    public void Delete(T entity)
    {
        if (entity is SoftDeleteEntity soft)
        {
            soft.IsDeleted = true;
            soft.DeletedAt = DateTime.UtcNow;
            db.Entry(entity).State = EntityState.Modified;
        }
        else
        {
            _set.Remove(entity);
        }
    }
}

// Infrastructure/Data/UnitOfWork.cs
public class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
    public void Dispose() => db.Dispose();
}
```

---

## ⚙️ DEPENDENCY INJECTION

```csharp
// Application/DependencyInjection.cs
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace StarMedica.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // MediatR 12 — DI nativo, sin paquete Extensions separado
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddAutoMapper(typeof(DependencyInjection).Assembly);
        return services;
    }
}

// Application/Behaviors/ValidationBehavior.cs
using FluentValidation;
using MediatR;

namespace StarMedica.Application.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any()) return await next();

        var ctx     = new ValidationContext<TRequest>(request);
        var results = await Task.WhenAll(validators.Select(v => v.ValidateAsync(ctx, ct)));
        var failures = results.SelectMany(r => r.Errors).Where(f => f != null).ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}

// Infrastructure/DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StarMedica.Domain.Interfaces;
using StarMedica.Infrastructure.Data;
using StarMedica.Infrastructure.Data.Repositories;
using StarMedica.Infrastructure.Services;

namespace StarMedica.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseSqlServer(config.GetConnectionString("StarMedicaDB"),
                sql => sql.MigrationsAssembly("StarMedica.Infrastructure")));

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IPatientRepository, PatientRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // External services
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IWhatsAppService, WhatsAppService>();

        return services;
    }
}
```

---

## 🚀 PROGRAM.CS COMPLETO

```csharp
// StarMedica.API/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using Serilog;
using StarMedica.Application;
using StarMedica.Infrastructure;
using StarMedica.Infrastructure.Data;
using StarMedica.Infrastructure.Data.Seeders;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/starmedica-.log", rollingInterval: RollingInterval.Day)
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── SERILOG ────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/starmedica-.log", rollingInterval: RollingInterval.Day));

    // ── EF CORE ────────────────────────────────────────────────
    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseSqlServer(builder.Configuration.GetConnectionString("StarMedicaDB"),
            sql => sql.MigrationsAssembly("StarMedica.Infrastructure")));

    // ── CAPAS ──────────────────────────────────────────────────
    builder.Services.AddApplicationServices();
    builder.Services.AddInfrastructureServices(builder.Configuration);

    // ── JWT ────────────────────────────────────────────────────
    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("Jwt:Key no configurada en appsettings");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ValidateIssuer           = true,
                ValidIssuer              = builder.Configuration["Jwt:Issuer"],
                ValidateAudience         = true,
                ValidAudience            = builder.Configuration["Jwt:Audience"],
                ValidateLifetime         = true,
                ClockSkew                = TimeSpan.Zero
            };
            // SignalR — token desde query string
            opt.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var token = ctx.Request.Query["access_token"];
                    if (!string.IsNullOrEmpty(token) &&
                        ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                        ctx.Token = token;
                    return Task.CompletedTask;
                }
            };
        });

    builder.Services.AddAuthorization();

    // ── CORS ───────────────────────────────────────────────────
    var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                  ?? ["http://localhost:4200"];
    builder.Services.AddCors(opt => opt.AddPolicy("StarMedicaPolicy", p =>
        p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

    // ── SIGNALR ────────────────────────────────────────────────
    builder.Services.AddSignalR();

    // ── CONTROLLERS ────────────────────────────────────────────
    builder.Services.AddControllers();

    // ── SWAGGER ────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Star Médica API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization", Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer", BearerFormat = "JWT", In = ParameterLocation.Header
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement {{
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            }, []
        }});
    });

    // ── QUESTPDF (Community = gratis) ─────────────────────────
    QuestPDF.Settings.License = LicenseType.Community;

    var app = builder.Build();

    // ── MIGRATIONS + SEED ─────────────────────────────────────
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        await DatabaseSeeder.SeedAsync(db);
    }

    // ── PIPELINE ───────────────────────────────────────────────
    if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Star Médica API v1"));
    }

    app.UseSerilogRequestLogging();
    app.UseMiddleware<ExceptionMiddleware>();
    app.UseHttpsRedirection();
    app.UseCors("StarMedicaPolicy");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<NotificationHub>("/hubs/notifications");

    await app.RunAsync();
}
catch (Exception ex) { Log.Fatal(ex, "La aplicación terminó inesperadamente"); }
finally             { await Log.CloseAndFlushAsync(); }
```

---

## 📄 APPSETTINGS POR AMBIENTE

```json
// appsettings.json (base — valores no sensibles)
{
  "Jwt": { "Issuer": "StarMedica.API", "Audience": "StarMedica.Client", "ExpiresInMinutes": 60 },
  "AllowedOrigins": ["http://localhost:4200"],
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    }
  }
}

// appsettings.Development.json
{
  "ConnectionStrings": {
    "StarMedicaDB": "Server=localhost\\SQLEXPRESS;Database=StarMedicaDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": { "Key": "DevKey_MinMax32Chars_StarMedica2025!" },
  "AllowedOrigins": ["http://localhost:4200"],
  "Cloudinary": { "CloudName": "dev-cloud", "ApiKey": "...", "ApiSecret": "...", "Folder": "starmedica-dev" },
  "Resend": { "ApiKey": "re_DEV_KEY", "FromEmail": "dev@starmedica.gt", "MockMode": true },
  "WhatsApp": { "MockMode": true }
}

// appsettings.Staging.json
{
  "ConnectionStrings": {
    "StarMedicaDB": "Server=staging-server;Database=StarMedicaDB_Staging;..."
  },
  "Jwt": { "Key": "StagingKey_MinMax32Chars_StarMedica!" },
  "AllowedOrigins": ["https://starmedica-staging.vercel.app"],
  "Resend": { "ApiKey": "re_STAGING_KEY", "FromEmail": "staging@starmedica.gt", "MockMode": false },
  "WhatsApp": { "MockMode": true }
}

// appsettings.Production.json — valores via variables de entorno Railway
{
  "ConnectionStrings": { "StarMedicaDB": "" },
  "Jwt": { "Key": "" },
  "AllowedOrigins": ["https://starmedica.vercel.app", "https://starmedica.gt"]
}
// NOTA: En Railway, los valores sensibles se configuran como variables de entorno,
// NO en el archivo. Railway los inyecta automáticamente.
```

---

## 🎯 PLANTILLAS MediatR — PATTERN COMPLETO

### Command + Handler + Validator:

```csharp
// [APP-CMD] Application/Features/[Modulo]/Commands/[Accion]/[Accion]Command.cs
using MediatR;
using StarMedica.Domain.Common;

namespace StarMedica.Application.Features.Patients.Commands.CreatePatient;

// Record = inmutable, ideal para Commands
public record CreatePatientCommand(
    string   FirstName,
    string?  SecondName,
    string   FirstLastName,
    string?  SecondLastName,
    DateOnly BirthDate,
    char     Gender,         // 'M' | 'F' | 'N'
    string?  Dpi,
    int?     EthnicityId,
    int?     AddressDepartmentId,
    int?     AddressMunicipalityId,
    string?  AddressZone,
    string?  AddressDetail,
    string[] Allergies,
    // Tutor obligatorio
    string  GuardianFullName,
    string  GuardianRelationship,
    string? GuardianDpi,
    string? GuardianNit,
    string  GuardianPhone,
    string? GuardianWhatsApp,
    string? GuardianEmail
) : IRequest<Result<PatientDto>>;

// ─── Handler ───────────────────────────────────────────────────────────────
public class CreatePatientCommandHandler(
    IPatientRepository patientRepo,
    IUnitOfWork        unitOfWork,
    IMapper            mapper
) : IRequestHandler<CreatePatientCommand, Result<PatientDto>>
{
    public async Task<Result<PatientDto>> Handle(
        CreatePatientCommand cmd, CancellationToken ct)
    {
        // Generar código SM-YYYY-NNN
        var year  = DateTime.UtcNow.Year;
        var count = await patientRepo.CountByYearAsync(year, ct);
        var code  = $"SM-{year}-{(count + 1):D3}";

        var patient = new Patient
        {
            Code              = code,
            FirstName         = cmd.FirstName,
            SecondName        = cmd.SecondName,
            FirstLastName     = cmd.FirstLastName,
            SecondLastName    = cmd.SecondLastName,
            BirthDate         = cmd.BirthDate,
            Gender            = cmd.Gender,
            DPI               = cmd.Dpi,
            EthnicityId       = cmd.EthnicityId,
            AddressDepartmentId   = cmd.AddressDepartmentId,
            AddressMunicipalityId = cmd.AddressMunicipalityId,
            AddressZone       = cmd.AddressZone,
            AddressDetail     = cmd.AddressDetail,
            Allergies         = cmd.Allergies.Length > 0
                                ? JsonSerializer.Serialize(cmd.Allergies) : null,
            Status = "Activo"
        };

        patient.Guardians.Add(new PatientGuardian
        {
            FullName     = cmd.GuardianFullName,
            Relationship = cmd.GuardianRelationship,
            DPI          = cmd.GuardianDpi,
            NIT          = cmd.GuardianNit,
            Phone        = cmd.GuardianPhone,
            WhatsApp     = cmd.GuardianWhatsApp,
            Email        = cmd.GuardianEmail,
            IsPrimary    = true
        });

        await patientRepo.AddAsync(patient, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<PatientDto>.Created(mapper.Map<PatientDto>(patient));
    }
}

// ─── Validator ──────────────────────────────────────────────────────────────
public class CreatePatientCommandValidator : AbstractValidator<CreatePatientCommand>
{
    public CreatePatientCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FirstLastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BirthDate)
            .NotEmpty()
            .Must(d => d <= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de nacimiento no puede ser futura.");
        RuleFor(x => x.Gender)
            .Must(g => g is 'M' or 'F' or 'N')
            .WithMessage("El género debe ser M, F o N.");
        RuleFor(x => x.Dpi)
            .Length(13).Matches(@"^\d{13}$")
            .WithMessage("El DPI debe tener 13 dígitos numéricos.")
            .When(x => x.Dpi is not null);
        RuleFor(x => x.GuardianFullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.GuardianPhone)
            .NotEmpty().Matches(@"^\d{8}$")
            .WithMessage("El teléfono debe tener 8 dígitos (sin código de país).");
        RuleFor(x => x.GuardianEmail)
            .EmailAddress().WithMessage("Email del tutor no válido.")
            .When(x => x.GuardianEmail is not null);
    }
}
```

### Query + Handler + DTOs:

```csharp
// [APP-QRY] Application/Features/Patients/Queries/GetPatientsList/
public record GetPatientsListQuery(
    string? Search, string? Status, int PageNumber = 1, int PageSize = 20
) : IRequest<Result<PagedResult<PatientListDto>>>;

public class GetPatientsListQueryHandler(IPatientRepository repo, IMapper mapper)
    : IRequestHandler<GetPatientsListQuery, Result<PagedResult<PatientListDto>>>
{
    public async Task<Result<PagedResult<PatientListDto>>> Handle(
        GetPatientsListQuery q, CancellationToken ct)
    {
        var (items, total) = await repo.GetPagedAsync(
            q.Search, q.Status, q.PageNumber, q.PageSize, ct);
        return Result<PagedResult<PatientListDto>>.Success(new PagedResult<PatientListDto>(
            mapper.Map<List<PatientListDto>>(items), total, q.PageNumber, q.PageSize));
    }
}

// DTOs de salida — Records inmutables
public record PatientDto(
    int Id, string Code, string FullName, string FirstName, string FirstLastName,
    DateOnly BirthDate, int Age, char Gender, string? BloodType, string? PhotoUrl,
    string Status, IReadOnlyList<PatientGuardianDto> Guardians
);
public record PatientListDto(
    int Id, string Code, string FullName, int Age, char Gender,
    string? PhotoUrl, string Status, string? PrimaryGuardianName, string? PrimaryGuardianPhone
);
public record PatientGuardianDto(
    int Id, string FullName, string Relationship,
    string? Phone, string? WhatsApp, string? Email, bool IsPrimary
);
public record PagedResult<T>(List<T> Items, int TotalCount, int PageNumber, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
```

---

## 🌐 CONTROLLER BASE

```csharp
// [API-CTRL] API/Controllers/PatientsController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class PatientsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PatientListDto>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search, [FromQuery] string? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetPatientsListQuery(search, status, page, pageSize), ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PatientDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetPatientByIdQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value)
             : result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin,Médico,Recepcionista")]
    [ProducesResponseType(typeof(PatientDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create(
        [FromBody] CreatePatientCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd, ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "SuperAdmin,Médico,Recepcionista")]
    [ProducesResponseType(typeof(PatientDto), 200)]
    public async Task<IActionResult> Update(int id,
        [FromBody] UpdatePatientCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd with { Id = id }, ct);
        return result.IsSuccess ? Ok(result.Value)
             : result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "SuperAdmin")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeletePatientCommand(id), ct);
        return result.IsSuccess ? NoContent()
             : result.StatusCode == 404 ? NotFound(result.Error) : BadRequest(result.Error);
    }
}
```

---

## 🗄️ EF CORE — COMANDOS DE MIGRACIÓN

```bash
# ══════════════════════════════════════════════════════════════
# FLUJO COMPLETO DE MIGRACIÓN
# ══════════════════════════════════════════════════════════════

# 1. Crear migración (desde raíz de la solución)
dotnet ef migrations add YYYYMMDD_NombreDescriptivo \
  --project StarMedica.Infrastructure \
  --startup-project StarMedica.API \
  --output-dir Data/Migrations

# 2. Revisar la migración generada (SIEMPRE antes de aplicar)
# Verificar Up() y Down() en el archivo generado

# 3. Aplicar migración
dotnet ef database update \
  --project StarMedica.Infrastructure \
  --startup-project StarMedica.API

# ✅ CHECKPOINT MIGRACIONES:
# Resultado esperado: "Done."
# Si hay error: revisar ConnectionString en appsettings.Development.json

# 4. Revertir si hay error
dotnet ef database update NombreMigracionAnterior \
  --project StarMedica.Infrastructure \
  --startup-project StarMedica.API

# 5. Script SQL para staging/producción (idempotente)
dotnet ef migrations script \
  --project StarMedica.Infrastructure \
  --startup-project StarMedica.API \
  --output ./sql-scripts/migration-$(date +%Y%m%d).sql \
  --idempotent

# 6. Listar migraciones
dotnet ef migrations list \
  --project StarMedica.Infrastructure \
  --startup-project StarMedica.API
```

---

## 🛡️ MIDDLEWARE — MANEJO GLOBAL DE EXCEPCIONES

```csharp
// [API-CTRL] API/Middleware/ExceptionMiddleware.cs
// Referenciado en Program.cs: app.UseMiddleware<ExceptionMiddleware>()
using FluentValidation;
using System.Net;
using System.Text.Json;

namespace StarMedica.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            // FluentValidation — errores de validación del pipeline MediatR
            logger.LogWarning("Validación fallida: {Errors}",
                string.Join(", ", ex.Errors.Select(e => e.ErrorMessage)));
            context.Response.StatusCode  = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            var errors = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray());
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "Error de validación",
                errors
            }));
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning("Acceso no autorizado: {Message}", ex.Message);
            context.Response.StatusCode  = (int)HttpStatusCode.Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = ex.Message
            }));
        }
        catch (KeyNotFoundException ex)
        {
            logger.LogWarning("Recurso no encontrado: {Message}", ex.Message);
            context.Response.StatusCode  = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = ex.Message
            }));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado: {Message}", ex.Message);
            context.Response.StatusCode  = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "Error interno del servidor. Contacte al administrador."
                // NO exponer ex.Message en producción
            }));
        }
    }
}
```

---

## 🔔 SIGNALR — HUB DE NOTIFICACIONES

```csharp
// [API-CTRL] API/Hubs/NotificationHub.cs
// Referenciado en Program.cs: app.MapHub<NotificationHub>("/hubs/notifications")
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace StarMedica.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    // Al conectar: unir al grupo del usuario
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        await base.OnConnectedAsync();
    }

    // Al desconectar: remover del grupo
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        await base.OnDisconnectedAsync(exception);
    }
}

// ── Interfaz para enviar notificaciones desde servicios ────────
public interface INotificationService
{
    Task SendToUserAsync(int userId, string type, object payload);
    Task SendToRoleAsync(string role, string type, object payload);
}

// ── Implementación — inyectable en cualquier Handler ───────────
// Infrastructure/Services/NotificationService.cs
public class NotificationService(IHubContext<NotificationHub> hub) : INotificationService
{
    public async Task SendToUserAsync(int userId, string type, object payload) =>
        await hub.Clients.Group($"user-{userId}")
            .SendAsync("Notification", new { type, payload, sentAt = DateTime.UtcNow });

    public async Task SendToRoleAsync(string role, string type, object payload) =>
        await hub.Clients.Group($"role-{role}")
            .SendAsync("Notification", new { type, payload, sentAt = DateTime.UtcNow });
}

// ── En Infrastructure/DependencyInjection.cs agregar:
// services.AddScoped<INotificationService, NotificationService>();
// ── En Program.cs ya está: app.MapHub<NotificationHub>("/hubs/notifications")
// ── UserIdentifier requiere agregar en Program.cs:
// builder.Services.AddSignalR();
// (El UserIdentifier se toma automáticamente del ClaimTypes.NameIdentifier del JWT)
```

---

## 🔐 AUTENTICACIÓN — FLUJO COMPLETO GIS + JWT PROPIO

> **Decisión de arquitectura:** Se usa Google Identity Services (GIS) para el login con Google.
> GIS devuelve un ID token de Google que la API valida con `Google.Apis.Auth`.
> La API emite **su propio JWT** con los roles de Star Médica.
> Firebase se usa SOLO para FCM push notifications — NO para autenticación.
>
> **Ventaja clave:** Control total de usuarios, roles y sesiones en tu propia BD.
> Sin límites de usuarios. Sin dependencias npm extra en Angular. Bundle ~130KB más liviano.

### Flujo de autenticación completo:

```
[Angular] → Click "Sign in with Google"
    ↓
[GIS/CDN Google] → Popup/One Tap Google
    ↓
[GIS] → Retorna credential.credential (ID token JWT de Google)
    ↓
[Angular] → POST /api/auth/google { idToken: "eyJ..." }
    ↓
[API .NET] → GoogleJsonWebSignature.ValidateAsync(idToken)
    ↓
[API .NET] → Busca/crea User en BD StarMedicaDB
    ↓
[API .NET] → Emite JWT propio con { userId, email, roles, clinic }
    ↓
[Angular] → Guarda JWT en memoria (signal) + refresh token en httpOnly cookie
    ↓
[Angular] → Todas las requests incluyen: Authorization: Bearer {jwt_propio}
```

### Controller de Auth — Endpoint Google:

```csharp
// [API-CTRL] API/Controllers/AuthController.cs
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(IMediator mediator) : ControllerBase
{
    // POST api/auth/google
    // Recibe el ID token de GIS y devuelve JWT propio de Star Médica
    [HttpPost("google")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> LoginWithGoogle(
        [FromBody] GoogleLoginCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd, ct);
        if (!result.IsSuccess) return BadRequest(result.Error);

        // Refresh token en cookie httpOnly (más seguro que localStorage)
        Response.Cookies.Append("sm_refresh", result.Value!.RefreshToken, new CookieOptions
        {
            HttpOnly  = true,
            Secure    = true,
            SameSite  = SameSiteMode.Strict,
            Expires   = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new AuthResponseDto(
            result.Value.AccessToken,
            result.Value.ExpiresAt,
            result.Value.User));
    }

    // POST api/auth/refresh
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshToken = Request.Cookies["sm_refresh"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized("No hay sesión activa.");

        var result = await mediator.Send(new RefreshTokenCommand(refreshToken), ct);
        if (!result.IsSuccess) return Unauthorized(result.Error);

        Response.Cookies.Append("sm_refresh", result.Value!.RefreshToken, new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
            Expires  = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new AuthResponseDto(result.Value.AccessToken, result.Value.ExpiresAt, result.Value.User));
    }

    // POST api/auth/logout
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("sm_refresh");
        return NoContent();
    }
}

// DTOs de Auth
public record GoogleLoginCommand(string IdToken) : IRequest<Result<AuthTokensDto>>;
public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<AuthTokensDto>>;

public record AuthTokensDto(string AccessToken, DateTime ExpiresAt, UserProfileDto User, string RefreshToken);
public record AuthResponseDto(string AccessToken, DateTime ExpiresAt, UserProfileDto User);
// NOTA: RefreshToken NO se devuelve en el body — solo va en cookie httpOnly
public record UserProfileDto(int Id, string FullName, string Email, string? PhotoUrl, string[] Roles);
```

### Handler GoogleLoginCommand — Validación GIS:

```csharp
// [APP-CMD] Application/Features/Auth/Commands/GoogleLogin/GoogleLoginCommandHandler.cs
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class GoogleLoginCommandHandler(
    IUserRepository    userRepo,
    IUnitOfWork        unitOfWork,
    IConfiguration     config,
    IMapper            mapper
) : IRequestHandler<GoogleLoginCommand, Result<AuthTokensDto>>
{
    public async Task<Result<AuthTokensDto>> Handle(
        GoogleLoginCommand cmd, CancellationToken ct)
    {
        // 1. Validar ID token de Google con Google.Apis.Auth
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [config["Google:ClientId"]!]
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(cmd.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            return Result<AuthTokensDto>.Failure("Token de Google inválido o expirado.", 401);
        }

        // 2. Buscar o crear usuario en StarMedicaDB
        var user = await userRepo.FindByEmailAsync(payload.Email, ct);
        if (user is null)
        {
            // Primer login — crear usuario con rol básico
            user = new User
            {
                Email      = payload.Email,
                FullName   = payload.Name,
                PhotoUrl   = payload.Picture,
                GoogleId   = payload.Subject,
                IsActive   = true,
                // Por defecto sin rol — un SuperAdmin debe asignar el rol
                // El guard de Angular redirige a pantalla de "pendiente de aprobación"
            };
            await userRepo.AddAsync(user, ct);
            await unitOfWork.SaveChangesAsync(ct);
        }
        else
        {
            // Actualizar foto si cambió en Google
            if (user.PhotoUrl != payload.Picture)
            {
                user.PhotoUrl = payload.Picture;
                await unitOfWork.SaveChangesAsync(ct);
            }
        }

        if (!user.IsActive)
            return Result<AuthTokensDto>.Failure("Usuario inactivo. Contacte al administrador.", 403);

        // 3. Emitir JWT propio de Star Médica
        var roles        = await userRepo.GetRolesAsync(user.Id, ct);
        var accessToken  = GenerateAccessToken(user, roles, config);
        var refreshToken = GenerateRefreshToken();

        // Guardar refresh token hasheado en BD
        user.RefreshTokenHash    = BCrypt.Net.BCrypt.HashPassword(refreshToken);
        user.RefreshTokenExpiry  = DateTime.UtcNow.AddDays(7);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<AuthTokensDto>.Success(new AuthTokensDto(
            AccessToken:  accessToken,
            ExpiresAt:    DateTime.UtcNow.AddMinutes(int.Parse(config["Jwt:ExpiresInMinutes"]!)),
            User:         new UserProfileDto(user.Id, user.FullName, user.Email, user.PhotoUrl, roles),
            RefreshToken: refreshToken
        ));
    }

    private static string GenerateAccessToken(User user, string[] roles, IConfiguration config)
    {
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(int.Parse(config["Jwt:ExpiresInMinutes"]!));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email,          user.Email),
            new(ClaimTypes.Name,           user.FullName),
            new("photo",                   user.PhotoUrl ?? ""),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer:             config["Jwt:Issuer"],
            audience:           config["Jwt:Audience"],
            claims:             claims,
            expires:            expires,
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
```

---

## ✅ CHECKLIST BACKEND — Por feature

```
SQL (siempre primero):
  [ ] CREATE TABLE: PKs, FKs, índices, constraints
  [ ] Soft-delete: IsDeleted BIT + DeletedAt DATETIME2 si la entidad lo requiere
  [ ] Auditoría: CreatedAt, CreatedBy, UpdatedAt, UpdatedBy en cada tabla principal
  [ ] INSERT seed data idempotente (IF NOT EXISTS o MERGE)
  [ ] ✅ Script ejecutado en SQL Server sin errores

Entidades User/Role (Sprint 1 — prerequisito de todo):
  [ ] User con GoogleId, RefreshTokenHash, RefreshTokenExpiry
  [ ] Role + UserRole (tabla de unión con PK compuesta)
  [ ] UserConfiguration con HasQueryFilter(!IsDeleted) y unique email
  [ ] AuditLog: tabla para registrar cambios críticos (ver entidad en AppDbContext)
  [ ] Seed de roles: SuperAdmin, Médico, Enfermera, Recepcionista, Farmacéutico, Contador, Tutor

Entity Framework:
  [ ] Entidad hereda BaseEntity o SoftDeleteEntity
  [ ] decimal(18,2) para montos GTQ — NUNCA float
  [ ] DateOnly para fechas de nacimiento/citas, DateTime para timestamps
  [ ] Fluent API en Infrastructure/Data/Configurations/[Entidad]Configuration.cs
  [ ] HasQueryFilter(!IsDeleted) en SoftDeleteEntity
  [ ] Migración: YYYYMMDD_NombreDescriptivo
  [ ] ✅ dotnet ef database update — sin errores

Application:
  [ ] Command como record inmutable con IRequest<Result<T>>
  [ ] Handler con primary constructor (.NET 9 style)
  [ ] Validator con reglas GT: DPI 13 dígitos, teléfono 8 dígitos, montos decimal
  [ ] Query con PagedResult<T> para listas
  [ ] DTOs como records
  [ ] AutoMapper profile actualizado en MappingProfile.cs
  [ ] ✅ dotnet build — 0 errores 0 warnings

API:
  [ ] [Authorize(Roles="...")] por cada endpoint — nunca dejar sin autorización
  [ ] [ProducesResponseType] para Swagger
  [ ] Usar Result<T>.StatusCode para decidir código HTTP de respuesta
  [ ] ✅ dotnet build + probar en Swagger UI con token JWT
```

---

*Star Médica ERP — PROMPT-01 BACKEND v6.0*
*Usar con: 00-MASTER + este archivo*
*Stack: .NET 9 · EF Core 9 · MediatR 12.4.1 · FluentValidation 11 · AutoMapper 13*
