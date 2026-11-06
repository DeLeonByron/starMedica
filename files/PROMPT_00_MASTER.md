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
| AutoMapper | No instalado | Evaluar versión corregida y compatibilidad solo si una feature requiere perfiles de mapeo |
| QuestPDF | **2024.12.0** | Community — gratis |
| MailKit | No instalado | No previsto; correo transaccional planificado con Resend |
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
| OpenStreetMap + Nominatim | Datos OSM libres; servicios públicos sujetos a políticas | Tiles sin SLA; Nominatim público máx. 1 solicitud/segundo y uso moderado | Mapa base y geocodificación interactiva, sin enviar datos personales/confidenciales |
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
Sprint activo: 0 — Infraestructura + Auth local verificados; despliegue, configuración protegida y smoke test Google end-to-end quedan para el final, según decisión del usuario.
Última feature implementada: Componentes shared `sm-button`, `sm-input`, `sm-modal`, `sm-table`, `sm-alert`, `sm-loader`, `sm-badge`, `sm-confirm-dialog`, `sm-sidebar`, `sm-breadcrumb`, `sm-empty-state` y `sm-growth-chart` integrados en las pantallas correspondientes; navegación principal, cuenta y cierre de sesión integrados en el shell real mediante `sm-sidebar`; breadcrumb actual vinculado a las rutas; tabla/alertas/loader/badge/empty state en pacientes; gráficos diferidos de peso/talla y modal clínico compartido en expediente; modal compartido y confirmación de cancelación mediante `sm-confirm-dialog` en citas; pantalla PNI integrada con componentes shared y flujos de alta/registro real; inventario farmacéutico integrado con alertas, loader, modal, empty state y formularios de recepción/despacho. `sm-input` soporta `datetime-local`. Los gráficos muestran solo medidas observadas, sin percentiles ni valoración clínica. `sm-map` está creado con Leaflet, dependencia ya instalada; la opción prevista desde el diseño es usar datos/tile layer de OpenStreetMap y Nominatim público para geocodificación bajo sus políticas, pero el mapa no está conectado a pantallas ni a coordenadas de pacientes. Antes de usar geocodificación con domicilios de pacientes se requiere una alternativa compatible con privacidad; no enviar información personal/confidencial a Nominatim público. `sm-card` queda sin integración hasta que exista un caso real. No se fabrican flujos para marcar componentes como usados. Los errores conservan mensajes y anuncios accesibles. Catálogo de 22 departamentos verificado. Borradores de facturación sin emisión fiscal.
Última mejora transversal: `sm-input` valida rangos y pasos decimales, preserva la conversión numérica, permite `step="any"` y rechaza valores no numéricos/no finitos; los campos clínicos y borradores conservan sus límites. Pruebas focalizadas 5/5 y build Development aprobados.
Mejora Auth local: `ensureSession()` intenta renovar usando la cookie HttpOnly aun cuando la pestaña nueva no tenga `sm_access_token` en sessionStorage; un refresh rechazado limpia la sesión. Pruebas focalizadas 2/2 y build Development aprobados. No se realizó despliegue.
Mejora Auth local adicional: solicitudes simultáneas de `refreshSession()` comparten una única llamada HTTP mediante RxJS `shareReplay`, evitando rotación concurrente de la cookie. Pruebas Auth 3/3 y build Development aprobados; no se realizó despliegue.
Prueba de integración local del interceptor Auth: dos peticiones protegidas con 401 reutilizan una llamada refresh y se reintentan con el token renovado; un 401 tardío usa un token renovado por otra llamada sin rotar de nuevo. Un 401 del propio endpoint Auth no entra en ciclo. Si falla la llamada reintentada con 403, conserva la sesión renovada; solo expira sesión cuando falla refresh. Suite Angular total: 61/61; build Development aprobado.
Mejora de navegación Auth: al abrir la ruta de login se comprueba la cookie HttpOnly; una sesión válida redirige al destino post-login y una sesión inválida permanece en login sin navegación recursiva. Suite Angular total: 64/64 y build Development aprobados.
Destino post-login según rol: SuperAdmin/Médico/Recepcionista a pacientes; Farmacéutico a farmacia; sin rol reconocido a aprobación pendiente. Las rutas de destino son las existentes y no se amplían permisos. Prueba específica Farmacéutico; suite Angular 65/65 y build Development aprobados.
Logout: los errores de revocación remota ya no se silencian: se limpia la sesión local, y el shell muestra un aviso accesible de que no se pudo confirmar la revocación. Logout exitoso no muestra error. Suite Angular total: 67/67; build Development aprobado.
Navegación lateral por roles: los módulos visibles usan las mismas constantes de acceso que las rutas; perfil Farmacéutico solo ve Farmacia, perfil de recepción no ve módulos clínicos/restringidos, y cuentas sin rol no muestran la navegación protegida. Marca y breadcrumb usan destinos accesibles. Suite Angular 72/72 y build Development aprobados.
Pérdida de sesión en shell: cobertura de integración confirma que al fallar logout y limpiar estado desaparecen sidebar/breadcrumb y queda anunciado el aviso de revocación no confirmada. Suite Angular 73/73; build Development aprobado.
Dependencias .NET no usadas (05/11/2026): se retiraron AutoMapper y MailKit porque no tenían referencias en el código. MailKit incorporaba MimeKit y `System.Security.Cryptography.Pkcs`; el audit de `dotnet list package --vulnerable --include-transitive` ahora no reporta vulnerabilidades en la solución. Restore aprobado, backend 45/45 y Release 0 advertencias/0 errores. No se cambió funcionalidad ni se realizó despliegue.
Expediente clínico (05/11/2026): los gráficos de peso/talla usan `@defer (on viewport)` con placeholders accesibles; respuestas tardías de historial/citas/errores y guardados de un paciente no seleccionado no alteran el expediente activo. Al cambiar paciente se cierra y limpia el formulario; cada reapertura también inicia vacía y elimina errores previos; el selector se bloquea durante el guardado. El formulario usa el `sm-modal` compartido con diálogo nativo. Suite Angular completa 79/79 y build Development aprobados. Sin llamadas externas ni despliegue.
Revisión de componentes shared (05/11/2026): confirmada integración de button/input/modal/table/alert/loader/badge/sidebar/breadcrumb/empty-state/growth-chart en shell y módulos; `sm-confirm-dialog` ahora protege la cancelación de citas con confirmación explícita. `sm-map` se reserva hasta definir fuente de coordenadas y proveedor; `sm-card` no se fuerza sin caso real. Prueba de cita confirma que cancelar no llama al API antes de aceptar. Suite Angular 80/80 y build Development aprobados; sin tráfico externo ni despliegue.
Corrección de decisión cartográfica (05/11/2026): el plan ya había elegido datos OpenStreetMap + Nominatim y Leaflet ya está instalada para `sm-map`; retiro la nota anterior que decía que faltaba elegir proveedor. OSM es dato abierto sujeto a atribución/ODbL, pero sus tile servers públicos son best-effort, sin SLA y sujetos a política de caché/uso; Nominatim público limita a 1 solicitud/segundo, prohíbe autocompletar y no debe recibir datos personales o confidenciales. La integración con domicilios de pacientes sigue pendiente de resolver privacidad y origen autorizado de coordenadas; no se envió ninguna petición. Referencias: https://operations.osmfoundation.org/policies/tiles/ y https://operations.osmfoundation.org/policies/nominatim/ .
Ambiente actual de pruebas: [x] Development  [ ] Staging  [ ] Production
Checkpoint verificado (04/11/2026): API local conectada a StarMedicaDB; el catálogo local de 22 departamentos y la migración `20261103041211_20261102_CreateDepartmentsCatalog` constan como verificados en evidencia previa. En esta revisión, `dotnet build StarMedica.sln --configuration Release --nologo` finalizó con 0 errores y 4 advertencias, la suite backend finalizó con 45 aprobadas y 0 fallidas, y los builds Angular Development, Staging y Production compilaron correctamente. Se añadieron nueve pruebas de handlers de Auth en [AuthCommandHandlerTests.cs](../StarMedica/tests/StarMedica.Application.Tests/AuthCommandHandlerTests.cs); cubren correo no verificado, alta/bootstrap, usuario inactivo, vinculación/conflicto de cuentas Google y expiración/rotación/revocación de refresh, sin invocar Google en vivo. `GET http://localhost:5000/Health` respondió HTTP 200 con `status=ok` y `database=connected` (comprobación local puntual; API detenida al terminar). El usuario confirmó que Sprint 0 incluye autenticación funcional y Sprint 1 empieza después. El usuario configuró el mismo Client ID de Google para Development, Staging y Production; se verificó presencia e igualdad sin registrar el valor, y los builds de Staging/Production pasaron. Las APIs públicas configuradas respondieron HTTP 200, pero `/Health` devolvió únicamente `text/plain: OK`, no el JSON de `HealthController`; no se considera prueba de conexión a BD o Auth. Siguen pendientes la allowlist de orígenes en Google Cloud, la configuración protegida del API, el smoke test Auth end-to-end desplegado y despliegue/aceptación formal. Se actualizó [SPRINT_0_ACEPTACION.md](./SPRINT_0_ACEPTACION.md); Sprint 0 continúa abierto, sin copiar secretos al repositorio. Reconciliación: [~] indica implementación parcial identificada, pendiente de criterios de aceptación y evidencia de cierre; [ ] indica bloqueado/no iniciado. Los sprints 0–7 siguen abiertos. Bloqueo Sprint 7: solicitar nombre y documentación técnica oficial del certificador FEL antes de diseñar/empezar la emisión. No solicitar ni incluir credenciales en este archivo. Bloqueo Sprint 8: no iniciar pantallas ni integrar APIs de citas, vacunas o expediente para pacientes/tutores hasta contar con discovery y matriz aprobada de autoridad, consentimiento y acceso pediátrico por responsables clínico y legal. No inferir reglas de edad o custodia. No se conservan demos con datos ficticios como funcionalidad.
Despliegue Sprint 0 (04/11/2026): se agregaron `railway.toml`, `StarMedica/Dockerfile` y `.dockerignore`, y `dotnet publish` Release genera la salida del API. No se pudo construir la imagen porque Docker no está instalado. Las URLs configuradas de Railway devuelven la página de bienvenida de Railway en `/`, 404 en Swagger y en `/api/auth/refresh`, y `text/plain: OK` en `/Health`; por tanto, no hay evidencia de que los dominios estén vinculados al API Star Médica. Consultar [SPRINT_0_ACEPTACION.md](./SPRINT_0_ACEPTACION.md); se requiere conectar/desplegar el servicio y comprobar el health check real antes del smoke test de Auth.

