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
import { SmGrowthChartComponent, SmGrowthMeasurement } from '../../shared/components/sm-growth-chart/sm-growth-chart.component';
import { SmInputComponent } from '../../shared/components/sm-input/sm-input.component';
import { SmLoaderComponent } from '../../shared/components/sm-loader/sm-loader.component';
import { SmModalComponent } from '../../shared/components/sm-modal/sm-modal.component';
import { AvailableConsultationAppointment, Consultation, ConsultationPatient, CreateConsultationRequest } from './consultations.model';
import { ConsultationsService } from './consultations.service';

@Component({
  selector: 'sm-consultations-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    SmAlertComponent,
    SmButtonComponent,
    SmGrowthChartComponent,
    SmInputComponent,
    SmLoaderComponent,
    SmModalComponent
  ],
  templateUrl: './consultations-list.component.html',
  styleUrl: './consultations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationsListComponent implements OnInit {
  private readonly service = inject(ConsultationsService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private patientDataRequestId = 0;
  readonly patients = signal<ConsultationPatient[]>([]);
  readonly consultations = signal<Consultation[]>([]);
  readonly appointments = signal<AvailableConsultationAppointment[]>([]);
  readonly selectedPatientId = signal<number | null>(null);
  readonly isLoadingPatients = signal(true);
  readonly patientsLoaded = signal(false);
  readonly patientsError = signal<string | null>(null);
  readonly isLoadingHistory = signal(false);
  readonly isSaving = signal(false);
  readonly isFormOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly historyError = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly form: CreateConsultationRequest = this.emptyForm();
  readonly weightMeasurements = computed<readonly SmGrowthMeasurement[]>(() =>
    this.consultations()
      .flatMap((consultation) =>
        consultation.weightKg === null
          ? []
          : [{ date: consultation.consultedAt, value: consultation.weightKg }]
      )
  );
  readonly heightMeasurements = computed<readonly SmGrowthMeasurement[]>(() =>
    this.consultations()
      .flatMap((consultation) =>
        consultation.heightCm === null
          ? []
          : [{ date: consultation.consultedAt, value: consultation.heightCm }]
      )
  );

  ngOnInit(): void {
    this.loadPatients();
  }

  selectPatient(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (this.isSaving()) {
      target.value = String(this.selectedPatientId() ?? '');
      return;
    }

    const patientId = Number(target.value);
    this.patientDataRequestId++;
    this.selectedPatientId.set(patientId > 0 ? patientId : null);
    this.consultations.set([]);
    this.appointments.set([]);
    this.isLoadingHistory.set(false);
    this.historyError.set(null);
    this.isFormOpen.set(false);
    this.formError.set(null);
    Object.assign(this.form, this.emptyForm());
    if (patientId > 0) {
      this.loadPatientData(patientId);
    }
  }

  openForm(): void {
    const patientId = this.selectedPatientId();
    if (!patientId) {
      return;
    }

    Object.assign(this.form, this.emptyForm());
    this.formError.set(null);
    this.form.patientId = patientId;
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
      this.resetForm();
    }
  }

  retryPatientData(): void {
    const patientId = this.selectedPatientId();
    if (patientId && !this.isLoadingHistory()) {
      this.loadPatientData(patientId);
    }
  }

  retryPatients(): void {
    if (!this.isLoadingPatients()) {
      this.loadPatients();
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
          this.resetForm();
          if (this.selectedPatientId() === patientId) {
            this.loadPatientData(patientId);
          }
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo guardar el expediente.'));
          this.isSaving.set(false);
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
          this.patients.set(patients.map((patient) => ({ id: patient.id, fullName: patient.fullName })));
          this.patientsLoaded.set(true);
          this.isLoadingPatients.set(false);
        },
        error: (error: unknown) => {
          this.patientsError.set(this.errorMessage(error, 'No se pudieron cargar los pacientes.'));
          this.isLoadingPatients.set(false);
        }
      });
  }

  private loadPatientData(patientId: number): void {
    const requestId = ++this.patientDataRequestId;
    this.isLoadingHistory.set(true);
    this.historyError.set(null);
    this.error.set(null);
    this.service.getHistory(patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          if (this.selectedPatientId() !== patientId || requestId !== this.patientDataRequestId) {
            return;
          }

          this.consultations.set(history);
          this.isLoadingHistory.set(false);
        },
        error: (error: unknown) => {
          if (this.selectedPatientId() !== patientId || requestId !== this.patientDataRequestId) {
            return;
          }

          this.historyError.set(this.errorMessage(error, 'No se pudo cargar el historial.'));
          this.isLoadingHistory.set(false);
        }
      });

    this.service.getAvailableAppointments(patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => {
          if (this.selectedPatientId() === patientId && requestId === this.patientDataRequestId) {
            this.appointments.set(
              appointments.filter((appointment) => appointment.doctorId === this.auth.user()?.id));
          }
        },
        error: (error: unknown) => {
          if (this.selectedPatientId() === patientId && requestId === this.patientDataRequestId) {
            this.error.set(this.errorMessage(error, 'No se pudieron cargar las citas relacionadas.'));
          }
        }
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

  private resetForm(): void {
    Object.assign(this.form, this.emptyForm());
  }
}