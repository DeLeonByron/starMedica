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
  readonly type = input<'text' | 'email' | 'tel' | 'date' | 'number' | 'search' | 'url' | 'password'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('');
  readonly required = input(false);
  readonly maxLength = input<number | null>(null);
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);

  protected readonly value = signal('');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  ngOnChanges(_changes: SimpleChanges): void {
    this.onValidatorChange();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const validators = [];
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

    return Validators.compose(validators)?.(control) ?? null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  protected updateValue(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.value.set(target.value);
    this.onChange(target.value);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
