import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';

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
      <sm-input
        id="patient-measurement"
        name="measurement"
        label="Measurement"
        type="number"
        [(ngModel)]="measurement"
        [min]="0.1"
        [max]="10"
        [step]="step"
      />
    </form>
  `
})
class SmInputHostComponent {
  @ViewChild('form') form!: NgForm;
  value = '';
  measurement: number | null = null;
  step: number | 'any' = 0.1;
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
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.value).toBe('not-an-email');
    expect(host.form.controls['email']?.hasError('email')).toBeTrue();

    input.value = 'a'.repeat(26);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.form.controls['email']?.hasError('maxlength')).toBeTrue();

    input.value = 'ana@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.form.valid).toBeTrue();
  });

  it('emits numeric values and validates minimum, maximum, step, and any-step values', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#patient-measurement input');
    const component = fixture.debugElement.queryAll(By.directive(SmInputComponent))[1].componentInstance;
    const control = new FormControl<unknown>(1.2);

    expect(input.min).toBe('0.1');
    expect(input.max).toBe('10');
    expect(input.step).toBe('0.1');
    expect(component.validate(control)).toBeNull();

    input.value = '1.2';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.measurement).toBe(1.2);

    control.setValue(1.25);
    expect(component.validate(control)).toEqual({ step: { step: 0.1, actual: 1.25 } });

    control.setValue(0);
    expect(component.validate(control)).toEqual({ min: { min: 0.1, actual: 0 } });

    control.setValue(10.1);
    expect(component.validate(control)).toEqual({ max: { max: 10, actual: 10.1 } });

    host.step = 'any';
    fixture.detectChanges();
    control.setValue(1.25);
    expect(component.validate(control)).toBeNull();

    control.setValue(null);
    expect(component.validate(control)).toBeNull();

    control.setValue(Number.NaN);
    expect(component.validate(control)).toEqual({ number: { actual: Number.NaN } });

    control.setValue('not-a-number');
    expect(component.validate(control)).toEqual({ number: { actual: 'not-a-number' } });
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
