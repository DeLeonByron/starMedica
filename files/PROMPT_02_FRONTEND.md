# 🎨 PROMPT-02 FRONTEND — ERP Star Médica
## Angular 19.2 · Signals · Nueva Sintaxis @if/@for · Tailwind v4 · SCSS BEM
## ⚠️ USAR JUNTO AL MASTER PROMPT v6.0 — No reemplaza, complementa.

---

## 🧠 INSTRUCCIONES FRONTEND

```
REGLAS ESPECÍFICAS FRONTEND:
  1.  SIEMPRE nueva sintaxis: @if @for @switch — PROHIBIDO *ngIf *ngFor [ngSwitch]
  2.  SIEMPRE Signals para estado: signal(), computed(), effect()
  3.  SIEMPRE inject() para DI — NUNCA constructor injection
  4.  SIEMPRE 3 archivos por componente: .ts + .html + .scss
  5.  SIEMPRE generar con CLI antes de escribir código:
        ng generate component [ruta] --standalone --change-detection=OnPush --skip-tests
  6.  SIEMPRE ChangeDetectionStrategy.OnPush
  7.  SIEMPRE takeUntilDestroyed(this.destroyRef) — NUNCA ngOnDestroy manual
  8.  SIEMPRE input() y output() modernos — NUNCA @Input() @Output() decorators
  9.  NUNCA cualquier cosa en TypeScript — tipado estricto absoluto
  10. NUNCA estilos inline en templates HTML
  11. NUNCA colores hardcoded en SCSS — solo var(--sm-*)
  12. SIEMPRE BEM en SCSS: .sm-bloque__elemento--modificador
  13. SIEMPRE @use 'variables' as * y @use 'mixins' as * al inicio de cada .scss
  14. DESPUÉS de cada componente/feature: ng build --configuration=development

CHECKPOINT OBLIGATORIO FRONTEND:
  ┌──────────────────────────────────────────────────────────────┐
  │ ✅ CHECKPOINT FRONTEND                                       │
  │ cd star-medica && ng build --configuration=development       │
  │ Esperado: ✔ Browser application bundle generation complete.  │
  │ Si hay error de tipo: revisar interfaces y tipos importados  │
  │ Si hay error de template: revisar sintaxis @if/@for          │
  └──────────────────────────────────────────────────────────────┘
```

---

## ⚡ NUEVA SINTAXIS ANGULAR 19 — REFERENCIA RÁPIDA

```html
<!-- ✅ CORRECTO — @if / @else if / @else -->
@if (isLoading()) {
  <sm-loader message="Cargando..." />
} @else if (hasError()) {
  <div class="error-state" role="alert">{{ errorMessage() }}</div>
} @else {
  <div class="content">Contenido</div>
}

<!-- ✅ CORRECTO — @for con track -->
@for (patient of patients(); track patient.id) {
  <tr class="table__row">
    <td>{{ patient.code }}</td>
    <td>{{ patient.fullName }}</td>
  </tr>
} @empty {
  <tr><td colspan="6">No hay pacientes registrados.</td></tr>
}

<!-- ✅ CORRECTO — @switch -->
@switch (patient.status) {
  @case ('Activo')    { <sm-badge variant="success" label="Activo" /> }
  @case ('Inactivo')  { <sm-badge variant="warning" label="Inactivo" /> }
  @case ('Fallecido') { <sm-badge variant="neutral" label="Fallecido" /> }
  @default            { <sm-badge variant="neutral" label="Desconocido" /> }
}

<!-- ✅ CORRECTO — @defer (lazy loading de componentes pesados) -->
@defer (on viewport) {
  <sm-growth-chart [patientId]="patientId()" />
} @placeholder {
  <div class="chart-skeleton"></div>
} @loading (minimum 200ms) {
  <sm-loader />
}
```

---

## 🏗️ SCAFFOLDING — COMANDOS CLI OBLIGATORIOS

