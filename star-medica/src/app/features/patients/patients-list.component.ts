import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { SmButtonComponent } from '../../shared/components/sm-button/sm-button.component';
import { SmAlertComponent } from '../../shared/components/sm-alert/sm-alert.component';
import { SmBadgeComponent } from '../../shared/components/sm-badge/sm-badge.component';
import { SmEmptyStateComponent } from '../../shared/components/sm-empty-state/sm-empty-state.component';
import { SmInputComponent } from '../../shared/components/sm-input/sm-input.component';
import { SmLoaderComponent } from '../../shared/components/sm-loader/sm-loader.component';
import { SmModalComponent } from '../../shared/components/sm-modal/sm-modal.component';
import { SmTableComponent } from '../../shared/components/sm-table/sm-table.component';
import { CreatePatientRequest, Patient } from './patients.model';
import { PatientsService } from './patients.service';

@Component({
  selector: 'sm-patients-list',
  standalone: true,
  imports: [
    FormsModule,
    SmAlertComponent,
    SmBadgeComponent,
    SmButtonComponent,
    SmEmptyStateComponent,
    SmInputComponent,
    SmLoaderComponent,
    SmModalComponent,
    SmTableComponent
  ],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientsListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly patients = signal<Patient[]>([]);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly isFormOpen = signal(false);
  readonly form: CreatePatientRequest = this.emptyForm();

  ngOnInit(): void {
    this.loadPatients();
  }

  openForm(): void {
    this.formError.set(null);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    if (!this.isSaving()) {
      this.isFormOpen.set(false);
    }
  }

  retryPatients(): void {
    if (!this.isLoading()) {
      this.loadPatients();
    }
  }

  clearFormError(): void {
    this.formError.set(null);
  }

  createPatient(): void {
    if (this.isSaving()) {
      return;
    }

    this.formError.set(null);
    this.isSaving.set(true);
    const request: CreatePatientRequest = {
      ...this.form,
      code: this.form.code.trim(),
      fullName: this.form.fullName.trim(),
      documentNumber: this.form.documentNumber.trim(),
      phone: this.form.phone.trim(),
      email: this.form.email.trim(),
      address: this.form.address.trim(),
      dateOfBirth: this.form.dateOfBirth || null
    };

    this.patientsService.createPatient(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patient) => {
          this.patients.update((patients) =>
            [...patients, patient].sort((first, second) => first.fullName.localeCompare(second.fullName))
          );
          Object.assign(this.form, this.emptyForm());
          this.isSaving.set(false);
          this.isFormOpen.set(false);
        },
        error: (error: unknown) => {
          this.formError.set(this.getErrorMessage(error));
          this.isSaving.set(false);
        }
      });
  }

  private loadPatients(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.patientsService.getPatients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.patients.set(data);
          this.error.set(null);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la lista de pacientes.');
          this.isLoading.set(false);
        }
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { detail?: unknown; title?: unknown; error?: unknown } | null;
      const message = body?.detail ?? body?.title ?? body?.error;
      if (typeof message === 'string') {
        return message;
      }
    }

    return 'No se pudo registrar el paciente.';
  }

  private emptyForm(): CreatePatientRequest {
    return {
      code: '',
      fullName: '',
      dateOfBirth: null,
      documentNumber: '',
      phone: '',
      email: '',
      address: ''
    };
  }
}