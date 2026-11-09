import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { Patient } from '../patients/patients.model';
import { PatientVaccination, Vaccine } from './vaccines.model';
import { VaccinesListComponent } from './vaccines-list.component';
import { VaccinesService } from './vaccines.service';

describe('VaccinesListComponent', () => {
  const createPatient = (id: number): Patient => ({
    id,
    code: `P-${id}`,
    fullName: `Paciente ${id}`,
    dateOfBirth: null,
    documentNumber: `D-${id}`,
    phone: '5550100',
    email: '',
    address: '',
    isActive: true
  });

  const createVaccination = (patientId: number): PatientVaccination => ({
    id: patientId,
    patientId,
    patientName: `Paciente ${patientId}`,
    vaccineId: 10,
    vaccineCode: 'V-10',
    vaccineName: `Vacuna ${patientId}`,
    doseNumber: 1,
    administeredAt: '2026-11-06T16:00:00Z',
    lotNumber: 'LOTE-1',
    expiresOn: '2027-11-06',
    administeredById: 7,
    administeredByName: 'Médico',
    adverseEventNotes: null
  });

  const configure = async (service: Partial<VaccinesService>): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [VaccinesListComponent],
      providers: [
        { provide: VaccinesService, useValue: service },
        { provide: AuthService, useValue: { user: () => ({ id: 7, roles: ['Médico'] }) } }
      ]
    }).compileComponents();
  };

  it('ignores a late vaccination history response after switching patients', async () => {
    const historyRequests: Subject<PatientVaccination[]>[] = [];
    const service = {
      getCatalog: () => of([]),
      getPatients: () => of([createPatient(1), createPatient(2)]),
      getPatientHistory: () => {
        const request = new Subject<PatientVaccination[]>();
        historyRequests.push(request);
        return request;
      }
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-vaccines__patient-select select'
    );

    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    patientSelect.value = '2';
    patientSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    historyRequests[1].next([createVaccination(2)]);
    historyRequests[0].next([createVaccination(1)]);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedPatientId()).toBe(2);
    expect(fixture.componentInstance.history().map(({ patientId }) => patientId)).toEqual([2]);
    expect(fixture.componentInstance.isLoadingHistory()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Vacuna 2');
    expect(fixture.nativeElement.textContent).not.toContain('Vacuna 1');
    fixture.destroy();
  });

  it('offers retry on history failure and only shows empty state after a successful response', async () => {
    const historyRequests: Subject<PatientVaccination[]>[] = [];
    const service = {
      getCatalog: () => of([]),
      getPatients: () => of([createPatient(1)]),
      getPatientHistory: () => {
        const request = new Subject<PatientVaccination[]>();
        historyRequests.push(request);
        return request;
      }
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-vaccines__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    historyRequests[0].error(new Error('No se pudo cargar el historial de vacunación.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar el historial de vacunación.');
    expect(fixture.nativeElement.querySelector('.sm-vaccines__history sm-empty-state')).toBeNull();

    fixture.nativeElement.querySelector('.sm-vaccines__history sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(historyRequests.length).toBe(2);
    expect(fixture.componentInstance.isLoadingHistory()).toBeTrue();

    historyRequests[1].next([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('sm-alert')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-vaccines__history sm-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No hay aplicaciones registradas');
    fixture.destroy();
  });

  it('keeps the selected patient fixed while an administration request is pending', async () => {
    const administrationRequest = new Subject<PatientVaccination>();
    const service = {
      getCatalog: () => of([
        {
          id: 10,
          code: 'V-10',
          name: 'Vacuna',
          targetDisease: 'Enfermedad',
          dosesRequired: 1,
          isActive: true
        }
      ]),
      getPatients: () => of([createPatient(1), createPatient(2)]),
      getPatientHistory: () => of([]),
      administer: () => administrationRequest
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-vaccines__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.componentInstance.openAdministrationForm();
    fixture.componentInstance.administer();
    fixture.detectChanges();

    expect(patientSelect.disabled).toBeTrue();
    patientSelect.value = '2';
    patientSelect.dispatchEvent(new Event('change'));

    expect(fixture.componentInstance.selectedPatientId()).toBe(1);
    expect(patientSelect.value).toBe('1');
    fixture.destroy();
  });

  it('updates the allowed dose number when the selected vaccine changes', async () => {
    const service = {
      getCatalog: () => of([
        {
          id: 10,
          code: 'V-10',
          name: 'Vacuna de tres dosis',
          targetDisease: 'Enfermedad',
          dosesRequired: 3,
          isActive: true
        },
        {
          id: 11,
          code: 'V-11',
          name: 'Vacuna de una dosis',
          targetDisease: 'Otra enfermedad',
          dosesRequired: 1,
          isActive: true
        }
      ]),
      getPatients: () => of([createPatient(1)]),
      getPatientHistory: () => of([])
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-vaccines__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.componentInstance.openAdministrationForm();
    fixture.detectChanges();

    const doseInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'sm-input#vaccination-dose-number input'
    );
    expect(doseInput.min).toBe('1');
    expect(doseInput.max).toBe('3');

    fixture.componentInstance.administrationForm.vaccineId = 11;
    expect(fixture.componentInstance.maxDoseNumber()).toBe(1);
    fixture.destroy();
  });

  it('limits catalog dose counts to the range accepted by the API', async () => {
    const service = {
      getCatalog: () => of([]),
      getPatients: () => of([])
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    fixture.componentInstance.openCatalogForm();
    fixture.detectChanges();

    const doseInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'sm-input#vaccine-doses-required input'
    );
    expect(doseInput.min).toBe('1');
    expect(doseInput.max).toBe('10');
    fixture.destroy();
  });

  it('keeps administration errors recoverable and refreshes history after retry', async () => {
    const administrationRequests: Subject<PatientVaccination>[] = [];
    let historyRequests = 0;
    const service = {
      getCatalog: () => of([{
        id: 10,
        code: 'V-10',
        name: 'Vacuna',
        targetDisease: 'Enfermedad',
        dosesRequired: 1,
        isActive: true
      }]),
      getPatients: () => of([createPatient(1)]),
      getPatientHistory: () => {
        historyRequests++;
        return of(historyRequests === 1 ? [] : [createVaccination(1)]);
      },
      administer: () => {
        const request = new Subject<PatientVaccination>();
        administrationRequests.push(request);
        return request;
      }
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-vaccines__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.componentInstance.openAdministrationForm();

    fixture.componentInstance.administer();
    fixture.componentInstance.administer();
    expect(administrationRequests.length).toBe(1);
    expect(fixture.componentInstance.isAdministering()).toBeTrue();

    administrationRequests[0].error(new Error('Esta dosis ya está registrada para el paciente.'));
    fixture.detectChanges();
    expect(fixture.componentInstance.isAdministering()).toBeFalse();
    expect(fixture.componentInstance.isAdministrationFormOpen()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Esta dosis ya está registrada para el paciente.');

    fixture.componentInstance.administer();
    expect(administrationRequests.length).toBe(2);
    expect(fixture.componentInstance.formError()).toBeNull();
    expect(fixture.componentInstance.isAdministering()).toBeTrue();

    administrationRequests[1].next(createVaccination(1));
    administrationRequests[1].complete();
    fixture.detectChanges();
    expect(fixture.componentInstance.isAdministering()).toBeFalse();
    expect(fixture.componentInstance.isAdministrationFormOpen()).toBeFalse();
    expect(historyRequests).toBe(2);
    expect(fixture.componentInstance.history().map(({ patientId }) => patientId)).toEqual([1]);
    fixture.destroy();
  });

  it('offers catalog retry and only shows the empty catalog state after a successful response', async () => {
    const catalogRequests: Subject<Vaccine[]>[] = [];
    const service = {
      getCatalog: () => {
        const request = new Subject<Vaccine[]>();
        catalogRequests.push(request);
        return request;
      },
      getPatients: () => of([createPatient(1)]),
      getPatientHistory: () => of([])
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    catalogRequests[0].error(new Error('No se pudo cargar el catálogo de vacunas.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar el catálogo de vacunas.');
    expect(fixture.nativeElement.querySelector('.sm-vaccines__catalog sm-empty-state')).toBeNull();

    fixture.nativeElement.querySelector('.sm-vaccines__catalog sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(catalogRequests.length).toBe(2);
    expect(fixture.componentInstance.isLoading()).toBeTrue();

    catalogRequests[1].next([]);
    fixture.detectChanges();
    expect(fixture.componentInstance.catalogError()).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-vaccines__catalog sm-empty-state')).not.toBeNull();
    fixture.destroy();
  });

  it('blocks dose registration when refreshing the catalog fails', async () => {
    const catalogRequests: Subject<Vaccine[]>[] = [];
    let administrationRequests = 0;
    const service = {
      getCatalog: () => {
        const request = new Subject<Vaccine[]>();
        catalogRequests.push(request);
        return request;
      },
      getPatients: () => of([createPatient(1)]),
      getPatientHistory: () => of([]),
      administer: () => {
        administrationRequests++;
        return of(createVaccination(1));
      }
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    catalogRequests[0].next([{
      id: 10,
      code: 'V-10',
      name: 'Vacuna',
      targetDisease: 'Enfermedad',
      dosesRequired: 1,
      isActive: true
    }]);
    fixture.detectChanges();

    const patientSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.sm-vaccines__patient-select select'
    );
    patientSelect.value = '1';
    patientSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.componentInstance.openAdministrationForm();
    fixture.detectChanges();
    expect(fixture.componentInstance.isAdministrationFormOpen()).toBeTrue();

    fixture.componentInstance.retryCatalog();
    catalogRequests[1].error(new Error('No se pudo actualizar el catálogo.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo actualizar el catálogo.');
    expect(fixture.nativeElement.querySelector('.sm-vaccines__history .sm-vaccines__section-header sm-button'))
      .toBeNull();
    expect(fixture.nativeElement.querySelector('sm-button[type="submit"] button').disabled).toBeTrue();

    fixture.componentInstance.administer();
    expect(administrationRequests).toBe(0);
    expect(fixture.componentInstance.isAdministering()).toBeFalse();

    fixture.componentInstance.closeForms();
    fixture.componentInstance.openAdministrationForm();
    expect(fixture.componentInstance.isAdministrationFormOpen()).toBeFalse();
    fixture.destroy();
  });

  it('distinguishes patient loading failure from an empty active-patient list and allows retry', async () => {
    const patientRequests: Subject<Patient[]>[] = [];
    const service = {
      getCatalog: () => of([{
        id: 10,
        code: 'V-10',
        name: 'Vacuna',
        targetDisease: 'Enfermedad',
        dosesRequired: 1,
        isActive: true
      }]),
      getPatients: () => {
        const request = new Subject<Patient[]>();
        patientRequests.push(request);
        return request;
      },
      getPatientHistory: () => of([])
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();
    patientRequests[0].error(new Error('No se pudieron cargar los pacientes.'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los pacientes.');
    expect(fixture.nativeElement.textContent).not.toContain('No hay pacientes activos disponibles');
    expect(fixture.nativeElement.querySelector('.sm-vaccines__patient-select select').disabled).toBeTrue();

    fixture.nativeElement.querySelector('.sm-vaccines > sm-alert sm-button button').click();
    fixture.detectChanges();
    expect(patientRequests.length).toBe(2);
    expect(fixture.componentInstance.isLoadingPatients()).toBeTrue();

    patientRequests[1].next([createPatient(1)]);
    fixture.detectChanges();
    expect(fixture.componentInstance.patientsError()).toBeNull();
    expect(fixture.nativeElement.querySelector('.sm-vaccines__patient-select select').disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).not.toContain('No hay pacientes activos disponibles');
    fixture.destroy();
  });

  it('shows a distinct state when the patient list loads successfully without active patients', async () => {
    const service = {
      getCatalog: () => of([]),
      getPatients: () => of([{
        ...createPatient(1),
        isActive: false
      }]),
      getPatientHistory: () => of([])
    };
    await configure(service);

    const fixture = TestBed.createComponent(VaccinesListComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.patientsLoaded()).toBeTrue();
    expect(fixture.componentInstance.patients()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No hay pacientes activos disponibles');
    expect(fixture.nativeElement.textContent).not.toContain('No se pudieron cargar los pacientes.');
    fixture.destroy();
  });
});
