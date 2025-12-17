import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'hp-step-account',
  template: `
    <div class="hp-step-account">
      <div class="hp-step-account__header">
        <h2 class="hp-step-account__title">Create your account</h2>
        <p class="hp-step-account__description">
          Enter your personal information to get started.
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="hp-step-account__form">
        <div class="hp-step-account__row">
          <hp-input
            label="First name"
            formControlName="firstName"
            placeholder="John"
            [error]="getFieldError('firstName')"
          ></hp-input>
          <hp-input
            label="Last name"
            formControlName="lastName"
            placeholder="Doe"
            [error]="getFieldError('lastName')"
          ></hp-input>
        </div>

        <hp-input
          label="Email address"
          type="email"
          formControlName="email"
          placeholder="john@example.com"
          [error]="getFieldError('email')"
        ></hp-input>

        <hp-input
          label="Phone number"
          type="tel"
          formControlName="phone"
          placeholder="(555) 123-4567"
          [error]="getFieldError('phone')"
        ></hp-input>

        <hp-input
          label="Password"
          type="password"
          formControlName="password"
          placeholder="Create a password"
          hint="At least 8 characters with uppercase, lowercase, and number"
          [error]="getFieldError('password')"
        ></hp-input>

        <hp-checkbox formControlName="termsAccepted">
          I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
        </hp-checkbox>

        <div class="hp-step-account__actions">
          <hp-button variant="outline" type="button" (click)="onBack()">
            Back
          </hp-button>
          <hp-button variant="primary" type="submit" [disabled]="form.invalid">
            Continue
          </hp-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .hp-step-account {
      &__header {
        text-align: center;
        margin-bottom: var(--hp-spacing-8);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__description {
        font-size: var(--hp-font-size-base);
        color: var(--hp-color-neutral-500);
        margin: 0;
      }

      &__form {
        max-width: 480px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-5);
      }

      &__row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-4);
        justify-content: space-between;
        margin-top: var(--hp-spacing-4);
      }

      a {
        color: var(--hp-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepAccountComponent {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService
  ) {
    const savedData = this.onboardingService.data.account;

    this.form = this.fb.group({
      firstName: [savedData?.firstName || '', [Validators.required]],
      lastName: [savedData?.lastName || '', [Validators.required]],
      email: [savedData?.email || '', [Validators.required, Validators.email]],
      phone: [savedData?.phone || '', [Validators.required]],
      password: [savedData?.password || '', [Validators.required, Validators.minLength(8)]],
      termsAccepted: [savedData?.termsAccepted || false, [Validators.requiredTrue]]
    });
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['minlength']) return 'Password must be at least 8 characters';
    return '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.onboardingService.updateData({ account: this.form.value });
      this.next.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