```bash
# ══════════════════════════════════════════════════════════════
# SETUP INICIAL (una sola vez)
# ══════════════════════════════════════════════════════════════
npm install -g @angular/cli@19.2
ng new star-medica --routing --style=scss --standalone \
  --inline-template=false --inline-style=false --skip-tests
cd star-medica

# Verificar estructura correcta
# ✅ CHECKPOINT: ng version → debe mostrar Angular CLI: 19.2.x

# ══════════════════════════════════════════════════════════════
# INSTALAR DEPENDENCIAS (en orden)
# ══════════════════════════════════════════════════════════════
npm install tailwindcss@4.0.17 @tailwindcss/vite@4.0.17
npm install @angular/cdk@19.2
npm install lucide-angular@0.474.0
npm install @phosphor-icons/webcomponents@2.1.1
npm install @fullcalendar/angular@6.1.15 @fullcalendar/core@6.1.15 \
  @fullcalendar/daygrid@6.1.15 @fullcalendar/timegrid@6.1.15 \
  @fullcalendar/interaction@6.1.15
npm install chart.js@4.4.7 ng2-charts@7.0.0
npm install leaflet@1.9.4 @asymmetrik/ngx-leaflet@17.0.0
npm install --save-dev @types/leaflet@1.9.14
npm install @angular/fire@19.0.0 firebase@11.2.0  # Solo FCM — NO para auth
# ⚠️ NO instalar @abacritt/angularx-social-login — reemplazado por Google Identity Services (GIS)
# GIS se carga como script CDN en index.html — sin dependencia npm, bundle ~130KB más liviano
npm install @microsoft/signalr@8.0.7
npm install date-fns@4.1.0
npm install jspdf@2.5.2 jspdf-autotable@3.8.4 xlsx@0.18.5
npm install ngx-mask@19.0.0 ngx-dropzone@3.1.0

# ✅ CHECKPOINT: npm install sin errores de peer deps

# ══════════════════════════════════════════════════════════════
# GENERAR ARTEFACTOS (usar siempre antes de escribir código)
# ══════════════════════════════════════════════════════════════

# Componente de feature
ng generate component features/patients/patients-list \
  --standalone --change-detection=OnPush --skip-tests

# Componente shared
ng generate component shared/components/sm-input \
  --standalone --change-detection=OnPush --skip-tests

# Servicio
ng generate service features/patients/services/patients --skip-tests
ng generate service core/services/auth --skip-tests
ng generate service core/services/toast --skip-tests
ng generate service core/services/signalr --skip-tests

# Guard funcional (Angular 15+ style)
ng generate guard core/guards/auth --functional --skip-tests
ng generate guard core/guards/role --functional --skip-tests

# Interceptor funcional
ng generate interceptor core/interceptors/auth --functional --skip-tests
ng generate interceptor core/interceptors/error --functional --skip-tests

# Pipe
ng generate pipe shared/pipes/gtq-currency --standalone --skip-tests
ng generate pipe shared/pipes/gt-date --standalone --skip-tests
```

---

## ⚙️ CONFIGURACIÓN DE ARCHIVOS BASE

### `vite.config.ts` — Tailwind v4:
```typescript
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()]
});
```

### `src/styles.scss` — Entrada global:
```scss
// Tailwind v4 — nueva sintaxis (NO @tailwind base/components/utilities)
@import "tailwindcss";

@use 'variables' as *;
@use 'reset';
@use 'typography';
@use 'animations';
@use 'utilities';
@use 'dark-mode';
@use 'leaflet-overrides';

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### `src/app/app.config.ts` — Configuración global:
```typescript
import {
  ApplicationConfig, provideZoneChangeDetection, LOCALE_ID
} from '@angular/core';
import {
  provideRouter, withComponentInputBinding, withViewTransitions
} from '@angular/router';
import {
  provideHttpClient, withInterceptors, withFetch
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEsGT from '@angular/common/locales/es-GT';
import { provideIcons } from 'lucide-angular';
import { provideNgxMask } from 'ngx-mask';
// ⚠️ NO importar angularx-social-login — se usa Google Identity Services (GIS) vía CDN
// GIS se inicializa en AuthService con window.google.accounts.id
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Lucide — solo iconos usados (tree-shaking)
import {
  User, Users, Calendar, Stethoscope, Pill, Syringe,
  FileText, BarChart2, Bell, Settings, LogOut, Menu,
  Search, Plus, Edit, Trash2, Eye, EyeOff, Check,
  X, AlertCircle, Info, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
  ArrowLeft, ArrowRight, Download, Upload, Printer,
  MapPin, Phone, Mail, Lock, Unlock, Shield,
  Heart, Activity, Thermometer, Weight, Ruler,
  Baby, ClipboardList, Package, DollarSign, Receipt,
  PieChart, TrendingUp, LayoutDashboard,
  MessageSquare, Send, Paperclip, Image, File, Bot,
  Microscope, FlaskConical, Building2, Clock
} from 'lucide-angular';

registerLocaleData(localeEsGT);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-GT' },
    provideNgxMask(),   // ngx-mask v19
    provideIcons({
      User, Users, Calendar, Stethoscope, Pill, Syringe,
      FileText, BarChart2, Bell, Settings, LogOut, Menu,
      Search, Plus, Edit, Trash2, Eye, EyeOff, Check,
      X, AlertCircle, Info, AlertTriangle, CheckCircle2,
      ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
      ArrowLeft, ArrowRight, Download, Upload, Printer,
      MapPin, Phone, Mail, Lock, Unlock, Shield,
      Heart, Activity, Thermometer, Weight, Ruler,
      Baby, ClipboardList, Package, DollarSign, Receipt,
      PieChart, TrendingUp, LayoutDashboard,
      MessageSquare, Send, Paperclip, Image, File, Bot,
      Microscope, FlaskConical, Building2, Clock
    })
  ]
};
```

---

## 📐 PLANTILLA COMPONENTE — 3 ARCHIVOS

### `.component.ts` — Con nueva sintaxis Angular 19:
```typescript
// [NG-COMP] features/[modulo]/[nombre]/[nombre].component.ts
// CLI: ng generate component features/[modulo]/[nombre] --standalone --change-detection=OnPush --skip-tests
import {
  Component, OnInit, inject, signal, computed,
  ChangeDetectionStrategy, DestroyRef, input, output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { LucideAngularModule, Search, Plus, Edit, Trash2 } from 'lucide-angular';
// Imports de shared, services y models según módulo

@Component({
  selector: 'sm-[nombre]',            // SIEMPRE prefijo sm-
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule
    // + componentes shared usados
  ],
  templateUrl: './[nombre].component.html',
  styleUrl:    './[nombre].component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush  // SIEMPRE
})
export class [Nombre]Component implements OnInit {
  // ── DI con inject() — NO constructor ────────────────────────
  private readonly service   = inject([Nombre]Service);
  private readonly destroyRef = inject(DestroyRef);       // Para takeUntilDestroyed

