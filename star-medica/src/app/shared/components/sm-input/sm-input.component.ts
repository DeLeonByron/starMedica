import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  computed,
  forwardRef,
  input,
  signal,
  SimpleChanges
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';

@Component({
  selector: 'sm-input',
  standalone: true,
  imports: [],
  templateUrl: './sm-input.component.html',
  styleUrl: './sm-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SmInputComponent),
    multi: true
  }, {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => SmInputComponent),
    multi: true
  }]
})
export class SmInputComponent implements ControlValueAccessor, Validator, OnChanges {
  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'tel' | 'date' | 'datetime-local' | 'number' | 'search' | 'url' | 'password'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly required = input(false);
  readonly maxLength = input<number | null>(null);
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input<number | 'any'>(1);
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);

  protected readonly value = signal('');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  ngOnChanges(_changes: SimpleChanges): void {
    this.onValidatorChange();
  }

  writeValue(value: string | number | null): void {
    this.value.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const validators: ValidatorFn[] = [];
    if (this.required()) {
      validators.push(Validators.required);
    }
    if (this.type() === 'email') {
      validators.push(Validators.email);
    }
    const maxLength = this.maxLength();
    if (maxLength !== null) {
      validators.push(Validators.maxLength(maxLength));
    }
    if (this.type() === 'number') {
      const min = this.min();
      const max = this.max();
      if (min !== null) {
        validators.push(Validators.min(min));
      }
      if (max !== null) {
        validators.push(Validators.max(max));
      }
    }

    const validationErrors = Validators.compose(validators)?.(control) ?? null;
    const step = this.step();
    if (validationErrors || this.type() !== 'number') {
      return validationErrors;
    }

    const value = Number(control.value);
    if (control.value === null || control.value === undefined || control.value === '') {
      return validationErrors;
    }
    if (!Number.isFinite(value)) {
      return { number: { actual: control.value } };
    }
    if (step === 'any') {
      return null;
    }

    if (step <= 0) {
      return { step: { step, actual: value } };
    }

    const stepBase = this.min() ?? 0;
    const stepsFromBase = (value - stepBase) / step;
    if (Math.abs(stepsFromBase - Math.round(stepsFromBase)) > 1e-8) {
      return { step: { step, actual: value } };
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  protected updateValue(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const rawValue = target.value;
    const normalizedValue = this.type() === 'number'
      ? (rawValue === '' ? null : Number(rawValue))
      : rawValue;

    this.value.set(rawValue);
    this.onChange(normalizedValue);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