Aviso NuGet resuelto localmente (05/11/2026): AutoMapper y MailKit no estaban en uso y se retiraron sus referencias directas; la auditoría actual no reporta paquetes vulnerables. Consultar el registro de dependencias de esta sesión para la validación y resultados.

Validación local adicional (04/11/2026): EF reporta las 9 migraciones aplicadas y ningún cambio pendiente del modelo; SQL de solo lectura confirmó 22 departamentos activos con 22 nombres distintos. La API local responde HTTP 200 con base de datos conectada; Swagger incluye Auth, refresh sin cookie devuelve 401 y logout sin cookie devuelve 204. No se probó login real de Google. El usuario pidió dejar el despliegue para el final; no iniciar despliegues externos hasta nuevo aviso.

Validación de formularios (04/11/2026): el componente `sm-input` recupera `min`, `max` y `step`, emite valores numéricos y valida precisión decimal; se verificaron valores vacíos, `step="any"` y rechazo de `NaN`/valores no numéricos. Pruebas focalizadas: 5/5 aprobadas; `npm run build:dev`: correcto. `git diff --check`: correcto. El despliegue continúa aplazado por decisión del usuario.

Continuidad de Auth (05/11/2026): `AuthService.ensureSession()` ya no depende de la presencia de access token en `sessionStorage` antes de intentar `/auth/refresh`, permitiendo restaurar una cookie HttpOnly válida al abrir/reabrir la aplicación. Se agregaron pruebas para restauración válida y refresh 401 con limpieza de estado: 2/2 aprobadas; `npm run build:dev`: correcto. No se probó proveedor Google real ni se hizo despliegue.

