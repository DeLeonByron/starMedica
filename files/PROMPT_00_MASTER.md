# 🏥 MASTER PROMPT v6.0 — ERP Star Médica
## 📌 LEER ESTE ARCHIVO AL INICIO DE CADA SESIÓN — ES LA ÚNICA FUENTE DE VERDAD

---

## 🧠 INSTRUCCIONES CRÍTICAS PARA EL AGENTE

```
IDENTIDAD DEL PROYECTO:
  Nombre:      ERP Star Médica
  Tipo:        Sistema de Gestión — Clínica Pediátrica
  País:        Guatemala (UTC-6, GTQ, DPI, FEL SAT, PNI MSPAS)
  Versión:     5.0
  Prompts:     00-MASTER · 01-BACKEND · 02-FRONTEND · 03-DEPLOY
  Presupuesto: Q0.00 — SOLO herramientas gratuitas. No proponer nada de pago.

REGLAS ABSOLUTAS — NUNCA VIOLAR:
  1.  NUNCA cambiar stack ni versiones de este documento.
  2.  NUNCA proponer herramientas, librerías o servicios de pago.
  3.  NUNCA usar 'any' en TypeScript — tipado estricto siempre.
  4.  NUNCA estilos inline — todo en .scss del componente.
  5.  NUNCA todo el componente en un solo .ts — siempre 3 archivos: .ts + .html + .scss
  6.  NUNCA instalar sin versión exacta — usar versiones de la sección STACK.
  7.  SIEMPRE usar nueva sintaxis Angular: @if @for @switch (NO *ngIf *ngFor).
  8.  SIEMPRE usar Signals: signal(), computed(), effect() — NO Subject/BehaviorSubject para estado.
  9.  SIEMPRE generar SQL antes de .NET antes de Angular (orden por feature).
  10. SIEMPRE usar comandos CLI para generar artefactos Angular.
  11. SIEMPRE nombrar migraciones EF: YYYYMMDD_DescripcionCambio
  12. SIEMPRE usar el prefijo [MÓDULO] en los bloques de código generados.
  13. DESPUÉS de cada bloque de código generado, incluir el comando de compilación/verificación.
  14. Si se pierde contexto, preguntar:
      "¿Puedes compartir el MASTER PROMPT v6.0 de Star Médica?"

NUEVA SINTAXIS OBLIGATORIA — ANGULAR 19:
  ✅ @if (condicion) { } @else { }          ← USAR ESTO
  ❌ *ngIf="condicion"                       ← PROHIBIDO

  ✅ @for (item of items; track item.id) { } ← USAR ESTO
  ❌ *ngFor="let item of items"              ← PROHIBIDO

  ✅ @switch (valor) { @case (x) { } }      ← USAR ESTO
  ❌ [ngSwitch] / *ngSwitchCase             ← PROHIBIDO

  ✅ signal(), computed(), effect()         ← Estado reactivo
  ✅ input() / output()                     ← Inputs/Outputs modernos
  ✅ inject()                               ← Inyección de dependencias
  ✅ takeUntilDestroyed(this.destroyRef)    ← Cleanup de suscripciones
  ✅ withComponentInputBinding()            ← Router params como @input
  ❌ constructor() para DI                  ← Usar inject() en su lugar
  ❌ ngOnDestroy + Subject/takeUntil        ← Usar takeUntilDestroyed

ORDEN DE GENERACIÓN POR FEATURE (obligatorio):
  [SQL-DDL]   → CREATE TABLE con índices, constraints, soft-delete, auditoría
  [SQL-SEED]  → INSERT datos de catálogo
  [BUILD-DB]  → ✅ Ejecutar script en SQL Server y verificar sin errores
  [EF-ENTITY] → Entidad C# heredando BaseEntity / SoftDeleteEntity
  [EF-CONFIG] → Fluent API en Infrastructure/Data/Configurations/
  [EF-MIGR]   → dotnet ef migrations add + dotnet ef database update
  [BUILD-BE]  → ✅ dotnet build — verificar 0 errores antes de continuar
  [APP-CMD]   → Command record + Handler + Validator (MediatR 12)
  [APP-QRY]   → Query record + Handler + DTOs paginados
  [API-CTRL]  → Controller con [Authorize(Roles=...)], Swagger docs
  [BUILD-BE]  → ✅ dotnet build — verificar 0 errores
  [NG-MODEL]  → Interface TypeScript tipada (sin any)
  [NG-SVC]    → Angular Service con HttpClient tipado
  [NG-COMP]   → ng generate component ... → 3 archivos .ts/.html/.scss
  [NG-ROUTE]  → Ruta lazy en feature.routes.ts
  [BUILD-FE]  → ✅ ng build --configuration=development — verificar 0 errores

CHECKPOINTS DE COMPILACIÓN — OBLIGATORIOS:
  El agente DEBE incluir al final de cada bloque funcional:
  ┌─────────────────────────────────────────────────────┐
  │ ✅ CHECKPOINT — Verificar antes de continuar:       │
  │   [comando exacto a ejecutar]                       │
  │   Resultado esperado: [descripción]                 │
  │   Si hay error: [qué revisar]                       │
  └─────────────────────────────────────────────────────┘

CONTEXTO PERSISTENTE:
  - BD:              StarMedicaDB (SQL Server Express 2022)
  - Namespace .NET:  StarMedica
  - Prefijo Angular: sm- (selector: <sm-input>, clase CSS: .sm-input)
  - BEM SCSS:        .sm-bloque__elemento--modificador
  - Variables SCSS:  src/styles/_variables.scss (via includePaths)
  - Idioma:          es-GT (español Guatemala)
  - Moneda:          GTQ — formato Q 1,250.00
  - Zona horaria:    America/Guatemala (UTC-6, sin DST)
```

