import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'hp-reset-password',
  template: `
    <div class="hp-reset-password">
      <div class="hp-reset-password__header">
        <h1 class="hp-reset-password__title">Reset your password</h1>
        <p class="hp-reset-password__subtitle">
          Enter your new password below.
        </p>
      </div>

      <hp-alert *ngIf="successMessage" variant="success">
        {{ successMessage }}
        <br><br>
        <a routerLink="/auth/login" class="hp-reset-password__login-link">Sign in with your new password</a>
      </hp-alert>

      <hp-alert *ngIf="errorMessage" variant="error" [dismissible]="true" (dismiss)="errorMessage = ''">
        {{ errorMessage }}
      </hp-alert>

      <form *ngIf="!successMessage" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="hp-reset-password__form">
        <hp-input
          label="New password"
          type="password"
          formControlName="password"
          placeholder="Enter new password"
          [error]="getFieldError('password')"
          autocomplete="new-password"
        ></hp-input>

        <hp-input
          label="Confirm password"
          type="password"
          formControlName="confirmPassword"
          placeholder="Confirm new password"
          [error]="getFieldError('confirmPassword')"
          autocomplete="new-password"
        ></hp-input>

        <div class="hp-reset-password__requirements">
          <p class="hp-reset-password__requirements-title">Password requirements:</p>
          <ul class="hp-reset-password__requirements-list">
            <li [class.hp-reset-password__requirement--met]="hasMinLength">
              At least 8 characters
            </li>
            <li [class.hp-reset-password__requirement--met]="hasUppercase">
              One uppercase letter
            </li>
            <li [class.hp-reset-password__requirement--met]="hasLowercase">
              One lowercase letter
            </li>
            <li [class.hp-reset-password__requirement--met]="hasNumber">
              One number
            </li>
          </ul>
        </div>

        <hp-button
          type="submit"
          variant="primary"
          [fullWidth]="true"
          [loading]="isLoading"
          [disabled]="resetForm.invalid || isLoading"
        >
          Reset password
        </hp-button>
      </form>

      <div class="hp-reset-password__back">
        <a routerLink="/auth/login" class="hp-reset-password__back-link">
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
    .hp-reset-password {
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
        transition: color 200ms ease-in-out;
      }

      &__form {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-5);
      }

      &__requirements {
        padding: var(--hp-spacing-4);
        background-color: var(--hp-bg-tertiary);
        border-radius: var(--hp-radius-md);
        transition: background-color 200ms ease-in-out;
      }

      &__requirements-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        margin: 0 0 var(--hp-spacing-2);
        transition: color 200ms ease-in-out;
      }

      &__requirements-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-2);

        li {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-tertiary);
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          transition: color 200ms ease-in-out;

          &::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--hp-text-disabled);
            flex-shrink: 0;
            transition: background-color 200ms ease-in-out;
          }
        }
      }

      &__requirement--met {
        color: var(--hp-color-success) !important;

        &::before {
          background-color: var(--hp-color-success) !important;
        }
      }

      &__login-link {
        color: var(--hp-color-primary);
        text-decoration: none;
        font-weight: var(--hp-font-weight-medium);

        &:hover {
          text-decoration: underline;
        }
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
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token. Please request a new password reset link.';
    }
  }

  get hasMinLength(): boolean {
    return this.resetForm.get('password')?.value?.length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.resetForm.get('password')?.value || '');
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.resetForm.get('password')?.value || '');
  }

  get hasNumber(): boolean {
    return /\d/.test(this.resetForm.get('password')?.value || '');
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Your password has been reset successfully!';
        },
        error: (error) => {
          this.errorMessage = error.message || 'Something went wrong. Please try again.';
        }
      });
  }

  getFieldError(fieldName: string): string {
    const control = this.resetForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return fieldName === 'password' ? 'Password is required' : 'Please confirm your password';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 8 characters';
    }
    if (control.errors['passwordStrength']) {
      return 'Password must contain uppercase, lowercase, and a number';
    }

    // Check form-level errors for password match
    if (fieldName === 'confirmPassword' && this.resetForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return '';
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return { passwordStrength: true };
    }
    return null;
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
