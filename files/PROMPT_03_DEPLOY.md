# 🚀 PROMPT-03 DEPLOY — ERP Star Médica
## Railway (API) · Vercel (Frontend) · GitHub Actions · 100% Gratuito · Q0.00
## ⚠️ USAR JUNTO AL MASTER PROMPT v6.0 — No reemplaza, complementa.

---

## 🧠 INSTRUCCIONES DEPLOY

```
REGLAS DEPLOY:
  1. SOLO plataformas gratuitas — Railway free tier, Vercel free tier.
  2. NUNCA secrets/keys en código — siempre variables de entorno de la plataforma.
  3. SIEMPRE 3 ambientes: Development (local) → Staging → Production.
  4. SIEMPRE verificar build local antes de hacer push.
  5. SIEMPRE probar en Staging antes de promover a Production.
  6. GitHub Actions para CI/CD — gratis con repos públicos y privados.

CHECKPOINTS DEPLOY:
  ┌─────────────────────────────────────────────────────────────┐
  │ ✅ ANTES DE PUSH A STAGING:                                 │
  │   dotnet build && dotnet test                               │
  │   ng build --configuration=staging                          │
  │                                                             │
  │ ✅ ANTES DE PUSH A PRODUCTION:                              │
  │   Validar que staging funciona correctamente                │
  │   ng build --configuration=production                       │
  │   Revisar variables de entorno en Railway y Vercel          │
  └─────────────────────────────────────────────────────────────┘

PLATAFORMAS (todas en tier gratuito):
  API:      Railway.app   — 500 horas/mes gratis · $5 crédito/mes
  Frontend: Vercel        — Ilimitado · custom domain gratis
  BD:       SQL Server Express (local o Railway plugin)
  Storage:  Cloudinary    — 25GB gratis
  Email:    Resend.com    — 3,000/mes gratis
  Push:     Firebase FCM  — 1M notif/mes gratis
  SSL:      Let's Encrypt — Automático en Railway y Vercel
```

---

## 📁 ARCHIVOS DE CONFIGURACIÓN CI/CD

### `.github/workflows/ci-backend.yml`:
```yaml
name: CI — Backend .NET 9

on:
  push:
    branches: [main, staging, develop]
    paths: ['src/StarMedica.**/**']
  pull_request:
    branches: [main, staging]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET 9
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Restore packages
        run: dotnet restore StarMedica.sln

      - name: Build
        run: dotnet build StarMedica.sln --no-restore --configuration Release

      - name: Test
        run: dotnet test StarMedica.sln --no-build --configuration Release \
             --verbosity normal --collect:"XPlat Code Coverage"

      # ✅ CHECKPOINT: Build succeeded + tests passed
```

### `.github/workflows/ci-frontend.yml`:
```yaml
name: CI — Frontend Angular 19

on:
  push:
    branches: [main, staging, develop]
    paths: ['star-medica/**']
  pull_request:
    branches: [main, staging]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          cache: 'npm'
          cache-dependency-path: star-medica/package-lock.json

      - name: Install dependencies
        working-directory: star-medica
        run: npm ci

      - name: Build staging
        working-directory: star-medica
        run: npm run build:staging
        # Requiere script en package.json: "build:staging": "ng build --configuration=staging"

      - name: Build production (solo en push a main)
        if: github.ref == 'refs/heads/main'
        working-directory: star-medica
        run: npm run build:prod
        # "build:prod": "ng build --configuration=production"

      # ✅ CHECKPOINT: Build complete sin errores
```

### `star-medica/package.json` — Scripts de build:
```json
{
  "scripts": {
    "start":          "ng serve",
    "start:staging":  "ng serve --configuration=staging",
    "build":          "ng build",
    "build:dev":      "ng build --configuration=development",
    "build:staging":  "ng build --configuration=staging",
    "build:prod":     "ng build --configuration=production",
    "lint":           "ng lint",
    "test":           "ng test --watch=false --browsers=ChromeHeadless"
  }
}
```

---

## 🚂 RAILWAY — DEPLOY DEL API .NET 9

### Paso 1: Preparar el proyecto para Railway:

