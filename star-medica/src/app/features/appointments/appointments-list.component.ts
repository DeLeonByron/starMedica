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

import {
  Appointment,
  AppointmentOptions,
  AppointmentStatus,
  CreateAppointmentRequest
} from './appointments.model';
import { AppointmentsService } from './appointments.service';
import { SmAlertComponent } from '../../shared/components/sm-alert/sm-alert.component';
import { SmBadgeComponent } from '../../shared/components/sm-badge/sm-badge.component';
import { SmButtonComponent } from '../../shared/components/sm-button/sm-button.component';
import { SmConfirmDialogComponent } from '../../shared/components/sm-confirm-dialog/sm-confirm-dialog.component';
import { SmEmptyStateComponent } from '../../shared/components/sm-empty-state/sm-empty-state.component';
import { SmInputComponent } from '../../shared/components/sm-input/sm-input.component';
import { SmLoaderComponent } from '../../shared/components/sm-loader/sm-loader.component';
import { SmModalComponent } from '../../shared/components/sm-modal/sm-modal.component';

@Component({
  selector: 'sm-appointments-list',
  standalone: true,
  imports: [
    FormsModule,
    SmAlertComponent,
    SmBadgeComponent,
    SmButtonComponent,
    SmConfirmDialogComponent,
    SmEmptyStateComponent,
    SmInputComponent,
    SmLoaderComponent,
    SmModalComponent
  ],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsListComponent implements OnInit {
  private readonly service = inject(AppointmentsService);
  private readonly destroyRef = inject(DestroyRef);
  private appointmentsRequestId = 0;
  private optionsRequestId = 0;
  readonly appointments = signal<Appointment[]>([]);
  readonly options = signal<AppointmentOptions>({ patients: [], doctors: [] });
  readonly optionsLoaded = signal(false);
  readonly isOptionsLoading = signal(false);
  readonly optionsError = signal<string | null>(null);
  readonly selectedDate = signal(this.formatDateInput(new Date()));
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isFormOpen = signal(false);
  readonly appointmentToCancel = signal<Appointment | null>(null);
  readonly isCancelling = signal(false);
  readonly updatingAppointmentId = signal<number | null>(null);
  readonly cancellationError = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly appointmentsError = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly dayLabel = computed(() => new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${this.selectedDate()}T12:00:00-06:00`)));
  readonly form: CreateAppointmentRequest = this.emptyForm();

  ngOnInit(): void {
    this.loadOptions();
    this.loadAppointments();
  }

  changeDate(value: string): void {
    if (value) {
      this.selectedDate.set(value);
      this.loadAppointments();
    }
  }

  changeDateFromInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.changeDate(target.value);
    }
  }

  moveDay(offset: number): void {
    const date = new Date(`${this.selectedDate()}T12:00:00-06:00`);
    date.setUTCDate(date.getUTCDate() + offset);
    this.changeDate(this.formatDateInput(date));
  }

  openForm(): void {
    this.formError.set(null);
    this.form.startsAt = this.formatDateTimeInput(new Date(Date.now() + 60 * 60 * 1000));
    this.form.patientId = this.options().patients[0]?.id ?? 0;
    this.form.doctorId = this.options().doctors[0]?.id ?? 0;
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    if (!this.isSaving()) {
      this.isFormOpen.set(false);
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  retryAppointments(): void {
    this.loadAppointments();
  }

  retryOptions(): void {
    this.loadOptions();
  }

  clearFormError(): void {
    this.formError.set(null);
  }

  createAppointment(): void {
    if (this.isSaving() || !this.form.startsAt || !this.form.patientId || !this.form.doctorId) {
      return;
    }

    this.formError.set(null);
    const reason = this.form.reason.trim();
    if (!reason) {
      this.formError.set('Ingresa el motivo de la cita.');
      return;
    }

    const startsAtInput = this.form.startsAt;
    const startsAt = new Date(`${startsAtInput}:00-06:00`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsAtInput)
      || !Number.isFinite(startsAt.getTime())
      || this.formatDateTimeInput(startsAt) !== startsAtInput) {
      this.formError.set('Ingresa una fecha y hora válidas.');
      return;
    }
    if (startsAt.getTime() <= Date.now()) {
      this.formError.set('La cita debe programarse en una fecha futura.');
      return;
    }

    this.isSaving.set(true);
    const request: CreateAppointmentRequest = {
      ...this.form,
      startsAt: startsAt.toISOString(),
      reason
    };

    this.service.createAppointment(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormOpen.set(false);
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo programar la cita.'));
          this.isSaving.set(false);
        }
      });
  }

  changeStatus(appointment: Appointment, status: AppointmentStatus): void {
    if (this.updatingAppointmentId() !== null || this.isCancelling()) {
      return;
    }

    this.updatingAppointmentId.set(appointment.id);
    this.service.changeStatus(appointment.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updatingAppointmentId.set(null);
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error, 'No se pudo actualizar la cita.'));
          this.updatingAppointmentId.set(null);
        }
      });
  }

  requestCancellation(appointment: Appointment): void {
    if (this.updatingAppointmentId() !== null) {
      return;
    }

    this.cancellationError.set(null);
    this.appointmentToCancel.set(appointment);
  }

  cancelCancellation(): void {
    if (!this.isCancelling()) {
      this.cancellationError.set(null);
      this.appointmentToCancel.set(null);
    }
  }

  confirmCancellation(): void {
    const appointment = this.appointmentToCancel();
    if (!appointment || this.isCancelling() || this.updatingAppointmentId() !== null) {
      return;
    }

    this.isCancelling.set(true);
    this.cancellationError.set(null);
    this.service.changeStatus(appointment.id, 'Cancelled')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isCancelling.set(false);
          this.cancellationError.set(null);
          this.appointmentToCancel.set(null);
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.cancellationError.set(this.errorMessage(error, 'No se pudo cancelar la cita.'));
          this.isCancelling.set(false);
        }
      });
  }

  statusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      Scheduled: 'Programada',
      Confirmed: 'Confirmada',
      Completed: 'Completada',
      Cancelled: 'Cancelada',
      NoShow: 'No asistió'
    };
    return labels[status];
  }

  statusVariant(status: AppointmentStatus): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'Scheduled':
        return 'info';
      case 'Confirmed':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      case 'NoShow':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  formatTime(value: string): string {
    return new Intl.DateTimeFormat('es-GT', {
      timeZone: 'America/Guatemala',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(new Date(value));
  }

  canClose(appointment: Appointment): boolean {
    return appointment.status === 'Scheduled' || appointment.status === 'Confirmed';
  }

  canMarkNoShow(appointment: Appointment): boolean {
    return this.canClose(appointment) && new Date(appointment.startsAt).getTime() <= Date.now();
  }

  private loadOptions(): void {
    if (this.isOptionsLoading()) {
      return;
    }

    const requestId = ++this.optionsRequestId;
    this.isOptionsLoading.set(true);
    this.optionsError.set(null);
    this.service.getOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          if (requestId !== this.optionsRequestId) {
            return;
          }

          this.options.set(options);
          this.optionsLoaded.set(true);
          this.isOptionsLoading.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.optionsRequestId) {
            return;
          }

          this.optionsError.set(this.errorMessage(error, 'No se pudieron cargar pacientes y médicos.'));
          this.isOptionsLoading.set(false);
        }
      });
  }

  private loadAppointments(): void {
    const requestId = ++this.appointmentsRequestId;
    const start = new Date(`${this.selectedDate()}T00:00:00-06:00`);
    const end = new Date(`${this.selectedDate()}T00:00:00-06:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    this.isLoading.set(true);
    this.error.set(null);
    this.appointmentsError.set(null);

    this.service.getAppointments(start.toISOString(), end.toISOString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => {
          if (requestId !== this.appointmentsRequestId) {
            return;
          }

          this.appointments.set(appointments);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.appointmentsRequestId) {
            return;
          }

          this.appointmentsError.set(this.errorMessage(error, 'No se pudieron cargar las citas.'));
          this.isLoading.set(false);
        }
      });
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  private formatDateInput(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values['year']}-${values['month']}-${values['day']}`;
  }

  private formatDateTimeInput(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values['year']}-${values['month']}-${values['day']}T${values['hour']}:${values['minute']}`;
  }

  private emptyForm(): CreateAppointmentRequest {
    return {
      patientId: 0,
      doctorId: 0,
      startsAt: '',
      durationMinutes: 30,
      reason: ''
    };
  }
}