  // ── Iconos Lucide (readonly para template) ───────────────────
  protected readonly Search = Search;
  protected readonly Plus   = Plus;
  protected readonly Edit   = Edit;
  protected readonly Trash2 = Trash2;

  // ── Inputs/Outputs modernos ──────────────────────────────────
  // parentId = input<number>();                          // Signal input
  // itemSelected = output<Item>();                       // Signal output

  // ── Estado con Signals ───────────────────────────────────────
  protected items         = signal<Item[]>([]);
  protected totalCount    = signal(0);
  protected currentPage   = signal(1);
  protected isLoading     = signal(false);
  protected errorMessage  = signal('');
  protected showConfirm   = signal(false);
  protected itemToDelete  = signal<Item | null>(null);

  // ── Computed (derivados del estado) ──────────────────────────
  protected hasItems    = computed(() => this.items().length > 0);
  protected totalPages  = computed(() =>
    Math.ceil(this.totalCount() / this.pageSize));

  protected readonly pageSize = 20;
  protected searchControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.loadItems();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)  // NO ngOnDestroy manual
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadItems();
    });
  }

  protected loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.service.getAll({ search: this.searchControl.value, page: this.currentPage() }).pipe(
      catchError(() => {
        this.errorMessage.set('Error al cargar. Intente de nuevo.');
        return of({ items: [], totalCount: 0 });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.items.set(result.items);
      this.totalCount.set(result.totalCount);
      this.isLoading.set(false);
    });
  }

  protected confirmDelete(item: Item): void {
    this.itemToDelete.set(item);
    this.showConfirm.set(true);
  }

  protected onConfirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.service.delete(item.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => { this.loadItems(); this.showConfirm.set(false); },
      error: () => this.errorMessage.set('Error al eliminar.')
    });
  }
}
```

### `.component.html` — Nueva sintaxis @if @for:
```html
<!-- [NG-COMP] [nombre].component.html -->
<!-- ✅ @if/@for — NUNCA *ngIf/*ngFor -->
<section class="[nombre]" aria-label="[Descripción accesible]">

  <header class="[nombre]__header">
    <div class="[nombre]__title-group">
      <lucide-icon [img]="[Icono]" [size]="24" aria-hidden="true" />
      <h1 class="[nombre]__title">[Título en español]</h1>
      @if (!isLoading()) {
        <span class="[nombre]__count" aria-live="polite">
          {{ totalCount() }} registros
        </span>
      }
    </div>
    <a routerLink="new" class="[nombre]__btn-new" aria-label="Crear nuevo registro">
      <lucide-icon [img]="Plus" [size]="18" aria-hidden="true" />
      Nuevo
    </a>
  </header>

  <!-- Búsqueda -->
  <div class="[nombre]__toolbar">
    <div class="[nombre]__search-wrapper" role="search">
      <lucide-icon [img]="Search" [size]="16" class="[nombre]__search-icon" aria-hidden="true" />
      <input type="search" class="[nombre]__search"
             [formControl]="searchControl"
             placeholder="Buscar..." aria-label="Buscar registros" />
    </div>
  </div>

  <!-- Error -->
  @if (errorMessage()) {
    <div class="[nombre]__error" role="alert">{{ errorMessage() }}</div>
  }

  <!-- Loading -->
  @if (isLoading()) {
    <sm-loader message="Cargando..." />
  }

  <!-- Tabla -->
  @if (!isLoading() && hasItems()) {
    <div class="[nombre]__table-wrapper" role="region">
      <table class="[nombre]__table">
        <thead>
          <tr>
            <th scope="col">Columna 1</th>
            <th scope="col" class="[nombre]__actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr class="[nombre]__row">
              <td>{{ item.name }}</td>
              <td class="[nombre]__actions">
                <a [routerLink]="[item.id]" class="[nombre]__action-btn"
                   [attr.aria-label]="'Ver ' + item.name">
                  <lucide-icon [img]="Eye" [size]="16" />
                </a>
                <button type="button" class="[nombre]__action-btn [nombre]__action-btn--danger"
                        (click)="confirmDelete(item)"
                        [attr.aria-label]="'Eliminar ' + item.name">
                  <lucide-icon [img]="Trash2" [size]="16" />
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }

  <!-- Empty state -->
  @if (!isLoading() && !hasItems() && !errorMessage()) {
    <sm-empty-state icon="[icono]" title="Sin registros"
                    description="Comience creando el primer registro." />
  }

  <!-- Confirm dialog -->
  @if (showConfirm() && itemToDelete()) {
    <sm-confirm-dialog
      title="Eliminar registro"
      [message]="'¿Eliminar ' + itemToDelete()!.name + '?'"
      confirmLabel="Eliminar" variant="danger"
      (confirm)="onConfirmDelete()"
      (cancel)="showConfirm.set(false)" />
  }

</section>
```

### `.component.scss` — BEM + variables:
```scss
// [NG-COMP] [nombre].component.scss
// BEM: .[nombre] (bloque) __elemento --modificador
@use 'variables' as *;   // Disponible por includePaths en angular.json
@use 'mixins' as *;

.[nombre] {
  @include flex-col;
  gap: 1.5rem;
  padding: 1.5rem;

  @include breakpoint(lg) { padding: 2rem; }

  &__header {
    @include flex-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--sm-primary);
  }

  &__title {
    font-size: var(--sm-font-size-2xl);
    font-weight: 700;
    color: var(--sm-text-primary);
    margin: 0;
  }

  &__count {
    font-size: var(--sm-font-size-sm);
    color: var(--sm-text-muted);
    background: var(--sm-bg-tertiary);
    padding: 0.25rem 0.625rem;
    border-radius: var(--sm-radius-full);
  }

  &__btn-new {
    @include button-base;
    background: var(--sm-primary);
    color: var(--sm-text-inverse);
    padding: 0.625rem 1.25rem;
    font-size: var(--sm-font-size-sm);
    text-decoration: none;
    &:hover  { background: var(--sm-primary-hover); }
    &:active { background: var(--sm-primary-active); }
  }

  &__toolbar {
    @include flex-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
  }

  &__search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--sm-text-muted);
    pointer-events: none;
  }

  &__search {
    width: 100%;
    height: 2.5rem;
    padding: 0 0.875rem 0 2.5rem;
    font-size: var(--sm-font-size-sm);
    color: var(--sm-text-primary);
    background: var(--sm-bg-primary);
    border: 1px solid var(--sm-border);
    border-radius: var(--sm-radius);
    outline: none;
    transition: border-color var(--sm-transition), box-shadow var(--sm-transition);
    &::placeholder { color: var(--sm-text-muted); }
    &:focus {
      border-color: var(--sm-primary);
      box-shadow: 0 0 0 3px var(--sm-primary-light);
    }
  }

  &__error {
    padding: 0.875rem 1rem;
    background: var(--sm-danger-bg);
    color: var(--sm-danger);
    border: 1px solid var(--sm-danger);
    border-radius: var(--sm-radius);
    font-size: var(--sm-font-size-sm);
  }

  &__table-wrapper {
    @include card(0);
    overflow: hidden;
    overflow-x: auto;
    @include custom-scrollbar;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--sm-font-size-sm);

    thead tr {
      background: var(--sm-bg-secondary);
      border-bottom: 1px solid var(--sm-border);
    }
    th {
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: var(--sm-text-secondary);
      text-align: left;
      white-space: nowrap;
    }
  }

  &__row {
    border-bottom: 1px solid var(--sm-border);
    transition: background var(--sm-transition);
    &:hover { background: var(--sm-bg-secondary); }
    &:last-child { border-bottom: none; }
    td { padding: 0.75rem 1rem; color: var(--sm-text-primary); vertical-align: middle; }
  }

  &__actions-col { width: 120px; }
  &__actions { display: flex; align-items: center; gap: 0.375rem; }

  &__action-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem; border: none; background: transparent;
    border-radius: var(--sm-radius-sm); color: var(--sm-text-muted);
    cursor: pointer; transition: all var(--sm-transition); text-decoration: none;
    &:hover { background: var(--sm-bg-tertiary); color: var(--sm-text-primary); }
    @include focus-visible;
    &--danger:hover { background: var(--sm-danger-bg); color: var(--sm-danger); }
  }
}
```

---

## 🔐 AUTH — GOOGLE IDENTITY SERVICES (GIS) EN ANGULAR

> **Sin npm, sin Firebase Auth, sin angularx-social-login.**
> GIS se carga desde CDN de Google (cacheado globalmente, ~50KB).
> El flujo: GIS da un ID token → tu API lo valida → tu API emite JWT propio.

### `src/index.html` — Cargar script GIS:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Star Médica</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <!-- Google Identity Services — carga asíncrona, no bloquea render -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <sm-root></sm-root>
</body>
</html>
```

### `src/app/core/models/google-identity.model.ts` — Tipos GIS:

```typescript
// Declaración de tipos para window.google (GIS)
// No hay @types/google-gsi oficial — se declara manualmente
declare global {
  interface Window {
    google: GoogleAccounts;
    handleGoogleCredential: (response: GisCredentialResponse) => void;
  }
}

export interface GoogleAccounts {
  accounts: {
    id: {
      initialize: (config: GisInitConfig) => void;
      renderButton: (element: HTMLElement, options: GisButtonOptions) => void;
      prompt: () => void;
      disableAutoSelect: () => void;
      revoke: (email: string, callback: () => void) => void;
    };
  };
}

export interface GisCredentialResponse {
  credential: string;          // ID token JWT de Google
  select_by: string;
  clientId: string;
}

export interface GisInitConfig {
  client_id: string;
  callback: (response: GisCredentialResponse) => void;
  auto_select?: boolean;       // One Tap automático
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  ux_mode?: 'popup' | 'redirect';
}

export interface GisButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  locale?: string;
  width?: number;
}

export interface AuthUser {
  id:       number;
  fullName: string;
  email:    string;
  photoUrl: string | null;
  roles:    string[];
}

export interface AuthState {
  user:        AuthUser | null;
  accessToken: string | null;
  isLoading:   boolean;
  error:       string | null;
}
```

### `src/app/core/services/auth.service.ts` — AuthService con GIS:

```typescript
// [NG-SVC] core/services/auth.service.ts
// CLI: ng generate service core/services/auth --skip-tests
import {
  Injectable, inject, signal, computed, effect, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GisCredentialResponse, GisInitConfig, AuthUser, AuthState
} from '../models/google-identity.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http       = inject(HttpClient);
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // ── Estado reactivo con Signals ──────────────────────────────
  private readonly _state = signal<AuthState>({
    user: null, accessToken: null, isLoading: false, error: null
  });

  // Acceso público de solo lectura
  readonly user         = computed(() => this._state().user);
  readonly accessToken  = computed(() => this._state().accessToken);
  readonly isLoading    = computed(() => this._state().isLoading);
  readonly error        = computed(() => this._state().error);
  readonly isLoggedIn   = computed(() => !!this._state().user);
  readonly roles        = computed(() => this._state().user?.roles ?? []);

  constructor() {
    // Intentar restaurar sesión desde sessionStorage al iniciar
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
      this.initGis();
    }
  }

  // ── Inicializar Google Identity Services ─────────────────────
  private initGis(): void {
    // Esperar a que el script GIS cargue
    const waitForGis = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(waitForGis);
        window.google.accounts.id.initialize({
          client_id:           environment.googleClientId,
          callback:            (response) => this.handleGisCallback(response),
          auto_select:         false,
          cancel_on_tap_outside: true,
          context:             'signin'
        } as GisInitConfig);
      }
    }, 100);

    // Timeout de seguridad: si GIS no carga en 10s, no bloquear la app
    setTimeout(() => clearInterval(waitForGis), 10_000);
  }

  // ── Renderizar botón de Google en un elemento ────────────────
  renderGoogleButton(element: HTMLElement): void {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.renderButton(element, {
      type:   'standard',
      theme:  'outline',
      size:   'large',
      text:   'signin_with',
      shape:  'rectangular',
      locale: 'es',
      width:  320
    });
  }

  // ── Mostrar One Tap ──────────────────────────────────────────
  promptOneTap(): void {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  }

  // ── Callback — GIS devuelve ID token de Google ───────────────
  private async handleGisCallback(response: GisCredentialResponse): Promise<void> {
    await this.loginWithGoogle(response.credential);
  }

  // ── Enviar ID token a la API de Star Médica ──────────────────
  async loginWithGoogle(idToken: string): Promise<void> {
    this._state.update(s => ({ ...s, isLoading: true, error: null }));

    try {
      const result = await firstValueFrom(
        this.http.post<{ accessToken: string; expiresAt: string; user: AuthUser }>(
          `${environment.apiUrl}/auth/google`,
          { idToken }
        )
      );

      // Guardar en sessionStorage (se limpia al cerrar pestaña)
      // El refresh token va en cookie httpOnly — lo maneja el browser automáticamente
      sessionStorage.setItem('sm_access_token', result.accessToken);

      this._state.set({
        user:        result.user,
        accessToken: result.accessToken,
        isLoading:   false,
        error:       null
      });

      // Redirigir según si tiene roles asignados
      if (result.user.roles.length === 0) {
        this.router.navigate(['/auth/pending-approval']);
      } else {
        this.router.navigate(['/dashboard']);
      }

    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message
                      ?? 'Error al iniciar sesión. Intente de nuevo.';
      this._state.update(s => ({ ...s, isLoading: false, error: message }));
    }
  }

  // ── Obtener token para el interceptor ────────────────────────
  getToken(): string | null {
    return this._state().accessToken ?? sessionStorage.getItem('sm_access_token');
  }

  // ── Restaurar sesión (refresh token via cookie httpOnly) ──────
  private async restoreSession(): Promise<void> {
    const stored = sessionStorage.getItem('sm_access_token');
    if (!stored) return;

    try {
      const result = await firstValueFrom(
        this.http.post<{ accessToken: string; expiresAt: string; user: AuthUser }>(
          `${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true }
        )
      );
      sessionStorage.setItem('sm_access_token', result.accessToken);
      this._state.set({
        user: result.user, accessToken: result.accessToken,
        isLoading: false, error: null
      });
    } catch {
      // Refresh expirado — limpiar sesión
      this.clearSession();
    }
  }

  // ── Logout ────────────────────────────────────────────────────
  async logout(): Promise<void> {
    const email = this._state().user?.email;

    // Revocar sesión de Google (no cierra la cuenta Google, solo la sesión en la app)
    if (email && window.google?.accounts?.id) {
      window.google.accounts.id.revoke(email, () => {
        window.google.accounts.id.disableAutoSelect();
      });
    }

    // Invalidar refresh token en el backend
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      );
    } catch { /* ignorar — limpiar sesión de todas formas */ }

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private clearSession(): void {
    sessionStorage.removeItem('sm_access_token');
    this._state.set({ user: null, accessToken: null, isLoading: false, error: null });
  }

  // ── Helpers de autorización ───────────────────────────────────
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(...checkRoles: string[]): boolean {
    return checkRoles.some(r => this.roles().includes(r));
  }
}
```

### `features/auth/login/login.component.ts` — Componente de login con GIS:

```typescript
// CLI: ng generate component features/auth/login --standalone --change-detection=OnPush --skip-tests
import {
  Component, OnInit, AfterViewInit, inject, signal,
  ElementRef, ViewChild, ChangeDetectionStrategy
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, AlertCircle } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'sm-login',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements AfterViewInit {
  private readonly auth = inject(AuthService);

  protected readonly AlertCircle = AlertCircle;
  protected isLoading = this.auth.isLoading;
  protected error     = this.auth.error;

  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    // Renderizar el botón oficial de Google en el div reservado
    this.auth.renderGoogleButton(this.googleBtnRef.nativeElement);
  }
}
```

```html
<!-- features/auth/login/login.component.html -->
<main class="login" aria-label="Iniciar sesión en Star Médica">
  <div class="login__card">

    <div class="login__brand">
      <!-- Logo Star Médica -->
      <img src="/assets/logo.svg" alt="Star Médica" class="login__logo" width="180" />
      <p class="login__tagline">Sistema de Gestión Clínica</p>
    </div>

    <div class="login__content">
      <h1 class="login__title">Bienvenido</h1>
      <p class="login__subtitle">Inicia sesión con tu cuenta institucional de Google</p>

      @if (error()) {
        <div class="login__error" role="alert">
          <lucide-icon [img]="AlertCircle" [size]="16" aria-hidden="true" />
          {{ error() }}
        </div>
      }

      @if (isLoading()) {
        <div class="login__loading" aria-live="polite">
          <div class="login__spinner" aria-label="Verificando credenciales..."></div>
          <span>Verificando...</span>
        </div>
      } @else {
        <!-- Aquí GIS renderiza el botón oficial de Google -->
        <div #googleBtn class="login__google-btn-wrapper" aria-label="Botón de Google"></div>
      }

      <p class="login__disclaimer">
        Solo cuentas autorizadas por el administrador de Star Médica pueden acceder.
      </p>
    </div>

  </div>
