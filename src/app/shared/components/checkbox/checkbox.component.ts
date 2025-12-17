import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'hp-checkbox',
  template: `
    <label class="hp-checkbox" [class.hp-checkbox--disabled]="disabled">
      <input
        type="checkbox"
        [id]="inputId"
        [checked]="checked"
        [disabled]="disabled"
        [indeterminate]="indeterminate"
        class="hp-checkbox__input"
        (change)="onCheckboxChange($event)"
        (blur)="onTouched()"
      />
      <span class="hp-checkbox__box">
        <svg *ngIf="checked && !indeterminate" class="hp-checkbox__check" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg *ngIf="indeterminate" class="hp-checkbox__indeterminate" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </span>
      <span *ngIf="label" class="hp-checkbox__label">{{ label }}</span>
      <ng-content></ng-content>
    </label>
  `,
  styles: [`
    .hp-checkbox {
      display: inline-flex;
      align-items: center;
      gap: var(--hp-spacing-2);
      cursor: pointer;
      user-select: none;

      &--disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      &__input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;

        &:focus-visible + .hp-checkbox__box {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: 2px solid var(--hp-border-primary);
        border-radius: var(--hp-radius-base);
        background-color: var(--hp-bg-primary);
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    border-color var(--hp-micro-normal) ease-in-out,
                    box-shadow var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;
        flex-shrink: 0;

        .hp-checkbox__input:checked + &,
        .hp-checkbox__input:indeterminate + & {
          background: var(--hp-gradient-primary);
          border-color: var(--hp-color-primary);
          color: white;
          box-shadow: var(--hp-glow-primary-subtle);
          transform: scale(1.05);
        }

        .hp-checkbox__input:hover:not(:disabled) + & {
          border-color: var(--hp-color-primary);
        }

        .hp-checkbox__input:active:not(:disabled) + & {
          transform: scale(0.95);
        }
      }

      &__check,
      &__indeterminate {
        width: 14px;
        height: 14px;
      }

      &__label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        line-height: 1.4;
        transition: color 200ms ease-in-out;
      }

      &:hover &__label {
        color: var(--hp-text-primary);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled = false;
  @Input() indeterminate = false;

  @Output() changed = new EventEmitter<boolean>();

  inputId = `hp-checkbox-${nextId++}`;
  checked = false;

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;
    this.onChange(this.checked);
    this.changed.emit(this.checked);
  }

  writeValue(value: boolean): void {
    this.checked = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
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
