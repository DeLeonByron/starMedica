import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { Patient } from './patients.model';
import { PatientsListComponent } from './patients-list.component';
import { PatientsService } from './patients.service';

describe('PatientsListComponent', () => {
  const createPatient = (): Patient => ({
    id: 1,
    code: 'P-001',
    fullName: 'Paciente de prueba',
    dateOfBirth: null,
    documentNumber: 'DOC-001',
    phone: '5550100',
    email: '',
    address: '',
    isActive: true
  });

  it('offers retry on load failure and only shows empty state after a successful response', async () => {
    const requests: Subject<Patient[]>[] = [];
    const service = jasmine.createSpyObj<PatientsService>(
      'PatientsService',
      ['getPatients', 'createPatient']
    );
    service.getPatients.and.callFake(() => {
      const request = new Subject<Patient[]>();
      requests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [{ provide: PatientsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    fixture.detectChanges();
    requests[0].error(new Error('Error de conexión'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar la lista de pacientes.');
    expect(fixture.nativeElement.querySelector('sm-empty-state')).toBeNull();

    fixture.nativeElement.querySelector('sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(service.getPatients).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.isLoading()).toBeTrue();

    requests[1].next([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('sm-alert')).toBeNull();
    expect(fixture.nativeElement.querySelector('sm-empty-state')).not.toBeNull();
    fixture.destroy();
  });

  it('renders patients returned by the service', async () => {
    const service = jasmine.createSpyObj<PatientsService>(
      'PatientsService',
      ['getPatients', 'createPatient']
    );
    service.getPatients.and.returnValue(of([createPatient()]));

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [{ provide: PatientsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Paciente de prueba');
    expect(fixture.nativeElement.querySelector('sm-empty-state')).toBeNull();
    fixture.destroy();
  });

  it('reloads after create and ignores a stale initial patient response', async () => {
    const patientRequests: Subject<Patient[]>[] = [];
    const createRequest = new Subject<Patient>();
    const service = jasmine.createSpyObj<PatientsService>(
      'PatientsService',
      ['getPatients', 'createPatient']
    );
    service.getPatients.and.callFake(() => {
      const request = new Subject<Patient[]>();
      patientRequests.push(request);
      return request;
    });
    service.createPatient.and.returnValue(createRequest);

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [{ provide: PatientsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.openForm();
    Object.assign(component.form, {
      code: 'P-002',
      fullName: 'Paciente nuevo',
      documentNumber: 'DOC-002',
      phone: '5550101'
    });
    component.createPatient();

    const createdPatient = { ...createPatient(), id: 2, code: 'P-002', fullName: 'Paciente nuevo' };
    createRequest.next(createdPatient);
    expect(service.getPatients).toHaveBeenCalledTimes(2);

    patientRequests[0].next([]);
    fixture.detectChanges();
    expect(component.isLoading()).toBeTrue();
    expect(component.patients()).toEqual([]);

    patientRequests[1].next([createdPatient]);
    fixture.detectChanges();
    expect(component.isLoading()).toBeFalse();
    expect(component.patients()).toEqual([createdPatient]);
    fixture.destroy();
  });

  it('does not duplicate a patient already returned by the concurrent list request', async () => {
    const patientRequest = new Subject<Patient[]>();
    const createRequest = new Subject<Patient>();
    const service = jasmine.createSpyObj<PatientsService>(
      'PatientsService',
      ['getPatients', 'createPatient']
    );
    service.getPatients.and.returnValue(patientRequest);
    service.createPatient.and.returnValue(createRequest);

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [{ provide: PatientsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.openForm();
    Object.assign(component.form, {
      code: 'P-002',
      fullName: 'Paciente nuevo',
      documentNumber: 'DOC-002',
      phone: '5550101'
    });
    component.createPatient();

    const createdPatient = { ...createPatient(), id: 2, code: 'P-002', fullName: 'Paciente nuevo' };
    patientRequest.next([createdPatient]);
    createRequest.next(createdPatient);

    expect(component.patients()).toEqual([createdPatient]);
    fixture.destroy();
  });

  it('locks patient fields while saving, preserves rejected data, and resets after success', async () => {
    const createRequests: Subject<Patient>[] = [];
    const service = jasmine.createSpyObj<PatientsService>(
      'PatientsService',
      ['getPatients', 'createPatient']
    );
    service.getPatients.and.returnValue(of([]));
    service.createPatient.and.callFake(() => {
      const request = new Subject<Patient>();
      createRequests.push(request);
      return request;
    });

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [{ provide: PatientsService, useValue: service }]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.openForm();
    fixture.detectChanges();
    const phoneInput: HTMLInputElement = fixture.nativeElement.querySelector('#patient-phone input');
    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('#patient-email input');
    const addressInput: HTMLInputElement = fixture.nativeElement.querySelector('#patient-address input');
    expect(phoneInput.maxLength).toBe(25);
    expect(emailInput.maxLength).toBe(200);
    expect(addressInput.maxLength).toBe(500);

    Object.assign(component.form, {
      code: 'P-002',
      fullName: 'Paciente de prueba',
      dateOfBirth: '2020-05-10',
      documentNumber: 'DOC-002',
      phone: '5550101',
      email: 'paciente@example.test',
      address: 'Dirección de prueba'
    });
    component.createPatient();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form[aria-busy="true"]')).not.toBeNull();
    const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('form input'));
    expect(inputs.length).toBe(7);
    expect(inputs.every((input) => input.disabled)).toBeTrue();
    expect(fixture.nativeElement.querySelector('.sm-patients__close').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('form sm-button button').disabled).toBeTrue();

    component.closeForm();
    expect(component.isFormOpen()).toBeTrue();

    createRequests[0].error(new Error('El documento ya está registrado.'));
    fixture.detectChanges();

    expect(component.isSaving()).toBeFalse();
    expect(component.isFormOpen()).toBeTrue();
    expect(component.form.documentNumber).toBe('DOC-002');
    expect(component.form.email).toBe('paciente@example.test');
    expect(fixture.nativeElement.textContent).toContain('No se pudo registrar el paciente.');

    component.closeForm();
    expect(component.isFormOpen()).toBeFalse();
    expect(component.form.fullName).toBe('');
    expect(component.form.documentNumber).toBe('');

    component.openForm();
    expect(component.form.fullName).toBe('');
    expect(component.form.email).toBe('');
    expect(component.formError()).toBeNull();
    Object.assign(component.form, {
      code: 'P-003',
      fullName: 'Paciente nuevo',
      documentNumber: 'DOC-003',
      phone: '5550102'
    });
    component.createPatient();
    createRequests[1].next({
      ...createPatient(),
      id: 2,
      code: 'P-003',
      fullName: 'Paciente nuevo',
      documentNumber: 'DOC-003'
    });

    expect(component.isFormOpen()).toBeFalse();
    expect(component.form.fullName).toBe('');
    expect(component.form.documentNumber).toBe('');
    expect(component.patients().map(({ id }) => id)).toEqual([2]);
    fixture.destroy();
  });
});
