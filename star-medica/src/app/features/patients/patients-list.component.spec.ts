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
});