---

## 🌎 CONTEXTO GEOGRÁFICO — GUATEMALA

| Dato | Valor | Validación |
|------|-------|-----------|
| Moneda | Quetzal (GTQ) | Formato: `Q 1,250.00` |
| Idioma | `es-GT` | Español Guatemala |
| Zona horaria | `America/Guatemala` | UTC-6, sin horario de verano |
| Fecha | `dd/MM/yyyy` | Pipe: `date:'dd/MM/yyyy'` |
| Teléfonos | +502 + 8 dígitos | Máscara: `####-####` |
| DPI | 13 dígitos | Validación módulo 11 |
| NIT SAT | `1234567-8` | Regex: `^\d{1,8}-\d{1}$` |
| Facturación | FEL SAT Guatemala | ≠ CFDI México |
| Seguro social | IGSS | 1545 |
| Salud pública | MSPAS | — |
| Vacunación | PNI MSPAS GT | 12 vacunas oficiales |
| Diagnósticos | CIE-10 | Estándar usado en GT |
| Emergencias | 110 PNC · 122 Bomberos · 123 Cruz Roja | — |
| Departamentos | 22 oficiales | Catálogo en SQL-SEED |
| Municipios | 340 totales | Por departamento |

---

## 📌 STACK — VERSIONES FIJADAS (NO INVESTIGAR, NO CAMBIAR)

> ⚠️ Análisis de compatibilidad ya realizado. Angular 19.2 es la versión máxima
> donde TODAS las librerías del stack tienen soporte oficial verificado.
> Angular 20/21 no tienen soporte en ngx-leaflet ni ngx-dropzone.
> Auth de Google usa GIS (Google Identity Services) — sin dependencias npm, solo script CDN de Google.

### Backend (.NET 9)

| Paquete | Versión | Nota clave |
|---------|---------|-----------|
| .NET Runtime | **9.0** | LTS |
| EF Core SqlServer | **9.0.0** | |
| EF Core Tools | **9.0.0** | PrivateAssets=all |
| EF Core Design | **9.0.0** | PrivateAssets=all |
| MediatR | **12.4.1** | DI incluido — NO instalar Extensions por separado |
| FluentValidation | **11.11.0** | |
| FluentValidation.DI | **11.11.0** | |
| FluentValidation.AspNetCore | **11.3.0** | |
| AutoMapper | **13.0.1** | |
| AutoMapper.DI | **13.0.1** | |
| QuestPDF | **2024.12.0** | Community — gratis |
| MailKit | **4.8.0** | |
| CloudinaryDotNet | **1.27.0** | Free tier 25GB |
| JwtBearer | **9.0.0** | |
| Google.Apis.Auth | **1.68.0** | |
| Swashbuckle.AspNetCore | **7.2.0** | .NET 9 compatible |
| Serilog.AspNetCore | **9.0.0** | |
| Serilog.Sinks.File | **6.0.0** | |
| BCrypt.Net-Next | **4.0.3** | |

### Frontend (Angular 19 / Node 22)

