import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { SmInputComponent } from './sm-input.component';

@Component({
  standalone: true,
  imports: [FormsModule, SmInputComponent],
  template: `
    <form #form="ngForm">
      <sm-input
        id="patient-email"
        name="email"
        label="Correo electrónico"
        type="email"
        [(ngModel)]="value"
        [required]="true"
        [maxLength]="25"
        [error]="errorMessage"
      />
    </form>
  `
})
class SmInputHostComponent {
  @ViewChild('form') form!: NgForm;
  value = '';
  errorMessage = '';
}

describe('SmInputComponent', () => {
  let fixture: ComponentFixture<SmInputHostComponent>;
  let host: SmInputHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmInputHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmInputHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('associates the accessible label and input and applies validation attributes', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

    expect(label.htmlFor).toBe('patient-email');
    expect(input.id).toBe('patient-email');
    expect(input.required).toBeTrue();
    expect(input.type).toBe('email');
    expect(input.maxLength).toBe(25);
  });

  it('integrates with ngModel and validates required, email and maximum length', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(host.form.controls['email']?.hasError('required')).toBeTrue();

    input.value = 'not-an-email';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value).toBe('not-an-email');
    expect(host.form.controls['email']?.hasError('email')).toBeTrue();

    input.value = 'a'.repeat(26);
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.form.controls['email']?.hasError('maxlength')).toBeTrue();

    input.value = 'ana@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.form.valid).toBeTrue();
  });

  it('renders and links an accessible external error message', () => {
    host.errorMessage = 'Ingresa un correo válido.';
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const error: HTMLElement | null = fixture.nativeElement.querySelector('#patient-email-error');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('patient-email-error');
    expect(error?.textContent?.trim()).toBe('Ingresa un correo válido.');
  });

  it('reflects disabled state from the Angular form', () => {
    host.form.form.disable();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBeTrue();
  });
});
