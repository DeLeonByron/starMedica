import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmAlertComponent } from './sm-alert.component';

@Component({
  standalone: true,
  imports: [SmAlertComponent],
  template: `
    <sm-alert
      [type]="type()"
      title="Atención"
      [dismissible]="true"
      (dismissed)="visible.set(false)"
    >
      No se pudo cargar la información.
    </sm-alert>
  `
})
class SmAlertHostComponent {
  readonly type = signal<'info' | 'success' | 'warning' | 'error'>('info');
  readonly visible = signal(true);
}

describe('SmAlertComponent', () => {
  let fixture: ComponentFixture<SmAlertHostComponent>;
  let host: SmAlertHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmAlertHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmAlertHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the projected message, optional title and accessible dismiss action', () => {
    const alert: HTMLElement = fixture.nativeElement.querySelector('section');
    const title: HTMLElement | null = alert.querySelector('.sm-alert__title');
    const dismiss: HTMLButtonElement | null = alert.querySelector('button');

    expect(title?.textContent?.trim()).toBe('Atención');
    expect(alert.textContent).toContain('No se pudo cargar la información.');
    expect(dismiss?.getAttribute('aria-label')).toBe('Cerrar notificación');
  });

  it('uses polite live announcements for informational and successful messages', () => {
    const alert: HTMLElement = fixture.nativeElement.querySelector('section');

    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(alert.classList).toContain('sm-alert--info');

    host.type.set('success');
    fixture.detectChanges();
    expect(alert.classList).toContain('sm-alert--success');
  });

  it('announces errors and warnings assertively', () => {
    const alert: HTMLElement = fixture.nativeElement.querySelector('section');

    host.type.set('error');
    fixture.detectChanges();
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(alert.classList).toContain('sm-alert--error');

    host.type.set('warning');
    fixture.detectChanges();
    expect(alert.classList).toContain('sm-alert--warning');
  });

  it('emits a dismissal event when the close button is activated', () => {
    const dismiss: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    dismiss.click();
    fixture.detectChanges();

    expect(host.visible()).toBeFalse();
  });
});
