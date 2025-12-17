import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'hp-login',
  template: `
    <div class="hp-login">
      <div class="hp-login__header">
        <h1 class="hp-login__title">Welcome back</h1>
        <p class="hp-login__subtitle">Sign in to your account to continue</p>
      </div>

      <hp-alert *ngIf="errorMessage" variant="error" [dismissible]="true" (dismiss)="errorMessage = ''">
        {{ errorMessage }}
      </hp-alert>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="hp-login__form">
        <hp-input
          label="Email address"
          type="email"
          formControlName="email"
          placeholder="you@example.com"
          [error]="getFieldError('email')"
          autocomplete="email"
        ></hp-input>

        <hp-input
          label="Password"
          type="password"
          formControlName="password"
          placeholder="Enter your password"
          [error]="getFieldError('password')"
          autocomplete="current-password"
        ></hp-input>

        <div class="hp-login__options">
          <hp-checkbox formControlName="rememberMe">
            Remember me
          </hp-checkbox>
          <a routerLink="/auth/forgot-password" class="hp-login__forgot">
            Forgot password?
          </a>
        </div>

        <hp-button
          type="submit"
          variant="primary"
          [fullWidth]="true"
          [loading]="isLoading"
          [disabled]="loginForm.invalid || isLoading"
        >
          Sign in
        </hp-button>
      </form>

      <div class="hp-login__divider">
        <hp-divider text="or"></hp-divider>
      </div>

      <div class="hp-login__signup">
        <p>Don't have an account?</p>
        <a routerLink="/onboarding" class="hp-login__signup-link">
          Start your free trial
        </a>
      </div>
    </div>
  `,
  styles: [`
    .hp-login {
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

      &__options {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      &__forgot {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-primary);
        text-decoration: none;
        font-weight: var(--hp-font-weight-medium);
        transition: color var(--hp-micro-normal) ease-in-out,
                    text-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          color: var(--hp-color-primary-600);
          text-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
        }
      }

      &__divider {
        margin: var(--hp-spacing-8) 0;
      }

      &__signup {
        text-align: center;

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-tertiary);
          margin: 0 0 var(--hp-spacing-2);
          transition: color 200ms ease-in-out;
        }
      }

      &__signup-link {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-primary);
        text-decoration: none;
        font-weight: var(--hp-font-weight-semibold);
        transition: color var(--hp-micro-normal) ease-in-out,
                    text-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          color: var(--hp-color-primary-600);
          text-shadow: 0 0 10px rgba(33, 150, 243, 0.4);
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
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password, rememberMe })
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Invalid email or password. Please try again.';
        }
      });
  }

  getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${fieldName === 'email' ? 'Email' : 'Password'} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }
}