| Paquete | Versión | Nota clave |
|---------|---------|-----------|
| Node.js | **22.x LTS** | Requerido |
| @angular/cli | **19.2.x** | |
| @angular/core | **19.2.x** | |
| @angular/cdk | **19.2.x** | Misma versión que Angular |
| tailwindcss | **4.0.17** | v4 — sin tailwind.config.js |
| @tailwindcss/vite | **4.0.17** | Plugin Vite |
| lucide-angular | **0.474.0** | provideIcons() — no forRoot() |
| @phosphor-icons/webcomponents | **2.1.1** | Web Components médicos |
| @fullcalendar/angular | **6.1.15** | ⚠️ TODOS los @fullcalendar misma versión |
| @fullcalendar/core | **6.1.15** | |
| @fullcalendar/daygrid | **6.1.15** | |
| @fullcalendar/timegrid | **6.1.15** | |
| @fullcalendar/interaction | **6.1.15** | |
| chart.js | **4.4.7** | Breaking changes vs 3.x |
| ng2-charts | **7.0.0** | BaseChartDirective standalone |
| leaflet | **1.9.4** | |
| @asymmetrik/ngx-leaflet | **17.0.0** | |
| @types/leaflet | **1.9.14** | devDependency |
| @angular/fire | **19.0.0** | Solo para FCM push notifications — NO para auth |
| firebase | **11.2.0** | Solo FCM — auth lo maneja GIS + tu API JWT |
| @microsoft/signalr | **8.0.7** | Cliente para SignalR .NET 9 |
| date-fns | **4.1.0** | v4 — API inmutable nueva |
| jspdf | **2.5.2** | |
| jspdf-autotable | **3.8.4** | |
| xlsx | **0.18.5** | SheetJS Community — gratis |
| ngx-mask | **19.0.0** | provideNgxMask() |
| ngx-dropzone | **3.1.0** | |

### Servicios Externos — 100% Gratuitos

| Servicio | Plan | Límite gratuito | Uso |
|----------|------|----------------|-----|
| SQL Server Express 2022 | Free | 10GB DB | Base de datos |
| Railway.app | Hobby | $5 crédito/mes gratis | Deploy API |
| Vercel | Free | Ilimitado proyectos | Deploy Angular |
| Cloudinary | Free | 25GB storage | Fotos pacientes |
| Resend.com | Free | 3,000 emails/mes | Email transaccional |
| Meta WhatsApp Cloud | Free | 1,000 conv/mes | Recordatorios |
| Firebase (Spark) | Free | 1M push notif/mes | Solo FCM push notifications |
| Google Identity Services | Free | Sin límites | Login con Google (GIS) — sin npm |
| Let's Encrypt | Free | Ilimitado | SSL/TLS |
| OpenStreetMap + Nominatim | Free | Sin límite | Mapas + Geocoding |
| GitHub | Free | Repos privados ilimitados | Control de versiones |

---

## 📁 ESTRUCTURA DE CARPETAS

### Backend — Clean Architecture:
```
StarMedica/
├── StarMedica.sln
├── src/
│   ├── StarMedica.Domain/
│   │   ├── Entities/            ← Una entidad por archivo
│   │   ├── Enums/
│   │   ├── Interfaces/
│   │   │   ├── IRepository.cs
│   │   │   └── IUnitOfWork.cs
│   │   └── Common/
│   │       ├── BaseEntity.cs    ← Id, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
│   │       ├── SoftDeleteEntity.cs ← + IsDeleted, DeletedAt
│   │       └── Result.cs        ← Result<T> pattern
│   │
│   ├── StarMedica.Application/
│   │   ├── Features/
│   │   │   ├── Patients/
│   │   │   │   ├── Commands/CreatePatient/
│   │   │   │   │   ├── CreatePatientCommand.cs
│   │   │   │   │   ├── CreatePatientCommandHandler.cs
│   │   │   │   │   └── CreatePatientCommandValidator.cs
│   │   │   │   └── Queries/GetPatientsList/
│   │   │   └── [otros módulos mismo patrón]
│   │   ├── DTOs/
│   │   ├── Mappings/MappingProfile.cs
│   │   ├── Behaviors/ValidationBehavior.cs
│   │   └── DependencyInjection.cs
│   │
│   ├── StarMedica.Infrastructure/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/  ← Fluent API por entidad
│   │   │   ├── Migrations/
│   │   │   ├── Repositories/
│   │   │   └── Seeders/DatabaseSeeder.cs
│   │   ├── Services/
│   │   │   ├── CloudinaryService.cs
│   │   │   ├── EmailService.cs
│   │   │   └── WhatsAppService.cs
│   │   └── DependencyInjection.cs
│   │
│   └── StarMedica.API/
│       ├── Controllers/
│       ├── Hubs/NotificationHub.cs
│       ├── Middleware/ExceptionMiddleware.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── appsettings.Staging.json     ← ⬅ NUEVO
│       ├── appsettings.Production.json  ← ⬅ NUEVO
│       └── Program.cs
│
└── tests/
    ├── StarMedica.Application.Tests/
    └── StarMedica.API.Tests/
```

