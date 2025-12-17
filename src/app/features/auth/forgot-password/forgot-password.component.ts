import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'hp-forgot-password',
  template: `
    <div class="hp-forgot-password">
      <div class="hp-forgot-password__header">
        <h1 class="hp-forgot-password__title">Forgot your password?</h1>
        <p class="hp-forgot-password__subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <hp-alert *ngIf="successMessage" variant="success">
        {{ successMessage }}
      </hp-alert>

      <hp-alert *ngIf="errorMessage" variant="error" [dismissible]="true" (dismiss)="errorMessage = ''">
        {{ errorMessage }}
      </hp-alert>

      <form *ngIf="!successMessage" [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="hp-forgot-password__form">
        <hp-input
          label="Email address"
          type="email"
          formControlName="email"
          placeholder="you@example.com"
          [error]="getFieldError('email')"
          autocomplete="email"
        ></hp-input>

        <hp-button
          type="submit"
          variant="primary"
          [fullWidth]="true"
          [loading]="isLoading"
          [disabled]="forgotForm.invalid || isLoading"
        >
          Send reset link
        </hp-button>
      </form>

      <div class="hp-forgot-password__back">
        <a routerLink="/auth/login" class="hp-forgot-password__back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to sign in
        </a>
      </div>
    </div>
  `,
  styles: [`
    .hp-forgot-password {
      &__header {
        text-align: center;
        margin-bottom: var(--hp-spacing-8);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-2);
        transition: color 200ms ease-in-out;
      }

      &__subtitle {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-tertiary);
        margin: 0;
        max-width: 320px;
        margin-left: auto;
        margin-right: auto;
        transition: color 200ms ease-in-out;
      }

      &__form {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-5);
      }

      &__back {
        margin-top: var(--hp-spacing-8);
        text-align: center;
      }

      &__back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        text-decoration: none;
        font-weight: var(--hp-font-weight-medium);
        transition: color 150ms ease-in-out;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          color: var(--hp-color-primary);
        }
      }
    }

    hp-alert {
      display: block;
      margin-bottom: var(--hp-spacing-6);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email } = this.forgotForm.value;

    this.authService.forgotPassword(email)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.successMessage = `We've sent a password reset link to ${email}. Please check your inbox.`;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Something went wrong. Please try again.';
        }
      });
  }

  getFieldError(fieldName: string): string {
    const control = this.forgotForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Email is required';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}
