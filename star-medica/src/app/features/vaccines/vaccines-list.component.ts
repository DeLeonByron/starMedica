import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { SmAlertComponent } from '../../shared/components/sm-alert/sm-alert.component';
import { SmButtonComponent } from '../../shared/components/sm-button/sm-button.component';
import { SmEmptyStateComponent } from '../../shared/components/sm-empty-state/sm-empty-state.component';
import { SmInputComponent } from '../../shared/components/sm-input/sm-input.component';
import { SmLoaderComponent } from '../../shared/components/sm-loader/sm-loader.component';
import { SmModalComponent } from '../../shared/components/sm-modal/sm-modal.component';
import { Patient } from '../patients/patients.model';
import {
  AdministerVaccineRequest,
  CreateVaccineRequest,
  PatientVaccination,
  Vaccine
} from './vaccines.model';
import { VaccinesService } from './vaccines.service';

@Component({
  selector: 'sm-vaccines-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    SmAlertComponent,
    SmButtonComponent,
    SmEmptyStateComponent,
    SmInputComponent,
    SmLoaderComponent,
    SmModalComponent
  ],
  templateUrl: './vaccines-list.component.html',
  styleUrl: './vaccines-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaccinesListComponent implements OnInit {
  private readonly service = inject(VaccinesService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private historyRequestId = 0;
  readonly catalog = signal<Vaccine[]>([]);
  readonly patients = signal<Patient[]>([]);
  readonly isLoadingPatients = signal(true);
  readonly patientsLoaded = signal(false);
  readonly patientsError = signal<string | null>(null);
  readonly history = signal<PatientVaccination[]>([]);
  readonly selectedPatientId = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly catalogError = signal<string | null>(null);
  readonly isLoadingHistory = signal(false);
  readonly historyError = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly isAdministering = signal(false);
  readonly isCatalogFormOpen = signal(false);
  readonly isAdministrationFormOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly isSuperAdmin = computed(() => this.auth.user()?.roles.includes('SuperAdmin') ?? false);
  readonly isDoctor = computed(() => this.auth.user()?.roles.includes('Médico') ?? false);
  readonly catalogForm: CreateVaccineRequest = { code: '', name: '', targetDisease: '', dosesRequired: 1 };
  readonly administrationForm: AdministerVaccineRequest = this.emptyAdministrationForm();

  ngOnInit(): void {
    this.loadCatalog();
    this.loadPatients();
  }

  selectPatient(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (this.isAdministering()) {
      target.value = String(this.selectedPatientId() ?? '');
      return;
    }

    const patientId = Number(target.value);
    if (patientId > 0 && !this.patients().some((patient) => patient.id === patientId)) {
      target.value = String(this.selectedPatientId() ?? '');
      return;
    }

    this.historyRequestId++;
    this.selectedPatientId.set(patientId > 0 ? patientId : null);
    this.history.set([]);
    this.historyError.set(null);
    if (patientId > 0) {
      this.loadHistory(patientId);
    }
  }

  openCatalogForm(): void {
    this.formError.set(null);
    this.isCatalogFormOpen.set(true);
  }

  openAdministrationForm(): void {
    const patientId = this.selectedPatientId();
    if (!this.isActivePatientSelected() || !patientId || !this.isCatalogAvailable()) {
      return;
    }

    this.formError.set(null);
    Object.assign(this.administrationForm, this.emptyAdministrationForm());
    this.administrationForm.vaccineId = this.catalog()[0].id;
    this.isAdministrationFormOpen.set(true);
  }

  closeForms(): void {
    if (!this.isSaving() && !this.isAdministering()) {
      this.isCatalogFormOpen.set(false);
      this.isAdministrationFormOpen.set(false);
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  clearFormError(): void {
    this.formError.set(null);
  }

  retryHistory(): void {
    const patientId = this.selectedPatientId();
    if (patientId && !this.isLoadingHistory()) {
      this.loadHistory(patientId);
    }
  }

  retryCatalog(): void {
    if (!this.isLoading()) {
      this.loadCatalog();
    }
  }

  retryPatients(): void {
    if (!this.isLoadingPatients()) {
      this.loadPatients();
    }
  }

  maxDoseNumber(): number {
    return this.catalog().find((vaccine) => vaccine.id === this.administrationForm.vaccineId)?.dosesRequired ?? 1;
  }

  isCatalogAvailable(): boolean {
    return !this.isLoading() && this.catalogError() === null && this.catalog().length > 0;
  }

  isSelectedVaccineAvailable(): boolean {
    return this.isCatalogAvailable()
      && this.catalog().some((vaccine) => vaccine.id === this.administrationForm.vaccineId);
  }

  createVaccine(): void {
    if (this.isSaving()) {
      return;
    }

    this.formError.set(null);
    this.isSaving.set(true);
    const request = {
      ...this.catalogForm,
      code: this.catalogForm.code.trim().toUpperCase(),
      name: this.catalogForm.name.trim(),
      targetDisease: this.catalogForm.targetDisease.trim()
    };

    this.service.createVaccine(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isCatalogFormOpen.set(false);
          this.catalogForm.code = '';
          this.catalogForm.name = '';
          this.catalogForm.targetDisease = '';
          this.catalogForm.dosesRequired = 1;
          this.loadCatalog();
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo guardar la vacuna.'));
          this.isSaving.set(false);
        }
      });
  }

  administer(): void {
    const patientId = this.selectedPatientId();
    if (!this.isActivePatientSelected()
      || !patientId
      || !this.isSelectedVaccineAvailable()
      || this.isAdministering()) {
      return;
    }

    this.formError.set(null);
    this.isAdministering.set(true);
    const request: AdministerVaccineRequest = {
      ...this.administrationForm,
      administeredAt: new Date().toISOString(),
      lotNumber: this.administrationForm.lotNumber.trim(),
      adverseEventNotes: this.administrationForm.adverseEventNotes?.trim() || null
    };

    this.service.administer(patientId, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isAdministering.set(false);
          this.isAdministrationFormOpen.set(false);
          if (this.selectedPatientId() === patientId) {
            this.loadHistory(patientId);
          }
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo registrar la aplicación.'));
          this.isAdministering.set(false);
        }
      });
  }

  private loadCatalog(): void {
    this.isLoading.set(true);
    this.catalogError.set(null);
    this.service.getCatalog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (catalog) => {
          this.catalog.set(catalog);
          this.catalogError.set(null);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.catalogError.set(this.errorMessage(error, 'No se pudo cargar el catálogo de vacunas.'));
          this.isLoading.set(false);
        }
      });
  }

  private loadPatients(): void {
    this.isLoadingPatients.set(true);
    this.patientsError.set(null);
    this.service.getPatients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients) => {
          const activePatients = patients.filter((patient) => patient.isActive);
          this.patients.set(activePatients);
          this.patientsLoaded.set(true);
          this.isLoadingPatients.set(false);

          if (!activePatients.some((patient) => patient.id === this.selectedPatientId())) {
            this.historyRequestId++;
            this.selectedPatientId.set(null);
            this.history.set([]);
            this.historyError.set(null);
          }
        },
        error: (error: unknown) => {
          this.patientsError.set(this.errorMessage(error, 'No se pudieron cargar los pacientes.'));
          this.isLoadingPatients.set(false);
        }
      });
  }

  isActivePatientSelected(): boolean {
    const patientId = this.selectedPatientId();
    return this.patientsLoaded()
      && !this.isLoadingPatients()
      && this.patientsError() === null
      && patientId !== null
      && this.patients().some((patient) => patient.id === patientId);
  }

  private loadHistory(patientId: number): void {
    const requestId = ++this.historyRequestId;
    this.isLoadingHistory.set(true);
    this.historyError.set(null);
    this.service.getPatientHistory(patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          if (this.selectedPatientId() !== patientId || requestId !== this.historyRequestId) {
            return;
          }

          this.history.set(history);
          this.isLoadingHistory.set(false);
        },
        error: (error: unknown) => {
          if (this.selectedPatientId() !== patientId || requestId !== this.historyRequestId) {
            return;
          }

          this.historyError.set(this.errorMessage(error, 'No se pudo cargar el historial de vacunación.'));
          this.isLoadingHistory.set(false);
        }
      });
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  private emptyAdministrationForm(): AdministerVaccineRequest {
    return {
      vaccineId: 0,
      doseNumber: 1,
      administeredAt: new Date().toISOString(),
      lotNumber: '',
      expiresOn: '',
      adverseEventNotes: null
    };
  }
}