### Frontend — Angular 19 Feature-based:
```
star-medica/
├── src/
│   ├── app/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts / .html / .scss
│   │   ├── core/
│   │   │   ├── constants/navigation.ts
│   │   │   ├── guards/auth.guard.ts · role.guard.ts
│   │   │   ├── interceptors/auth.interceptor.ts · error.interceptor.ts
│   │   │   ├── models/api-response.model.ts
│   │   │   └── services/auth.service.ts · toast.service.ts · signalr.service.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── sm-input/        (.ts + .html + .scss)
│   │   │   │   ├── sm-button/
│   │   │   │   ├── sm-modal/
│   │   │   │   ├── sm-table/
│   │   │   │   ├── sm-alert/
│   │   │   │   ├── sm-loader/
│   │   │   │   ├── sm-badge/
│   │   │   │   ├── sm-confirm-dialog/
│   │   │   │   ├── sm-card/
│   │   │   │   ├── sm-sidebar/
│   │   │   │   ├── sm-breadcrumb/
│   │   │   │   ├── sm-map/
│   │   │   │   ├── sm-empty-state/
│   │   │   │   └── sm-growth-chart/
│   │   │   ├── pipes/
│   │   │   │   ├── gtq-currency.pipe.ts
│   │   │   │   └── gt-date.pipe.ts
│   │   │   └── directives/
│   │   └── features/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── patients/
│   │       ├── appointments/
│   │       ├── consultations/
│   │       ├── vaccines/
│   │       ├── pharmacy/
│   │       ├── billing/
│   │       └── reports/
│   ├── environments/
│   │   ├── environment.ts           ← Development (localhost)
│   │   ├── environment.staging.ts   ← ⬅ NUEVO Staging (Railway preview)
│   │   └── environment.production.ts ← Production (Railway + Vercel)
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       ├── _typography.scss
│       ├── _animations.scss
│       ├── _utilities.scss
│       ├── _dark-mode.scss
│       ├── _reset.scss
│       └── _leaflet-overrides.scss
├── angular.json
├── vite.config.ts
└── package.json
```

---

## 🌍 ENVIRONMENTS — 3 AMBIENTES DE PRUEBA

### `src/environments/environment.model.ts` — Tipo compartido (crear primero):
```typescript
// Tipo para que TypeScript valide todos los environments igual
export interface Environment {
  name:              'development' | 'staging' | 'production';
  production:        boolean;
  staging:           boolean;
  apiUrl:            string;
  signalRUrl:        string;
  googleClientId:    string;
  cloudinaryCloudName: string;
  cloudinaryFolder:  string;
  firebaseConfig: {
    apiKey:            string;
    authDomain:        string;
    projectId:         string;
    storageBucket:     string;
    messagingSenderId: string;
    appId:             string;
  };
  enableDebugTools:  boolean;
  logLevel:          'debug' | 'info' | 'warn' | 'error';
  mockWhatsApp:      boolean;
  mockEmail:         boolean;
}
```

### `src/environments/environment.ts` — Development (local):
```typescript
import { Environment } from './environment.model';

export const environment: Environment = {
  name:        'development',
  production:  false,
  staging:     false,
  apiUrl:      'http://localhost:5000/api',
  signalRUrl:  'http://localhost:5000/hubs',
  // Cloudinary — cuenta dev (misma cuenta, carpeta diferente)
  cloudinaryCloudName: 'tu-cloud-name',
  cloudinaryFolder:    'starmedica-dev',
  // Google Identity Services (GIS) — Solo Client ID, sin paquete npm
  // El script se carga desde CDN de Google en index.html
  googleClientId: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  // Firebase — SOLO para FCM push notifications (no para auth)
  firebaseConfig: {
    apiKey:            'TU_API_KEY_DEV',
    authDomain:        'tu-proyecto.firebaseapp.com',
    projectId:         'tu-proyecto',
    storageBucket:     'tu-proyecto.appspot.com',
    messagingSenderId: '123456789',
    appId:             '1:123456789:web:abc123'
  },
  // Flags para desarrollo
  enableDebugTools:  true,
  logLevel:          'debug',
  mockWhatsApp:      true,    // No enviar WhatsApp real en dev
  mockEmail:         true,    // No enviar emails reales en dev
};
```

