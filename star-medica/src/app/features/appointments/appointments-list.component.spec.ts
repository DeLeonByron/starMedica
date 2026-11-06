import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Appointment } from './appointments.model';
import { AppointmentsListComponent } from './appointments-list.component';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsListComponent', () => {
  it('requires explicit confirmation before cancelling an appointment', async () => {
    const appointment: Appointment = {
      id: 12,
      patientId: 3,
      patientName: 'Paciente de prueba',
      doctorId: 7,
      doctorName: 'Médico de prueba',
      startsAt: '2026-11-05T16:00:00Z',
      endsAt: '2026-11-05T16:30:00Z',
      durationMinutes: 30,
      reason: 'Control',
      status: 'Scheduled'
    };
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
      .toContain('Paciente de prueba');
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
});