Concurrencia de Auth (05/11/2026): `AuthService.refreshSession()` comparte una petición en curso entre llamadas concurrentes para evitar múltiples rotaciones del refresh token. Pruebas focalizadas de Auth: 3/3 aprobadas; `npm run build:dev`: correcto; `git diff --check`: correcto. Solo pruebas locales; sin llamadas a Google/API desplegada y sin despliegue.

Interceptor Auth (05/11/2026): se agregaron pruebas locales para respuestas 401 concurrentes, refresh compartido, reintento con access token nuevo y exclusión de endpoints Auth para evitar ciclos. Suite Angular completa: 58/58 aprobadas; `npm run build:dev`: correcto; `git diff --check`: correcto. Sin llamadas externas ni despliegue.

Manejo de errores del interceptor (05/11/2026): el cierre de sesión ahora se limita a fallos del refresh; un 403/otro error de la solicitud reintentada se propaga sin borrar el access token recién emitido. Pruebas locales adicionales para ambas rutas; suite Angular completa 61/61 y build Development aprobados. Sin llamadas externas ni despliegue.

Carrera de 401 tardíos (05/11/2026): antes de solicitar refresh, el interceptor compara el token que falló con el token vigente. Si otra petición ya renovó sesión, reintenta con el token vigente sin iniciar segunda rotación. Prueba local dedicada; suite Angular 61/61, build Development y `git diff --check` aprobados. Sin llamadas externas ni despliegue.

Restauración en login (05/11/2026): se integró `guestGuard` a `/auth/login`, reutilizando refresh de cookie para redirigir usuarios autenticados a pacientes o aprobación pendiente. Una sesión inválida deja la ruta de login accesible; `ensureSession()` no inicia navegación secundaria al fallar, evitando carreras. Pruebas de rutas 3/3; suite Angular 64/64; build Development y `git diff --check` aprobados. Solo local, sin Google ni despliegue.

