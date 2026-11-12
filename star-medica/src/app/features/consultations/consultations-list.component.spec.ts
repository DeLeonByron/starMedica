import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ConsultationsListComponent } from './consultations-list.component';
import { AvailableConsultationAppointment, Consultation } from './consultations.model';
import { ConsultationsService } from './consultations.service';

describe('ConsultationsListComponent', () => {
  it('distinguishes patient-list failure from an empty patient catalog and allows retry', async () => {
    const patientRequests: Subject<{ id: number; fullName: string }[]>[] = [];
    const service = {
      getPatients: () => {
        const request = new Subject<{ id: number; fullName: string }[]>();
        patientRequests.push(request);
        return request;
      },
      getHistory: () => of([]),
      getAvailableAppointments: () => of([]),
      create: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        { provide: ConsultationsService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    patientRequests[0].error(new Error('Error de conexión'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Error de conexión');
    expect(fixture.nativeElement.textContent).toContain('Reintentar');
    expect(fixture.nativeElement.textContent).not.toContain('No hay pacientes disponibles');
    expect(fixture.nativeElement.textContent).not.toContain('Selecciona un paciente para consultar o crear su expediente.');

    fixture.nativeElement.querySelector('sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(patientRequests.length).toBe(2);
    expect(fixture.componentInstance.isLoadingPatients()).toBeTrue();

    patientRequests[1].next([]);
    fixture.detectChanges();
    expect(fixture.componentInstance.patientsError()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No hay pacientes disponibles para consultar.');
    fixture.destroy();
  });

  it('loads growth charts only when their deferred blocks activate', async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            getPatients: () => of([{ id: 1, fullName: 'Paciente' }]),
            getHistory: () => of([]),
            getAvailableAppointments: () => of([])
          }
        },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedPatientId.set(1);
    fixture.componentInstance.consultations.set([{
      id: 4,
      patientId: 1,
      patientName: 'Paciente',
      doctorId: 7,
      doctorName: 'Médico',
      appointmentId: null,
      consultedAt: '2026-03-15T12:00:00Z',
      chiefComplaint: 'Consulta',
      presentIllness: 'Sin cambios',
      physicalExam: 'Sin hallazgos',
      diagnosisCode: 'Z00.1',
      diagnosisDescription: 'Control',
      treatmentPlan: 'Seguimiento',
      notes: null,
      weightKg: 8.5,
      heightCm: 70,
      temperatureCelsius: null,
      heartRateBpm: null,
      respiratoryRatePerMinute: null,
      systolicBloodPressure: null,
      diastolicBloodPressure: null,
      oxygenSaturationPercent: null
    }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('sm-growth-chart').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.sm-consultations__chart-placeholder').length)
      .toBe(2);

    const deferBlocks = await fixture.getDeferBlocks();
    expect(deferBlocks.length).toBe(2);
    await Promise.all(deferBlocks.map((block) => block.render(DeferBlockState.Complete)));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('sm-growth-chart').length).toBe(2);
    fixture.destroy();
  });

  it('ignores history and appointment responses for a patient that is no longer selected', async () => {
    const historyRequests = new Map<number, Subject<Consultation[]>>([
      [1, new Subject<Consultation[]>()],
      [2, new Subject<Consultation[]>()]
    ]);
    const appointmentRequests = new Map<number, Subject<AvailableConsultationAppointment[]>>([
      [1, new Subject<AvailableConsultationAppointment[]>()],
      [2, new Subject<AvailableConsultationAppointment[]>()]
    ]);

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            getPatients: () => of([
              { id: 1, fullName: 'Paciente uno' },
              { id: 2, fullName: 'Paciente dos' }
            ]),
            getHistory: (patientId: number) => historyRequests.get(patientId)!,
            getAvailableAppointments: (patientId: number) => appointmentRequests.get(patientId)!,
            create: () => of({})
          }
        },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-consultations__patient-select select'
    );

    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    patientSelect.value = '2';
    patientSelect.dispatchEvent(new Event('change'));

    const createHistory = (patientId: number): Consultation[] => [{
      id: patientId,
      patientId,
      patientName: `Paciente ${patientId}`,
      doctorId: 7,
      doctorName: 'Médico',
      appointmentId: null,
      consultedAt: '2026-03-15T12:00:00Z',
      chiefComplaint: 'Consulta',
      presentIllness: 'Sin cambios',
      physicalExam: 'Sin hallazgos',
      diagnosisCode: 'Z00.1',
      diagnosisDescription: 'Control',
      treatmentPlan: 'Seguimiento',
      notes: null,
      weightKg: null,
      heightCm: null,
      temperatureCelsius: null,
      heartRateBpm: null,
      respiratoryRatePerMinute: null,
      systolicBloodPressure: null,
      diastolicBloodPressure: null,
      oxygenSaturationPercent: null
    }];
    const createAppointment = (id: number): AvailableConsultationAppointment[] => [{
      id,
      startsAt: '2026-03-15T12:00:00Z',
      doctorId: 7,
      doctorName: 'Médico',
      reason: `Cita ${id}`
    }];

    historyRequests.get(1)!.next(createHistory(1));
    appointmentRequests.get(1)!.next(createAppointment(1));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedPatientId()).toBe(2);
    expect(fixture.componentInstance.consultations()).toEqual([]);
    expect(fixture.componentInstance.appointments()).toEqual([]);
    expect(fixture.componentInstance.isLoadingHistory()).toBe(true);

    historyRequests.get(2)!.next(createHistory(2));
    appointmentRequests.get(2)!.next(createAppointment(2));
    fixture.detectChanges();

    expect(fixture.componentInstance.consultations().map(({ patientId }) => patientId)).toEqual([2]);
    expect(fixture.componentInstance.appointments().map(({ id }) => id)).toEqual([2]);
    expect(fixture.componentInstance.isLoadingHistory()).toBe(false);
    fixture.destroy();
  });

  it('ignores stale history responses when the same patient data is reloaded', async () => {
    const historyRequests: Subject<Consultation[]>[] = [];
    const createRequest = new Subject<Consultation>();
    const service = {
      getPatients: () => of([{ id: 1, fullName: 'Paciente uno' }]),
      getHistory: () => {
        const request = new Subject<Consultation[]>();
        historyRequests.push(request);
        return request;
      },
      getAvailableAppointments: () => of([]),
      create: () => createRequest
    };

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        { provide: ConsultationsService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-consultations__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));

    fixture.componentInstance.openForm();
    fixture.componentInstance.createConsultation();
    createRequest.next({
      id: 20,
      patientId: 1,
      patientName: 'Paciente uno',
      doctorId: 7,
      doctorName: 'Médico',
      appointmentId: null,
      consultedAt: '2026-03-15T12:00:00Z',
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
    });

    expect(historyRequests.length).toBe(2);
    const olderHistory: Consultation = {
      id: 10,
      patientId: 1,
      patientName: 'Paciente uno',
      doctorId: 7,
      doctorName: 'Médico',
      appointmentId: null,
      consultedAt: '2026-03-15T12:00:00Z',
      chiefComplaint: 'Antigua',
      presentIllness: '',
      physicalExam: '',
      diagnosisCode: 'Z00.1',
      diagnosisDescription: 'Control',
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
    const newerHistory = { ...olderHistory, id: 11, chiefComplaint: 'Actualizada' };

    historyRequests[1].next([newerHistory]);
    historyRequests[0].next([olderHistory]);

    expect(fixture.componentInstance.consultations().map(({ chiefComplaint }) => chiefComplaint))
      .toEqual(['Actualizada']);
    fixture.destroy();
  });

  it('offers retry on history failure and does not display a false empty history', async () => {
    const historyRequests: Subject<Consultation[]>[] = [];
    const service = {
      getPatients: () => of([{ id: 1, fullName: 'Paciente uno' }]),
      getHistory: () => {
        const request = new Subject<Consultation[]>();
        historyRequests.push(request);
        return request;
      },
      getAvailableAppointments: () => of([]),
      create: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        { provide: ConsultationsService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-consultations__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    historyRequests[0].error(new Error('No se pudo cargar el historial.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar el historial.');
    expect(fixture.nativeElement.textContent).not.toContain('Este paciente aún no tiene consultas registradas.');

    fixture.nativeElement.querySelector('sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(historyRequests.length).toBe(2);
    historyRequests[1].next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Este paciente aún no tiene consultas registradas.');
    expect(fixture.componentInstance.historyError()).toBeNull();
    fixture.destroy();
  });

  it('does not reload an old patient after a consultation save completes late', async () => {
    const createRequest = new Subject<Consultation>();
    const historyRequestCounts = new Map<number, number>();

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            getPatients: () => of([
              { id: 1, fullName: 'Paciente uno' },
              { id: 2, fullName: 'Paciente dos' }
            ]),
            getHistory: (patientId: number) => {
              historyRequestCounts.set(patientId, (historyRequestCounts.get(patientId) ?? 0) + 1);
              return of([]);
            },
            getAvailableAppointments: () => of([]),
            create: () => createRequest
          }
        },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-consultations__patient-select select'
    );

    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    component.openForm();
    component.createConsultation();

    component.selectedPatientId.set(2);
    component.isLoadingHistory.set(false);
    component.consultations.set([]);
    component.appointments.set([]);
    historyRequestCounts.set(2, 1);
    const patientTwoHistoryRequests = historyRequestCounts.get(2);
    expect(patientTwoHistoryRequests).toBe(1);
    expect(component.selectedPatientId()).toBe(2);
    expect(component.isLoadingHistory()).toBe(false);

    createRequest.next({
      id: 21,
      patientId: 1,
      patientName: 'Paciente uno',
      doctorId: 7,
      doctorName: 'Médico',
      appointmentId: null,
      consultedAt: '2026-03-15T12:00:00Z',
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
    });
    fixture.detectChanges();

    expect(component.selectedPatientId()).toBe(2);
    expect(component.isLoadingHistory()).toBe(false);
    expect(historyRequestCounts.get(2)).toBe(patientTwoHistoryRequests);
    fixture.destroy();
  });

  it('resets the consultation form when changing patients and blocks selection while saving', async () => {
    const createRequest = new Subject<Consultation>();

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            getPatients: () => of([
              { id: 1, fullName: 'Paciente uno' },
              { id: 2, fullName: 'Paciente dos' }
            ]),
            getHistory: () => of([]),
            getAvailableAppointments: () => of([]),
            create: () => createRequest
          }
        },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-consultations__patient-select select'
    );

    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    component.openForm();
    component.form.chiefComplaint = 'Datos privados del paciente uno';
    component.form.appointmentId = 12;
    component.form.consultedAt = '2026-03-15T12:00:00Z';

    patientSelect.value = '2';
    patientSelect.dispatchEvent(new Event('change'));

    expect(component.selectedPatientId()).toBe(2);
    expect(component.isFormOpen()).toBe(false);
    expect(component.form.patientId).toBe(0);
    expect(component.form.chiefComplaint).toBe('');
    expect(component.form.appointmentId).toBeNull();
    expect(component.form.consultedAt).toBeNull();

    component.openForm();
    component.form.chiefComplaint = 'Consulta nueva';
    component.createConsultation();
    fixture.detectChanges();

    expect(patientSelect.disabled).toBe(true);
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));

    expect(component.selectedPatientId()).toBe(2);
    expect(patientSelect.value).toBe('2');
    expect(component.form.chiefComplaint).toBe('Consulta nueva');
    fixture.destroy();
  });

  it('uses the shared accessible modal and prevents dismissing it while saving', async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            getPatients: () => of([{ id: 2, fullName: 'Paciente dos' }]),
            getHistory: () => of([]),
            getAvailableAppointments: () => of([])
          }
        },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.selectedPatientId.set(2);
    component.openForm();
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('sm-modal dialog');
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe('consultation-form-title');

    component.isSaving.set(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.sm-consultations__close').click();
    fixture.detectChanges();

    expect(component.isFormOpen()).toBe(true);
    expect(dialog.open).toBe(true);
    component.isSaving.set(false);
    fixture.destroy();
  });

  it('starts a new consultation with a clean form after the previous draft was dismissed', async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        {
          provide: ConsultationsService,
          useValue: {
            getPatients: () => of([]),
            getHistory: () => of([]),
            getAvailableAppointments: () => of([])
          }
        },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.selectedPatientId.set(2);
    component.openForm();
    component.form.chiefComplaint = 'Motivo anterior';
    component.form.diagnosisCode = 'A00';
    component.form.weightKg = 12.5;
    component.form.appointmentId = 15;
    component.form.consultedAt = '2026-03-15T12:00:00Z';
    component.formError.set('Error anterior');
    component.closeForm();

    component.openForm();

    expect(component.isFormOpen()).toBe(true);
    expect(component.form.patientId).toBe(2);
    expect(component.form.chiefComplaint).toBe('');
    expect(component.form.diagnosisCode).toBe('');
    expect(component.form.weightKg).toBeNull();
    expect(component.form.appointmentId).toBeNull();
    expect(component.form.consultedAt).toBeNull();
    expect(component.formError()).toBeNull();
    fixture.destroy();
  });

  it('locks consultation fields while saving, preserves rejected data, and resets after success', async () => {
    const createRequests: Subject<Consultation>[] = [];
    const service = {
      getPatients: () => of([{ id: 2, fullName: 'Paciente de prueba' }]),
      getHistory: () => of([]),
      getAvailableAppointments: () => of([]),
      create: () => {
        const request = new Subject<Consultation>();
        createRequests.push(request);
        return request;
      }
    };

    await TestBed.configureTestingModule({
      imports: [ConsultationsListComponent],
      providers: [
        { provide: ConsultationsService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 7 }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ConsultationsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.selectedPatientId.set(2);
    component.openForm();
    Object.assign(component.form, {
      appointmentId: 15,
      consultedAt: '2026-03-15T12:00:00Z',
      chiefComplaint: 'Consulta de prueba',
      presentIllness: 'Historia de prueba',
      physicalExam: 'Examen de prueba',
      diagnosisCode: 'Z00.1',
      diagnosisDescription: 'Control',
      treatmentPlan: 'Seguimiento',
      notes: 'Nota de prueba',
      weightKg: 12.5
    });

    component.createConsultation();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form[aria-busy="true"]')).not.toBeNull();
    const controls: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('form input, form select, form textarea')
    );
    expect(controls.length).toBe(16);
    expect(controls.every((control) => control.disabled)).toBeTrue();
    expect(fixture.nativeElement.querySelector('form sm-button button').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('.sm-consultations__close').disabled).toBeTrue();

    component.closeForm();
    expect(component.isFormOpen()).toBeTrue();

    createRequests[0].error(new Error('No se pudo guardar el expediente.'));
    fixture.detectChanges();

    expect(component.isSaving()).toBeFalse();
    expect(component.isFormOpen()).toBeTrue();
    expect(component.form.chiefComplaint).toBe('Consulta de prueba');
    expect(component.form.appointmentId).toBe(15);
    expect(component.form.weightKg).toBe(12.5);
    expect(fixture.nativeElement.textContent).toContain('No se pudo guardar el expediente.');

    component.closeForm();
    expect(component.isFormOpen()).toBeFalse();
    expect(component.form.chiefComplaint).toBe('');
    expect(component.form.patientId).toBe(0);

    component.openForm();
    component.form.chiefComplaint = 'Nueva consulta';
    component.createConsultation();
    createRequests[1].next({
      id: 20,
      patientId: 2,
      patientName: 'Paciente de prueba',
      doctorId: 7,
      doctorName: 'Médico',
      appointmentId: null,
      consultedAt: '2026-03-15T12:00:00Z',
      chiefComplaint: 'Nueva consulta',
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
    });

    expect(component.isFormOpen()).toBeFalse();
    expect(component.form.chiefComplaint).toBe('');
    expect(component.form.patientId).toBe(0);
    fixture.destroy();
  });
});