```dockerfile
# StarMedica.API/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/StarMedica.API/StarMedica.API.csproj", "src/StarMedica.API/"]
COPY ["src/StarMedica.Application/StarMedica.Application.csproj", "src/StarMedica.Application/"]
COPY ["src/StarMedica.Domain/StarMedica.Domain.csproj", "src/StarMedica.Domain/"]
COPY ["src/StarMedica.Infrastructure/StarMedica.Infrastructure.csproj", "src/StarMedica.Infrastructure/"]
RUN dotnet restore "src/StarMedica.API/StarMedica.API.csproj"
COPY . .
WORKDIR "/src/src/StarMedica.API"
RUN dotnet build "StarMedica.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "StarMedica.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StarMedica.API.dll"]
```

```yaml
# railway.toml (en raíz del repo)
[build]
  dockerfilePath = "StarMedica.API/Dockerfile"

[deploy]
  startCommand = "dotnet StarMedica.API.dll"
  healthcheckPath = "/health"
  healthcheckTimeout = 60
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3
```

### Paso 2: Variables de entorno en Railway:

```bash
# Configurar en Railway Dashboard → Variables
# (NUNCA en código — Railway las inyecta como env vars)

ConnectionStrings__StarMedicaDB=Server=...;Database=StarMedicaDB;...
Jwt__Key=TuClaveSecretaMuyLargaMinimo32Caracteres!
Jwt__Issuer=StarMedica.API
Jwt__Audience=StarMedica.Client
Jwt__ExpiresInMinutes=60

AllowedOrigins__0=https://starmedica.vercel.app
AllowedOrigins__1=https://starmedica.gt

Google__ClientId=TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com
# Google__ClientId: usado por Google.Apis.Auth en el backend para validar ID tokens de GIS
# En el frontend, el mismo Client ID va en environment.ts → googleClientId
# GIS no requiere secrets ni API keys adicionales en el backend

Cloudinary__CloudName=tu-cloud-name
Cloudinary__ApiKey=tu-api-key
Cloudinary__ApiSecret=tu-api-secret
Cloudinary__Folder=starmedica

Resend__ApiKey=re_TU_API_KEY
Resend__FromEmail=no-reply@starmedica.gt
Resend__MockMode=false

WhatsApp__AccessToken=TU_META_ACCESS_TOKEN
WhatsApp__PhoneNumberId=TU_PHONE_NUMBER_ID
WhatsApp__MockMode=false

ASPNETCORE_ENVIRONMENT=Production
```

### Paso 3: Health check endpoint:

```csharp
// En Program.cs — agregar antes de app.MapControllers()
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(new {
                status  = report.Status.ToString(),
                db      = report.Entries.ContainsKey("db") ? report.Entries["db"].Status.ToString() : "N/A",
                checked = DateTime.UtcNow
            }));
    }
});

// En builder.Services agregar:
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("StarMedicaDB")!,
                  name: "db", tags: ["db", "sql"]);
// NuGet: AspNetCore.HealthChecks.SqlServer (gratis)
```

---

## 🔺 VERCEL — DEPLOY DEL FRONTEND ANGULAR 19

### Paso 1: `vercel.json` en la raíz de `star-medica/`:

```json
{
  "framework": "angular",
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist/star-medica/browser",
  "installCommand": "npm ci",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Paso 2: Variables de entorno en Vercel:

```bash
# Vercel Dashboard → Project → Settings → Environment Variables
# Configurar para Production y Preview (staging)

# NOTA: Angular no usa process.env en runtime.
# Las variables de ambiente están en los archivos environment.ts
# que se reemplazan en build time por angular.json fileReplacements.
# Solo se necesitan variables en Vercel si usas SSR (no aplica aquí).

