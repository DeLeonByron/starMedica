import { DatePipe } from '@angular/common';
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

import { AuthService } from '../../core/services/auth.service';
import { AvailableConsultationAppointment, Consultation, ConsultationPatient, CreateConsultationRequest } from './consultations.model';
import { ConsultationsService } from './consultations.service';

@Component({
  selector: 'sm-consultations-list',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './consultations-list.component.html',
  styleUrl: './consultations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationsListComponent implements OnInit {
  private readonly service = inject(ConsultationsService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly patients = signal<ConsultationPatient[]>([]);
  readonly consultations = signal<Consultation[]>([]);
  readonly appointments = signal<AvailableConsultationAppointment[]>([]);
  readonly selectedPatientId = signal<number | null>(null);
  readonly isLoadingPatients = signal(true);
  readonly isLoadingHistory = signal(false);
  readonly isSaving = signal(false);
  readonly isFormOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly form: CreateConsultationRequest = this.emptyForm();

  ngOnInit(): void {
    this.loadPatients();
  }

  selectPatient(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    const patientId = Number(target.value);
    this.selectedPatientId.set(patientId > 0 ? patientId : null);
    this.consultations.set([]);
    this.appointments.set([]);
    if (patientId > 0) {
      this.loadPatientData(patientId);
    }
  }

  openForm(): void {
    const patientId = this.selectedPatientId();
    if (!patientId) {
      return;
    }

    this.formError.set(null);
    this.form.patientId = patientId;
    this.form.appointmentId = null;
    this.form.consultedAt = null;
    this.isFormOpen.set(true);
  }

  selectAppointment(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    const appointmentId = Number(target.value);
    const appointment = this.appointments().find((item) => item.id === appointmentId);
    this.form.appointmentId = appointment?.id ?? null;
    this.form.consultedAt = appointment?.startsAt ?? null;
  }

  closeForm(): void {
    if (!this.isSaving()) {
      this.isFormOpen.set(false);
    }
  }

  createConsultation(): void {
    const patientId = this.selectedPatientId();
    if (this.isSaving() || !patientId) {
      return;
    }

    this.formError.set(null);
    this.isSaving.set(true);
    const request: CreateConsultationRequest = {
      ...this.form,
      patientId,
      chiefComplaint: this.form.chiefComplaint.trim(),
      presentIllness: this.form.presentIllness.trim(),
      physicalExam: this.form.physicalExam.trim(),
      diagnosisCode: this.form.diagnosisCode.trim().toUpperCase(),
      diagnosisDescription: this.form.diagnosisDescription.trim(),
      treatmentPlan: this.form.treatmentPlan.trim(),
      notes: this.form.notes?.trim() || null
    };

    this.service.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormOpen.set(false);
          this.loadPatientData(patientId);
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo guardar el expediente.'));
          this.isSaving.set(false);
        }
      });
  }

  private loadPatients(): void {
    this.service.getPatients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patients) => {
          this.patients.set(patients.map((patient) => ({ id: patient.id, fullName: patient.fullName })));
          this.isLoadingPatients.set(false);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error, 'No se pudieron cargar los pacientes.'));
          this.isLoadingPatients.set(false);
        }
      });
  }

  private loadPatientData(patientId: number): void {
    this.isLoadingHistory.set(true);
    this.error.set(null);
    this.service.getHistory(patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          this.consultations.set(history);
          this.isLoadingHistory.set(false);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error, 'No se pudo cargar el historial.'));
          this.isLoadingHistory.set(false);
        }
      });

    this.service.getAvailableAppointments(patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => this.appointments.set(
          appointments.filter((appointment) => appointment.doctorId === this.auth.user()?.id)),
        error: (error: unknown) => this.error.set(this.errorMessage(error, 'No se pudieron cargar las citas relacionadas.'))
      });
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  private emptyForm(): CreateConsultationRequest {
    return {
      patientId: 0,
      appointmentId: null,
      consultedAt: null,
      chiefComplaint: '',
      presentIllness: '',
      physicalExam: '',
      diagnosisCode: '',
      diagnosisDescription: '',
      treatmentPlan: '',
      notes: null,
      weightKg: null,
      heightCm: null,
      temperatureCelsius: null,
      heartRateBpm: null,
      respiratoryRatePerMinute: null,
      systolicBloodPressure: null,
      diastolicBloodPressure: null,
      oxygenSaturationPercent: null
    };
  }
}