### `src/environments/environment.staging.ts` — Staging (Railway preview):
```typescript
import { Environment } from './environment.model';

export const environment: Environment = {
  name:        'staging',
  production:  false,
  staging:     true,
  apiUrl:      'https://starmedica-api-staging.railway.app/api',
  signalRUrl:  'https://starmedica-api-staging.railway.app/hubs',
  cloudinaryCloudName: 'tu-cloud-name',
  cloudinaryFolder:    'starmedica-staging',
  googleClientId: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  // Firebase — SOLO FCM
  firebaseConfig: {
    apiKey:            'TU_API_KEY_STAGING',
    authDomain:        'tu-proyecto-staging.firebaseapp.com',
    projectId:         'tu-proyecto-staging',
    storageBucket:     'tu-proyecto-staging.appspot.com',
    messagingSenderId: '987654321',
    appId:             '1:987654321:web:def456'
  },
  enableDebugTools:  true,
  logLevel:          'warn',
  mockWhatsApp:      true,    // Staging tampoco envía WhatsApp real
  mockEmail:         false,   // Staging SÍ envía emails (para pruebas reales)
};
```

### `src/environments/environment.production.ts` — Production:
```typescript
import { Environment } from './environment.model';

export const environment: Environment = {
  name:        'production',
  production:  true,
  staging:     false,
  apiUrl:      'https://starmedica-api.railway.app/api',
  signalRUrl:  'https://starmedica-api.railway.app/hubs',
  cloudinaryCloudName: 'tu-cloud-name',
  cloudinaryFolder:    'starmedica',
  googleClientId: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  // Firebase — SOLO FCM
  firebaseConfig: {
    apiKey:            'TU_API_KEY_PROD',
    authDomain:        'tu-proyecto-prod.firebaseapp.com',
    projectId:         'tu-proyecto-prod',
    storageBucket:     'tu-proyecto-prod.appspot.com',
    messagingSenderId: '111222333',
    appId:             '1:111222333:web:ghi789'
  },
  enableDebugTools:  false,
  logLevel:          'error',
  mockWhatsApp:      false,
  mockEmail:         false,
};
```

### `angular.json` — Configurar los 3 environments:
```json
{
  "projects": {
    "star-medica": {
      "architect": {
        "build": {
          "options": {
            "inlineStyleLanguage": "scss",
            "stylePreprocessorOptions": {
              "includePaths": ["src/styles"]
            }
          },
          "configurations": {
            "production": {
              "fileReplacements": [{
                "replace": "src/environments/environment.ts",
                "with":    "src/environments/environment.production.ts"
              }],
              "optimization": true,
              "outputHashing": "all"
            },
            "staging": {
              "fileReplacements": [{
                "replace": "src/environments/environment.ts",
                "with":    "src/environments/environment.staging.ts"
              }],
              "optimization": true,
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          }
        }
      }
    }
  }
}
```

### Comandos por ambiente:
```bash
# Development (local)
ng serve                                      # http://localhost:4200
ng build --configuration=development          # Verificar compilación

# Staging (pruebas integradas)
ng build --configuration=staging              # Build staging
ng serve --configuration=staging              # Servir con env staging

# Production
ng build --configuration=production           # Build prod (minificado)
```

---

## 🔄 REGISTRO DE PROGRESO — Actualizar en cada sesión

```
Sprint activo: ___
Última feature completada: ___
Ambiente actual de pruebas: [ ] Development  [ ] Staging  [ ] Production

Sprints:
  [ ] Sprint 0  — Infraestructura + Scaffolding
  [ ] Sprint 1  — Auth + Design System
  [ ] Sprint 2  — Pacientes + Geo
  [ ] Sprint 3  — Citas + WhatsApp
  [ ] Sprint 4  — Expediente clínico
  [ ] Sprint 5  — Vacunación PNI
  [ ] Sprint 6  — Farmacia + Recordatorios
  [ ] Sprint 7  — Facturación FEL SAT
  [ ] Sprint 8  — Portal Paciente/Tutor
  [ ] Sprint 9  — MCP + IA Asistente
  [ ] Sprint 10 — Reportes + Pulido final

Migraciones EF aplicadas:
  [ ] 20240101_InitialCreate
  [ ] (agregar cada migración aquí)

Componentes shared completados:
  [ ] sm-input · [ ] sm-button · [ ] sm-modal · [ ] sm-table
  [ ] sm-alert · [ ] sm-loader · [ ] sm-badge · [ ] sm-confirm-dialog
  [ ] sm-card  · [ ] sm-sidebar · [ ] sm-breadcrumb · [ ] sm-empty-state
  [ ] sm-map   · [ ] sm-growth-chart

APIs integradas:
  [ ] Google Identity Services (GIS) · [ ] WhatsApp Business · [ ] Cloudinary
  [ ] Firebase FCM · [ ] Resend email · [ ] OpenStreetMap
  [ ] FEL SAT GT  · [ ] SignalR
```

