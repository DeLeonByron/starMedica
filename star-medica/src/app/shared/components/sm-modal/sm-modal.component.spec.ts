import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmModalComponent } from './sm-modal.component';

@Component({
  standalone: true,
  imports: [SmModalComponent],
  template: `
    <button type="button" (click)="open.set(true)">Abrir diálogo</button>
    <h2 id="modal-title">Diálogo de prueba</h2>
    <sm-modal
      [open]="open()"
      labelledBy="modal-title"
      [closeOnBackdrop]="closeOnBackdrop"
      (dismissed)="open.set(false)"
    >
      <p>Contenido del diálogo</p>
    </sm-modal>
  `
})
class SmModalHostComponent {
  readonly open = signal(false);
  closeOnBackdrop = true;
}

describe('SmModalComponent', () => {
  let fixture: ComponentFixture<SmModalHostComponent>;
  let host: SmModalHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmModalHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmModalHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('opens a native modal dialog with its accessible name and projected content', () => {
    host.open.set(true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

    expect(dialog.open).toBeTrue();
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    expect(dialog.textContent).toContain('Contenido del diálogo');
  });

  it('requests dismissal on Escape without allowing an uncontrolled native close', () => {
    host.open.set(true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);
    fixture.detectChanges();

    expect(cancelEvent.defaultPrevented).toBeTrue();
    expect(host.open()).toBeFalse();
    expect(dialog.open).toBeFalse();
  });

  it('dismisses on backdrop click but not on clicks inside the dialog', () => {
    host.open.set(true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const content: HTMLElement = dialog.querySelector('p')!;
    content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBeTrue();

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.open()).toBeFalse();
  });

  it('keeps the dialog open when backdrop dismissal is disabled', () => {
    host.closeOnBackdrop = false;
    host.open.set(true);
    fixture.detectChanges();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBeTrue();
    expect(dialog.open).toBeTrue();
  });
});