</main>
```

---

## 🔔 TOAST SERVICE + GUARDS — IMPLEMENTACIONES COMPLETAS

```typescript
// [NG-SVC] core/services/toast.service.ts
// CLI: ng generate service core/services/toast --skip-tests
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       number;
  type:     ToastType;
  message:  string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 4000): void { this.add('success', message, duration); }
  error  (message: string, duration = 6000): void { this.add('error',   message, duration); }
  warning(message: string, duration = 5000): void { this.add('warning', message, duration); }
  info   (message: string, duration = 4000): void { this.add('info',    message, duration); }

  private add(type: ToastType, message: string, duration: number): void {
    const id = ++this._counter;
    this.toasts.update(t => [...t, { id, type, message, duration }]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}

// ────────────────────────────────────────────────────────────────
// [NG-SVC] core/guards/auth.guard.ts
// CLI: ng generate guard core/guards/auth --functional --skip-tests
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/auth/login']);
  return false;
};

// [NG-SVC] core/guards/role.guard.ts
// CLI: ng generate guard core/guards/role --functional --skip-tests
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth    = inject(AuthService);
  const router  = inject(Router);
  const allowed = route.data['roles'] as string[] | undefined;

  if (!auth.isLoggedIn()) { router.navigate(['/auth/login']); return false; }
  if (!allowed || allowed.length === 0) return true;

  const hasRole = auth.hasAnyRole(...allowed);
  if (!hasRole) router.navigate(['/unauthorized']);
  return hasRole;
};

