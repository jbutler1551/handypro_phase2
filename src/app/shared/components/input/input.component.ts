import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'hp-input',
  template: `
    <div class="hp-input" [class.hp-input--error]="hasError" [class.hp-input--disabled]="disabled">
      <label *ngIf="label" class="hp-input__label" [for]="inputId">
        {{ label }}
        <span *ngIf="required" class="hp-input__required">*</span>
      </label>

      <div class="hp-input__wrapper">
        <span *ngIf="prefixIcon" class="hp-input__prefix">
          <span class="hp-input__icon">{{ prefixIcon }}</span>
        </span>

        <input
          [id]="inputId"
          [type]="currentType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [attr.aria-invalid]="hasError"
          [attr.aria-describedby]="hasError ? inputId + '-error' : hint ? inputId + '-hint' : null"
          class="hp-input__field"
          [class.hp-input__field--has-prefix]="prefixIcon"
          [class.hp-input__field--has-suffix]="suffixIcon || type === 'password'"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
        />

        <button
          *ngIf="type === 'password'"
          type="button"
          class="hp-input__toggle"
          (click)="togglePassword()"
          [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
          tabindex="-1"
        >
          <span class="hp-input__icon">{{ showPassword ? 'eye-off' : 'eye' }}</span>
        </button>

        <span *ngIf="suffixIcon && type !== 'password'" class="hp-input__suffix">
          <span class="hp-input__icon">{{ suffixIcon }}</span>
        </span>
      </div>

      <p *ngIf="hint && !hasError" [id]="inputId + '-hint'" class="hp-input__hint">{{ hint }}</p>
      <p *ngIf="hasError" [id]="inputId + '-error'" class="hp-input__error" role="alert">{{ error }}</p>
    </div>
  `,
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' = 'text';
  @Input() placeholder = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;

  inputId = `hp-input-${nextId++}`;
  value = '';
  showPassword = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  get currentType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get hasError(): boolean {
    return !!this.error;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