# Para staging en Vercel Preview:
# El build usa environment.staging.ts cuando el branch es 'staging'
# Configurar en vercel.json con buildCommand según branch si es necesario.
```

### Paso 3: `vercel.json` con build dinámico por rama:

```json
{
  "framework": "angular",
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist/star-medica/browser",
  "installCommand": "npm ci",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options",    "value": "nosniff" },
        { "key": "X-Frame-Options",           "value": "DENY" },
        { "key": "X-XSS-Protection",          "value": "1; mode=block" },
        { "key": "Referrer-Policy",           "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",        "value": "camera=(), microphone=(), geolocation=(self)" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Script de build dinámico por rama (en `star-medica/scripts/vercel-build.sh`):

```bash
#!/bin/bash
# Vercel inyecta VERCEL_GIT_COMMIT_REF con el nombre del branch
BRANCH="${VERCEL_GIT_COMMIT_REF:-main}"

echo "Branch detectado: $BRANCH"

if [ "$BRANCH" = "staging" ]; then
  echo "Build STAGING"
  npm run build:staging
else
  echo "Build PRODUCTION"
  npm run build:prod
fi
```

```json
// vercel.json — usar el script dinámico:
{
  "buildCommand": "chmod +x scripts/vercel-build.sh && ./scripts/vercel-build.sh"
}
```

---

## 🗄️ BASE DE DATOS EN RAILWAY

```bash
# Railway ofrece PostgreSQL gratis, pero nuestro stack usa SQL Server.
# Opciones gratuitas para la BD:

# OPCIÓN 1: SQL Server Express local (desarrollo)
# - Instalar SQL Server Express 2022 en máquina local
# - Para staging: usar Railway con Docker SQL Server
# - Costo: Q0.00

# OPCIÓN 2: Docker SQL Server en Railway (staging/prod)
# railway.toml para SQL Server:
```

```yaml
# docker-compose.yml — Para desarrollo local completo
version: '3.8'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "StarMedica@2025Dev!"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Express"     # Express = gratis
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

  api:
    build:
      context: .
      dockerfile: StarMedica.API/Dockerfile
    environment:
      ConnectionStrings__StarMedicaDB: "Server=sqlserver;Database=StarMedicaDB;User Id=sa;Password=StarMedica@2025Dev!;TrustServerCertificate=True;"
      ASPNETCORE_ENVIRONMENT: "Development"
      Jwt__Key: "DevKey_MinMax32Chars_StarMedica2025!"
    ports:
      - "5000:8080"
    depends_on:
      - sqlserver

  frontend:
    build:
      context: ./star-medica
      dockerfile: Dockerfile.frontend
    ports:
      - "4200:80"
    depends_on:
      - api

volumes:
  sqlserver_data:
```

---

## 📄 ARCHIVOS DE CONFIGURACIÓN DEL REPOSITORIO

### `.gitignore` — Raíz del mono-repo:
```gitignore
# .NET
**/bin/
**/obj/
**/*.user
**/.vs/
**/appsettings.Development.json
**/appsettings.Staging.json
**/appsettings.Production.json
# ↑ NUNCA en git — solo appsettings.json base (sin secrets)
**/firebase-service-account.json
**/logs/
**/*.log

# Angular
star-medica/node_modules/
star-medica/dist/
star-medica/.angular/
star-medica/.env

# Entornos con secrets
**/.env
**/.env.local
**/.env.production

# IDEs
.idea/
.vscode/settings.json
*.suo
*.ntvs*
*.njsproj
*.sln.docstates

# OS
.DS_Store
Thumbs.db
```

### `.dockerignore` — Para el Dockerfile de la API:
```dockerignore
**/bin
**/obj
**/.vs
**/node_modules
**/dist
**/*.md
**/.git
**/.gitignore
**/appsettings.Development.json
**/appsettings.Staging.json
**/logs
**/*.log
tests/
```

### Estructura de branches en GitHub:
```
main     ← Production (protegida, solo merge desde staging)
staging  ← Pre-producción (deploy automático a Railway staging)
develop  ← Integración (PRs de features van aquí primero)
feature/* ← Una branch por feature (se elimina al mergear)

Flujo:
  feature/xxx → develop → staging → main
```

---

## 🔄 FLUJO COMPLETO DE DEPLOY

```bash
# ══════════════════════════════════════════════════════════════
# FLUJO DEVELOPMENT → STAGING → PRODUCTION
# ══════════════════════════════════════════════════════════════

# 1. DESARROLLO LOCAL
git checkout -b feature/nombre-feature
# ... desarrollar y probar localmente

# ✅ CHECKPOINT LOCAL:
dotnet build && dotnet test
cd star-medica && ng build --configuration=development
cd star-medica && ng serve  # Probar en http://localhost:4200

# 2. PUSH A STAGING
git checkout staging
git merge feature/nombre-feature
git push origin staging

# Railway detecta el push y hace deploy automático a staging
# Vercel Preview deployment se activa automáticamente

# ✅ CHECKPOINT STAGING:
# Probar en: https://starmedica-api-staging.railway.app/health
# Probar en: https://starmedica-git-staging.vercel.app
# Verificar: autenticación, CRUD, SignalR, emails (si no MockMode)

# 3. PROMOCIONAR A PRODUCCIÓN
git checkout main
git merge staging
git push origin main

# ✅ CHECKPOINT PRODUCCIÓN:
# Probar en: https://starmedica-api.railway.app/health
# Probar en: https://starmedica.vercel.app
# Monitorear: Railway logs en dashboard
```

---

## 🔒 VARIABLES DE ENTORNO — GUÍA COMPLETA

```bash
# ══════════════════════════════════════════════════════════════
# RAILWAY — Variables para API .NET 9
# ══════════════════════════════════════════════════════════════
# Sintaxis Railway para appsettings anidado: __ (doble underscore)
# "ConnectionStrings:StarMedicaDB" → ConnectionStrings__StarMedicaDB

# Obligatorias en todos los ambientes:
ASPNETCORE_ENVIRONMENT            = Production | Staging
ConnectionStrings__StarMedicaDB   = [connection string]
Jwt__Key                          = [min 32 chars]
Jwt__Issuer                       = StarMedica.API
Jwt__Audience                     = StarMedica.Client
AllowedOrigins__0                 = [URL del frontend]

# Opcionales (con MockMode para no-producción):
Cloudinary__CloudName             = [cloud name]
Cloudinary__ApiKey                = [api key]
Cloudinary__ApiSecret             = [api secret]
Resend__ApiKey                    = [api key]
Resend__MockMode                  = true | false
WhatsApp__AccessToken             = [token]
WhatsApp__MockMode                = true | false

# ══════════════════════════════════════════════════════════════
# VERCEL — Variables para Angular (build time)
# ══════════════════════════════════════════════════════════════
# Angular no necesita env vars en runtime si se usan environments.ts
# Las variables quedan embebidas en el bundle durante ng build
```

---

## 📋 CHECKLIST DEPLOY — Por ambiente

```
Development (local):
  [ ] SQL Server Express corriendo
  [ ] dotnet run (API en localhost:5000)
  [ ] ng serve (Frontend en localhost:4200)
  [ ] ✅ Swagger accesible en http://localhost:5000/swagger
  [ ] ✅ Login con Google funciona (GIS botón renderizado, token válido en API)
  [ ] ✅ SignalR conecta correctamente

Staging:
  [ ] Push a branch 'staging'
  [ ] ✅ Railway build exitoso (ver logs)
  [ ] ✅ /health retorna status healthy
  [ ] ✅ Vercel Preview deployment generado
  [ ] ✅ CORS configurado para URL de Vercel Preview
  [ ] ✅ Migraciones ejecutadas (auto en Program.cs)
  [ ] ✅ Pruebas manuales de flujos principales

Production:
  [ ] Merge staging → main
  [ ] ✅ Railway build producción exitoso
  [ ] ✅ Vercel production deployment
  [ ] ✅ SSL activo (automático en ambas plataformas)
  [ ] ✅ Custom domain configurado (si aplica)
  [ ] ✅ Variables de entorno producción configuradas
  [ ] ✅ MockMode = false en Resend y WhatsApp
  [ ] ✅ Monitoreo activo (Railway logs)
```

---

*Star Médica ERP — PROMPT-03 DEPLOY v6.0*
*Usar con: 00-MASTER + este archivo*
*Plataformas: Railway (API) + Vercel (FE) + GitHub Actions (CI/CD) = Q0.00*
*Ambientes: Development → Staging → Production*