// Uso en rutas con roleGuard:
// {
//   path: 'billing',
//   canActivate: [authGuard, roleGuard],
//   data: { roles: ['SuperAdmin', 'Contador', 'Recepcionista'] },
//   loadChildren: () => import('./features/billing/billing.routes').then(m => m.BILLING_ROUTES)
// }
```

---

## 🔒 INTERCEPTORS — AUTH + ERROR

```typescript
// [NG-SVC] core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const token  = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) { auth.logout(); router.navigate(['/auth/login']); }
      return throwError(() => err);
    })
  );
};

// [NG-SVC] core/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError(err => {
      const msg = err.error?.message ?? err.error?.title ?? 'Error inesperado.';
      if (err.status !== 401) {  // 401 lo maneja authInterceptor
        switch (err.status) {
          case 400: toast.error(`Validación: ${msg}`); break;
          case 403: toast.error('Sin permisos para esta acción.'); break;
          case 404: toast.warning('Recurso no encontrado.'); break;
          case 500: toast.error('Error del servidor. Intente más tarde.'); break;
          default:  toast.error(msg);
        }
      }
      return throwError(() => err);
    })
  );
};
```

---

## 📡 SIGNALR SERVICE — NOTIFICACIONES REAL-TIME

```typescript
// [NG-SVC] core/services/signalr.service.ts
// CLI: ng generate service core/services/signalr --skip-tests
import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface AppNotification {
  type:      string;
  payload:   unknown;
  sentAt:    string;
}

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);

  private hub: signalR.HubConnection | null = null;

  readonly isConnected  = signal(false);
  readonly notifications = signal<AppNotification[]>([]);

  async connect(): Promise<void> {
    if (this.hub?.state === signalR.HubConnectionState.Connected) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/notifications`, {
        accessTokenFactory: () => this.auth.getToken() ?? ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(environment.enableDebugTools
        ? signalR.LogLevel.Information
        : signalR.LogLevel.Error)
      .build();

    this.hub.on('Notification', (notification: AppNotification) => {
      this.notifications.update(n => [notification, ...n].slice(0, 50)); // máx 50
      this.handleNotification(notification);
    });

    this.hub.onreconnected(() => this.isConnected.set(true));
    this.hub.onclose(()     => this.isConnected.set(false));

    try {
      await this.hub.start();
      this.isConnected.set(true);
    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  }

  async disconnect(): Promise<void> {
    await this.hub?.stop();
    this.isConnected.set(false);
  }

  private handleNotification(n: AppNotification): void {
    switch (n.type) {
      case 'Cita':       this.toast.info('Nueva cita programada');    break;
      case 'Vacuna':     this.toast.warning('Vacuna pendiente');       break;
      case 'Medicamento':this.toast.info('Recordatorio de medicamento'); break;
      case 'Sistema':    this.toast.info('Notificación del sistema'); break;
    }
  }
}
// Conectar en app.component.ts → ngOnInit si el usuario está logueado:
// effect(() => { if (this.auth.isLoggedIn()) this.signalr.connect(); });
```

---

## 🧩 PIPES PERSONALIZADOS GUATEMALA

```typescript
// [NG-SVC] shared/pipes/gtq-currency.pipe.ts
// CLI: ng generate pipe shared/pipes/gtq-currency --standalone --skip-tests
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'gtqCurrency', standalone: true })
export class GtqCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol = true): string {
    if (value == null) return showSymbol ? 'Q 0.00' : '0.00';
    const formatted = new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(value);
    return showSymbol ? `Q ${formatted}` : formatted;
  }
}
// Uso en template: {{ precio | gtqCurrency }}  → Q 1,250.00

// [NG-SVC] shared/pipes/gt-date.pipe.ts
// CLI: ng generate pipe shared/pipes/gt-date --standalone --skip-tests
import { Pipe, PipeTransform } from '@angular/core';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({ name: 'gtDate', standalone: true })
export class GtDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, fmt = 'dd/MM/yyyy'): string {
    if (!value) return '—';
    const date = typeof value === 'string' ? parseISO(value) : value;
    if (!isValid(date)) return '—';
    return format(date, fmt, { locale: es });
  }
}
// Uso: {{ paciente.birthDate | gtDate }}           → 15/01/1990
//      {{ cita.fecha | gtDate:'dd/MM/yyyy HH:mm' }} → 15/01/2025 14:30
```

---

## 🏠 APP COMPONENT — PUNTO DE ENTRADA

```typescript
// src/app/app.component.ts
import {
  Component, OnInit, inject, effect, ChangeDetectionStrategy
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService }    from './core/services/auth.service';
import { SignalrService } from './core/services/signalr.service';
import { ToastService }   from './core/services/toast.service';
import { SmToastContainerComponent } from './shared/components/sm-toast/sm-toast-container.component';

@Component({
  selector: 'sm-root',
  standalone: true,
  imports: [RouterOutlet, SmToastContainerComponent],
  template: `
    <router-outlet />
    <sm-toast-container />
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly auth     = inject(AuthService);
  private readonly signalr  = inject(SignalrService);

  constructor() {
    // Conectar/desconectar SignalR reactivamente según estado de auth
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.signalr.connect();
      } else {
        this.signalr.disconnect();
      }
    });
  }

  ngOnInit(): void { /* La restauración de sesión ocurre en AuthService constructor */ }
}
```

```html
<!-- src/app/app.component.html — Si se prefiere archivo separado -->
<router-outlet />
<sm-toast-container />
```

---

## 🛣️ RUTAS — LAZY LOADING

```typescript
// [NG-ROUTE] app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard }  from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // ── Auth (sin guard) ──────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ── Dashboard ────────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — Star Médica'
  },

  // ── Features con roles ────────────────────────────────────
  {
    path: 'patients',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Médico','Enfermera','Recepcionista'] },
    loadChildren: () =>
      import('./features/patients/patients.routes').then(m => m.PATIENTS_ROUTES)
  },
  {
    path: 'appointments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Médico','Enfermera','Recepcionista'] },
    loadChildren: () =>
      import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES)
  },
  {
    path: 'consultations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Médico'] },
    loadChildren: () =>
      import('./features/consultations/consultations.routes').then(m => m.CONSULTATIONS_ROUTES)
  },
  {
    path: 'vaccines',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Médico','Enfermera'] },
    loadChildren: () =>
      import('./features/vaccines/vaccines.routes').then(m => m.VACCINES_ROUTES)
  },
  {
    path: 'pharmacy',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Farmacéutico'] },
    loadChildren: () =>
      import('./features/pharmacy/pharmacy.routes').then(m => m.PHARMACY_ROUTES)
  },
  {
    path: 'billing',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Contador','Recepcionista'] },
    loadChildren: () =>
      import('./features/billing/billing.routes').then(m => m.BILLING_ROUTES)
  },
  {
    path: 'reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin','Médico'] },
    loadChildren: () =>
      import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin'] },
    loadChildren: () =>
      import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
  },

  // ── Páginas de estado ─────────────────────────────────────
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/errors/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent),
    title: 'Sin permisos — Star Médica'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    title: 'No encontrado — Star Médica'
  }
];

