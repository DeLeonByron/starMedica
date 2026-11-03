import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmConfirmDialogComponent } from './sm-confirm-dialog.component';

@Component({
  standalone: true,
  imports: [SmConfirmDialogComponent],
  template: `
    <sm-confirm-dialog
      id="remove-patient"
      [open]="open()"
      title="Eliminar paciente"
      message="Esta acción no se puede deshacer."
      [loading]="loading()"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()"
    />
  `
})
class SmConfirmDialogHostComponent {
  readonly open = signal(false);
  readonly loading = signal(false);
  readonly confirmCount = signal(0);
  readonly cancelCount = signal(0);

  onConfirmed(): void {
    this.confirmCount.update((count) => count + 1);
  }

  onCancelled(): void {
    this.cancelCount.update((count) => count + 1);
  }
}

describe('SmConfirmDialogComponent', () => {
  let fixture: ComponentFixture<SmConfirmDialogHostComponent>;
  let host: SmConfirmDialogHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmConfirmDialogHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmConfirmDialogHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders an accessible confirmation dialog with its configured text', () => {
    host.open.set(true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const title: HTMLElement = fixture.nativeElement.querySelector('#remove-patient-title');

    expect(dialog.open).toBeTrue();
    expect(dialog.getAttribute('aria-labelledby')).toBe('remove-patient-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('remove-patient-description');
    expect(title.textContent?.trim()).toBe('Eliminar paciente');
    expect(dialog.textContent).toContain('Esta acción no se puede deshacer.');
    expect(dialog.textContent).toContain('Confirmar');
    expect(dialog.textContent).toContain('Cancelar');
  });

  it('emits confirmation and cancellation events from their respective actions', () => {
    host.open.set(true);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons[0].click();
    buttons[1].click();

    expect(host.cancelCount()).toBe(1);
    expect(host.confirmCount()).toBe(1);
  });

  it('does not confirm or cancel while a confirmation is loading', () => {
    host.open.set(true);
    host.loading.set(true);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons[0].click();
    buttons[1].click();
    fixture.detectChanges();

    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeTrue();
    expect(host.confirmCount()).toBe(0);
    expect(host.cancelCount()).toBe(0);
  });

  it('does not dismiss on backdrop clicks but requests cancellation on Escape', () => {
    host.open.set(true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.cancelCount()).toBe(0);

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    expect(host.cancelCount()).toBe(1);
  });
});
