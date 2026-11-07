import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { Appointment, AppointmentOptions } from './appointments.model';
import { AppointmentsListComponent } from './appointments-list.component';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsListComponent', () => {
  const createAppointment = (id: number, startsAt: string): Appointment => ({
    id,
    patientId: 3,
    patientName: `Paciente ${id}`,
    doctorId: 7,
    doctorName: 'Médico de prueba',
    startsAt,
    endsAt: '2026-11-05T16:30:00Z',
    durationMinutes: 30,
    reason: 'Control',
    status: 'Scheduled'
  });

  it('requires explicit confirmation before cancelling an appointment', async () => {
    const appointment: Appointment = createAppointment(12, '2026-11-05T16:00:00Z');
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'changeStatus']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.returnValue(of([]));
    service.changeStatus.and.returnValue(of(appointment));

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    fixture.componentInstance.appointments.set([appointment]);
    fixture.detectChanges();

    const cancelButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sm-appointment__cancel'
    );
    cancelButton.click();
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector(
      'sm-confirm-dialog dialog'
    );
    expect(dialog.open).toBe(true);
    expect(fixture.nativeElement.querySelector('sm-confirm-dialog').textContent)
      .toContain('Paciente 12');
    expect(service.changeStatus).not.toHaveBeenCalled();

    const confirmButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'sm-confirm-dialog .sm-button--danger'
    );
    confirmButton.click();
    fixture.detectChanges();

    expect(service.changeStatus).toHaveBeenCalledOnceWith(12, 'Cancelled');
    expect(fixture.nativeElement.querySelector('sm-confirm-dialog')).toBeNull();
    fixture.destroy();
  });

  it('announces cancellation failures inside the open confirmation dialog', async () => {
    const appointment: Appointment = createAppointment(12, '2026-11-05T16:00:00Z');
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'changeStatus']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.returnValue(of([]));
    service.changeStatus.and.returnValue(throwError(() => new Error('No se pudo cancelar la cita.')));

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    fixture.componentInstance.appointments.set([appointment]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.sm-appointment__cancel').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('sm-confirm-dialog .sm-button--danger').click();
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('sm-confirm-dialog dialog');
    const alert: HTMLElement = fixture.nativeElement.querySelector(
      'sm-confirm-dialog sm-alert [role="alert"]'
    );
    expect(dialog.open).toBeTrue();
    expect(alert.textContent).toContain('No se pudo cancelar la cita.');
    expect(fixture.componentInstance.isCancelling()).toBeFalse();
    fixture.destroy();
  });

  it('prevents duplicate status updates while a request is pending', async () => {
    const appointment: Appointment = createAppointment(12, '2026-11-05T16:00:00Z');
    const statusRequest = new Subject<Appointment>();
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'changeStatus']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.returnValue(of([appointment]));
    service.changeStatus.and.returnValue(statusRequest);

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.changeStatus(appointment, 'Confirmed');
    component.changeStatus(appointment, 'NoShow');
    fixture.detectChanges();

    expect(service.changeStatus).toHaveBeenCalledOnceWith(12, 'Confirmed');
    expect(component.updatingAppointmentId()).toBe(12);
    expect(fixture.nativeElement.querySelector('.sm-appointment__actions button').disabled).toBeTrue();

    statusRequest.error(new Error('No se pudo actualizar la cita.'));
    fixture.detectChanges();

    expect(component.updatingAppointmentId()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No se pudo actualizar la cita.');
    fixture.destroy();
  });

  it('rejects a whitespace-only reason before creating an appointment', async () => {
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'createAppointment']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patientId = 3;
    component.form.doctorId = 7;
    component.form.startsAt = '2026-11-06T15:00';
    component.form.reason = '   ';

    component.createAppointment();

    expect(service.createAppointment).not.toHaveBeenCalled();
    expect(component.isSaving()).toBeFalse();
    expect(component.formError()).toBe('Ingresa el motivo de la cita.');
    fixture.destroy();
  });

  it('rejects invalid and past start times without throwing or calling the API', async () => {
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'createAppointment']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patientId = 3;
    component.form.doctorId = 7;
    component.form.reason = 'Control';

    component.form.startsAt = 'fecha inválida';
    expect(() => component.createAppointment()).not.toThrow();
    expect(component.formError()).toBe('Ingresa una fecha y hora válidas.');

    component.form.startsAt = '2026-02-30T10:00';
    component.createAppointment();
    expect(component.formError()).toBe('Ingresa una fecha y hora válidas.');

    component.form.startsAt = '2020-01-01T10:00';
    component.createAppointment();
    expect(component.formError()).toBe('La cita debe programarse en una fecha futura.');

    expect(service.createAppointment).not.toHaveBeenCalled();
    expect(component.isSaving()).toBeFalse();
    fixture.destroy();
  });

  it('submits the Guatemala local start time as UTC and trims the appointment reason', async () => {
    const appointment = createAppointment(12, '2026-11-07T16:15:00Z');
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'createAppointment']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.returnValue(of([]));
    service.createAppointment.and.returnValue(of(appointment));

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.options.set({
      patients: [{ id: 3, name: 'Paciente de prueba' }],
      doctors: [{ id: 7, name: 'Médico de prueba' }]
    });
    component.openForm();
    component.form.startsAt = '2026-11-07T10:15';
    component.form.reason = '  Control de seguimiento  ';

    component.createAppointment();

    expect(service.createAppointment).toHaveBeenCalledOnceWith({
      patientId: 3,
      doctorId: 7,
      startsAt: '2026-11-07T16:15:00.000Z',
      durationMinutes: 30,
      reason: 'Control de seguimiento'
    });
    expect(component.isSaving()).toBeFalse();
    expect(component.isFormOpen()).toBeFalse();
    fixture.destroy();
  });

  it('shows a retry action instead of an empty state when agenda loading fails', async () => {
    const requests: Subject<Appointment[]>[] = [];
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'changeStatus']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.callFake(() => {
      const request = new Subject<Appointment[]>();
      requests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    requests[0].error(new Error('No se pudieron cargar las citas.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar las citas.');
    expect(fixture.nativeElement.textContent).not.toContain('No hay citas para este día');
    expect(fixture.nativeElement.querySelector('sm-empty-state')).toBeNull();

    fixture.nativeElement.querySelector('sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(service.getAppointments).toHaveBeenCalledTimes(2);
    expect(component.isLoading()).toBeTrue();

    requests[1].next([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('sm-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No hay citas para este día');
    fixture.destroy();
  });

  it('distinguishes an options load failure from missing patients and doctors', async () => {
    const optionsRequests: Subject<AppointmentOptions>[] = [];
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'changeStatus']
    );
    service.getOptions.and.callFake(() => {
      const request = new Subject<AppointmentOptions>();
      optionsRequests.push(request);
      return request;
    });
    service.getAppointments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    optionsRequests[0].error(new Error('No se pudieron cargar pacientes y médicos.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar pacientes y médicos.');
    expect(fixture.nativeElement.textContent).not.toContain('registra un paciente activo');
    expect(fixture.nativeElement.querySelector('.sm-appointments__header sm-button button').disabled).toBeTrue();

    fixture.nativeElement.querySelector('sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(service.getOptions).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.isOptionsLoading()).toBeTrue();

    optionsRequests[1].next({
      patients: [{ id: 3, name: 'Paciente de prueba' }],
      doctors: [{ id: 7, name: 'Médico de prueba' }]
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.optionsError()).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-appointments__header sm-button button').disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).not.toContain('registra un paciente activo');
    fixture.destroy();
  });

  it('ignores stale agenda responses and errors after changing dates', async () => {
    const requests: Subject<Appointment[]>[] = [];
    const service = jasmine.createSpyObj<AppointmentsService>(
      'AppointmentsService',
      ['getOptions', 'getAppointments', 'changeStatus']
    );
    service.getOptions.and.returnValue(of({ patients: [], doctors: [] }));
    service.getAppointments.and.callFake(() => {
      const request = new Subject<Appointment[]>();
      requests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [{ provide: AppointmentsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.changeDate('2026-11-06');
    requests[1].next([createAppointment(2, '2026-11-06T16:00:00Z')]);
    expect(component.appointments().map(({ id }) => id)).toEqual([2]);
    expect(component.isLoading()).toBe(false);

    requests[0].next([createAppointment(1, '2026-11-05T16:00:00Z')]);
    expect(component.appointments().map(({ id }) => id)).toEqual([2]);
    expect(component.selectedDate()).toBe('2026-11-06');

    component.changeDate('2026-11-07');
    component.changeDate('2026-11-08');
    requests[2].error(new Error('Error del día anterior'));
    expect(component.error()).toBeNull();
    expect(component.isLoading()).toBe(true);

    requests[3].next([createAppointment(4, '2026-11-08T16:00:00Z')]);
    expect(component.appointments().map(({ id }) => id)).toEqual([4]);
    expect(component.error()).toBeNull();
    expect(component.isLoading()).toBe(false);
    fixture.destroy();
  });
});
