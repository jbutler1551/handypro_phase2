import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';

interface PasswordRequirement {
  label: string;
  met: boolean;
  regex?: RegExp;
  validator?: (password: string) => boolean;
}

@Component({
  selector: 'hp-password-strength',
  template: `
    <div class="hp-password-strength">
      <div class="hp-password-strength__meter">
        <div class="hp-password-strength__bar">
          <div
            class="hp-password-strength__progress"
            [class.hp-password-strength__progress--weak]="strength === 'weak'"
            [class.hp-password-strength__progress--fair]="strength === 'fair'"
            [class.hp-password-strength__progress--good]="strength === 'good'"
            [class.hp-password-strength__progress--strong]="strength === 'strong'"
            [style.width.%]="strengthPercentage"
          ></div>
        </div>
        <span
          class="hp-password-strength__label"
          [class.hp-password-strength__label--weak]="strength === 'weak'"
          [class.hp-password-strength__label--fair]="strength === 'fair'"
          [class.hp-password-strength__label--good]="strength === 'good'"
          [class.hp-password-strength__label--strong]="strength === 'strong'"
        >
          {{ strengthLabel }}
        </span>
      </div>

      <ul *ngIf="showRequirements" class="hp-password-strength__requirements">
        <li
          *ngFor="let req of requirements"
          class="hp-password-strength__requirement"
          [class.hp-password-strength__requirement--met]="req.met"
        >
          <svg *ngIf="req.met" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="!req.met" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          {{ req.label }}
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .hp-password-strength {
      &__meter {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-3);
      }

      &__bar {
        flex: 1;
        height: 6px;
        background: var(--hp-glass-bg);
        border-radius: 3px;
        overflow: hidden;
      }

      &__progress {
        height: 100%;
        border-radius: 3px;
        transition: width 300ms ease, background 300ms ease;

        &--weak {
          background: var(--hp-color-error);
        }

        &--fair {
          background: var(--hp-color-warning);
        }

        &--good {
          background: #84CC16;
        }

        &--strong {
          background: var(--hp-color-success);
        }
      }

      &__label {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        min-width: 60px;
        text-align: right;

        &--weak { color: var(--hp-color-error); }
        &--fair { color: var(--hp-color-warning); }
        &--good { color: #84CC16; }
        &--strong { color: var(--hp-color-success); }
      }

      &__requirements {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-2);

        @media (max-width: 400px) {
          grid-template-columns: 1fr;
        }
      }

      &__requirement {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease;

        svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        &--met {
          color: var(--hp-color-success);

          svg {
            color: var(--hp-color-success);
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password = '';
  @Input() showRequirements = true;
  @Input() minLength = 8;

  strength: 'none' | 'weak' | 'fair' | 'good' | 'strong' = 'none';
  strengthPercentage = 0;
  strengthLabel = '';

  requirements: PasswordRequirement[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password'] || changes['minLength']) {
      this.evaluatePassword();
    }
  }

  private evaluatePassword(): void {
    const password = this.password || '';

    this.requirements = [
      {
        label: `At least ${this.minLength} characters`,
        met: password.length >= this.minLength
      },
      {
        label: 'One uppercase letter',
        met: /[A-Z]/.test(password)
      },
      {
        label: 'One lowercase letter',
        met: /[a-z]/.test(password)
      },
      {
        label: 'One number',
        met: /[0-9]/.test(password)
      },
      {
        label: 'One special character',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];

    const metCount = this.requirements.filter(r => r.met).length;

    if (password.length === 0) {
      this.strength = 'none';
      this.strengthPercentage = 0;
      this.strengthLabel = '';
    } else if (metCount <= 1) {
      this.strength = 'weak';
      this.strengthPercentage = 20;
      this.strengthLabel = 'Weak';
    } else if (metCount === 2) {
      this.strength = 'weak';
      this.strengthPercentage = 40;
      this.strengthLabel = 'Weak';
    } else if (metCount === 3) {
      this.strength = 'fair';
      this.strengthPercentage = 60;
      this.strengthLabel = 'Fair';
    } else if (metCount === 4) {
      this.strength = 'good';
      this.strengthPercentage = 80;
      this.strengthLabel = 'Good';
    } else {
      this.strength = 'strong';
      this.strengthPercentage = 100;
      this.strengthLabel = 'Strong';
    }
  }

  get isValid(): boolean {
    return this.requirements.every(r => r.met);
  }
}