// [NG-ROUTE] features/auth/auth.routes.ts
import { Routes } from '@angular/router';
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar sesión — Star Médica'
  },
  {
    path: 'pending-approval',
    loadComponent: () =>
      import('./pending-approval/pending-approval.component')
        .then(m => m.PendingApprovalComponent),
    title: 'Pendiente de aprobación — Star Médica'
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
```
import { Routes } from '@angular/router';
export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./patients-list/patients-list.component').then(m => m.PatientsListComponent),
    title: 'Pacientes — Star Médica'
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./patient-form/patient-form.component').then(m => m.PatientFormComponent),
    title: 'Nuevo Paciente — Star Médica'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
    title: 'Expediente — Star Médica'
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./patient-form/patient-form.component').then(m => m.PatientFormComponent),
    title: 'Editar Paciente — Star Médica'
  }
];
```

---

## ✅ CHECKLIST FRONTEND — Por feature

```
Setup:
  [ ] CLI ejecutado: ng generate component ... --standalone --change-detection=OnPush
  [ ] 3 archivos generados por el CLI: .ts + .html + .scss

TypeScript (.ts):
  [ ] inject() para DI (no constructor)
  [ ] input() y output() modernos (no decoradores)
  [ ] signal() para todo el estado
  [ ] computed() para valores derivados
  [ ] ChangeDetectionStrategy.OnPush
  [ ] takeUntilDestroyed(this.destroyRef) en todas las suscripciones
  [ ] NUNCA 'any' — tipado estricto con interfaces
  [ ] Iconos Lucide como readonly properties del componente

Template (.html):
  [ ] @if / @for / @switch — NUNCA *ngIf *ngFor
  [ ] @for siempre con track item.id
  [ ] aria-label en botones e inputs
  [ ] aria-live="polite" para contadores y mensajes dinámicos
  [ ] @defer para componentes pesados (charts, mapas)

SCSS (.scss):
  [ ] @use 'variables' as * al inicio
  [ ] @use 'mixins' as * al inicio
  [ ] BEM: .bloque__elemento--modificador
  [ ] Solo var(--sm-*) — NUNCA colores hardcoded
  [ ] @include breakpoint() para responsive
  [ ] Dark mode funcional (automático con var(--sm-*))

Integración:
  [ ] Service generado con CLI
  [ ] Interface/model tipado en models/
  [ ] Ruta lazy registrada en feature.routes.ts
  [ ] ✅ ng build --configuration=development — 0 errores
  [ ] ✅ ng serve — probar en http://localhost:4200
```

---

*Star Médica ERP — PROMPT-02 FRONTEND v6.0*
*Usar con: 00-MASTER + este archivo*
*Stack: Angular 19.2 · Signals · @if/@for · Tailwind v4 · SCSS BEM*