Destino por rol (05/11/2026): se ajustó el post-login para llevar Farmacéutico a `/pharmacy`, los roles existentes con acceso a pacientes a `/patients` y usuarios sin rol reconocido a aprobación pendiente. Se verificó la restauración del guard para el rol Farmacéutico. Suite Angular 65/65; build Development y `git diff --check` aprobados. Sin llamadas externas ni despliegue.

Logout y errores visibles (05/11/2026): se eliminaron suscripciones que descartaban silenciosamente errores. `AuthService` captura explícitamente el fallo de revocación, limpia la sesión local y expone un aviso accesible desde el shell; éxito limpia sin aviso. Pruebas locales para éxito y error; suite Angular 67/67, build Development y `git diff --check` aprobados. Sin llamadas externas ni despliegue.

Navegación por roles (05/11/2026): se centralizaron los roles existentes por ruta y se usan tanto en `app.routes.ts` como para filtrar el sidebar. Usuarios sin rol no ven navegación protegida; el link de marca y el breadcrumb usan el primer módulo permitido. Pruebas de Médico, Recepcionista, Farmacéutico, SuperAdmin y sin rol; suite Angular 72/72 y build Development aprobados. Solo local; sin llamadas externas ni despliegue.

Shell ante pérdida de sesión (05/11/2026): se agregó prueba de integración que provoca fallo de logout, verifica que se oculta la navegación protegida y confirma el anuncio accesible de revocación no confirmada. Suite Angular 73/73; build Development y `git diff --check` aprobados. Sin llamadas externas ni despliegue.

Sprints:
  [~] Sprint 0  — Infraestructura + Scaffolding (solución, API, frontend y BD local; catálogo de 22 departamentos aplicado; despliegue externo y aceptación integral no evidenciados)
  [~] Sprint 1  — Auth + Design System (GIS/JWT/guards implementados; componentes shared listados abajo implementados; sm-table, sm-alert, sm-loader, sm-badge y sm-empty-state integrados en pacientes; sm-sidebar y sm-breadcrumb integrados en el shell; sm-growth-chart integrado al historial real de consultas y diferido por viewport; Leaflet instalada y OSM + Nominatim público ya preseleccionados en este plan; falta definir origen de coordenadas, privacidad/volumen y completar integración)
  [~] Sprint 2  — Pacientes + Geo (entidad/API/UI de pacientes existen; geografía/catálogos geográficos no identificados)
  [~] Sprint 3  — Citas + WhatsApp (agenda y API de citas existen; WhatsApp no integrado)
  [~] Sprint 4  — Expediente clínico (consultas inmutables y API existen; cierre integral del expediente no acreditado)
  [~] Sprint 5  — Vacunación PNI (modelo, migración y superficies de vacunación existen; aceptación integral del sprint no acreditada)
  [~] Sprint 6  — Farmacia + Recordatorios (inventario/farmacia existen; recordatorios no identificados)
  [~] Sprint 7  — Facturación FEL SAT (borradores internos existen; emisión FEL bloqueada por falta de certificador/documentación)
  [ ] Sprint 8  — Portal Paciente/Tutor
  [ ] Sprint 9  — MCP + IA Asistente
  [ ] Sprint 10 — Reportes + Pulido final

Orden de continuación: cerrar la reconciliación de criterios/evidencias empezando por Sprint 0 y avanzar en orden. No saltar a un sprint posterior porque sus pantallas o entidades ya existan. Las integraciones externas faltantes quedan como dependencias, sin reemplazarlas por demos.

Migraciones EF aplicadas:
  [x] 20261029035503_InitialCreate
  [x] 20261029040957_20261028_AuthRefreshIndexes
  [x] 20261029041751_20261028_SeedAccessRoles
  [x] 20261030000443_20261029_CreateAppointments
  [x] 20261030005138_20261029_CreateConsultations
  [x] 20261030013601_20261029_CreateVaccinationRecords
  [x] 20261102024929_20261101_CreatePharmacyInventory
  [x] 20261102034609_20261101_CreateBillingDrafts
  [x] 20261103041211_20261102_CreateDepartmentsCatalog

Componentes shared completados:
  [x] sm-input · [x] sm-button · [x] sm-modal · [x] sm-table
  [x] sm-alert · [x] sm-loader · [x] sm-badge · [x] sm-confirm-dialog
  [x] sm-card  · [x] sm-sidebar · [x] sm-breadcrumb · [x] sm-empty-state
  [x] sm-map   · [x] sm-growth-chart

APIs integradas:
  [ ] Google Identity Services (GIS) · [ ] WhatsApp Business · [ ] Cloudinary
  [ ] Firebase FCM · [ ] Resend email · [~] OpenStreetMap + Nominatim (selección del plan; servicios aún no conectados)
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