---

## 🚀 SPRINT 0 — INFRAESTRUCTURA (primer sprint, ejecutar en orden)

```
OBJETIVO: Tener backend corriendo con BD, frontend scaffoldeado y auth funcionando.
Este sprint es prerequisito de todos los demás.

PASO 1 — Google Cloud Console (5 min):
  1. Ir a https://console.cloud.google.com → Crear proyecto "star-medica"
  2. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
  3. Application type: Web application
  4. Authorized JavaScript origins:
       http://localhost:4200
       https://starmedica.vercel.app        ← agregar después del deploy
  5. Authorized redirect URIs: (dejar vacío — GIS no usa redirect)
  6. Copiar Client ID → pegar en environment.ts (googleClientId) y appsettings (Google:ClientId)

PASO 2 — Solución .NET (en orden):
  dotnet new sln -n StarMedica
  dotnet new classlib -n StarMedica.Domain -o src/StarMedica.Domain --framework net9.0
  dotnet new classlib -n StarMedica.Application -o src/StarMedica.Application --framework net9.0
  dotnet new classlib -n StarMedica.Infrastructure -o src/StarMedica.Infrastructure --framework net9.0
  dotnet new webapi -n StarMedica.API -o src/StarMedica.API --framework net9.0
  dotnet sln add src/StarMedica.Domain src/StarMedica.Application src/StarMedica.Infrastructure src/StarMedica.API
  dotnet add src/StarMedica.Application reference src/StarMedica.Domain
  dotnet add src/StarMedica.Infrastructure reference src/StarMedica.Application
  dotnet add src/StarMedica.API reference src/StarMedica.Infrastructure
  ✅ dotnet build → debe compilar sin errores

PASO 3 — Base de datos:
  Ejecutar SQL scripts en orden: 01_CreateDatabase → 02_Catalogs → 03_Security → 04_Patients
  ✅ SELECT * FROM Departments → debe mostrar 22 departamentos

PASO 4 — Migraciones EF:
  dotnet ef migrations add 20240101_InitialCreate --project StarMedica.Infrastructure --startup-project StarMedica.API
  dotnet ef database update --project StarMedica.Infrastructure --startup-project StarMedica.API
  ✅ dotnet run --project StarMedica.API → Swagger en http://localhost:5000/swagger

PASO 5 — Angular:
  npm install -g @angular/cli@19.2
  ng new star-medica --routing --style=scss --standalone --inline-template=false --inline-style=false --skip-tests
  cd star-medica && [instalar todas las dependencias del prompt FRONTEND]
  ✅ ng serve → http://localhost:4200 sin errores de compilación

PASO 6 — Auth Sprint 1:
  Implementar: SQL Users/Roles → EF → GIS login → JWT → guards → componente login
  ✅ Login con Google completo y funcional antes de avanzar a Sprint 2
```

---

## ❓ DIAGNÓSTICO — El agente pregunta si hay ambigüedad

```
1. "¿A qué sprint/módulo corresponde esta tarea?"
2. "¿Ya existe la tabla SQL para esta funcionalidad?"
3. "¿Ya existe la migración EF correspondiente?"
4. "¿El componente Angular es nuevo o modifica uno existente?"
5. "¿Se requiere nuevo endpoint API o ya existe?"
6. "¿En qué ambiente se está probando: dev, staging o prod?"
```

---

*Star Médica ERP — MASTER PROMPT v6.0*
*Clínica Pediátrica · Ciudad de Guatemala · Presupuesto: Q0.00*
*Stack: SQL Server Express 2022 + EF Core 9 + .NET 9 + Angular 19.2 + Tailwind v4 + SCSS*
*Iconos: Lucide Angular 0.474 + Phosphor Icons 2.1*
*Ambientes: Development · Staging · Production*
*Prompts: 00-MASTER · 01-BACKEND · 02-FRONTEND · 03-DEPLOY*
