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

@Component({
  selector: 'sm-appointments-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsListComponent implements OnInit {
  private readonly service = inject(AppointmentsService);
  private readonly destroyRef = inject(DestroyRef);
  readonly appointments = signal<Appointment[]>([]);
  readonly options = signal<AppointmentOptions>({ patients: [], doctors: [] });
  readonly selectedDate = signal(this.formatDateInput(new Date()));
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isFormOpen = signal(false);
  readonly error = signal<string | null>(null);
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

  createAppointment(): void {
    if (this.isSaving() || !this.form.startsAt || !this.form.patientId || !this.form.doctorId) {
      return;
    }

    this.formError.set(null);
    this.isSaving.set(true);
    const request: CreateAppointmentRequest = {
      ...this.form,
      startsAt: new Date(`${this.form.startsAt}:00-06:00`).toISOString(),
      reason: this.form.reason.trim()
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
    this.service.changeStatus(appointment.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadAppointments(),
        error: (error: unknown) => this.error.set(this.errorMessage(error, 'No se pudo actualizar la cita.'))
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
    this.service.getOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => this.options.set(options),
        error: (error: unknown) => this.error.set(this.errorMessage(error, 'No se pudieron cargar pacientes y médicos.'))
      });
  }

  private loadAppointments(): void {
    const start = new Date(`${this.selectedDate()}T00:00:00-06:00`);
    const end = new Date(`${this.selectedDate()}T00:00:00-06:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getAppointments(start.toISOString(), end.toISOString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => {
          this.appointments.set(appointments);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error, 'No se pudieron cargar las citas.'));
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