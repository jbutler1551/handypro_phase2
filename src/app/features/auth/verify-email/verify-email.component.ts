import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'hp-verify-email',
  template: `
    <div class="hp-verify-email">
      <div class="hp-verify-email__icon" [class.hp-verify-email__icon--success]="isVerified" [class.hp-verify-email__icon--error]="hasError">
        <svg *ngIf="!isVerified && !hasError" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <svg *ngIf="isVerified" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg *ngIf="hasError" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>

      <ng-container *ngIf="!isVerified && !hasError">
        <h1 class="hp-verify-email__title">Check your email</h1>
        <p class="hp-verify-email__message">
          We've sent a verification link to<br />
          <strong>{{ email }}</strong>
        </p>
        <p class="hp-verify-email__hint">
          Click the link in the email to verify your account and continue setup.
        </p>

        <div class="hp-verify-email__actions">
          <hp-button variant="outline" (click)="resendEmail()" [loading]="isResending" [disabled]="resendCooldown > 0">
            <ng-container *ngIf="resendCooldown === 0">Resend email</ng-container>
            <ng-container *ngIf="resendCooldown > 0">Resend in {{ resendCooldown }}s</ng-container>
          </hp-button>
        </div>

        <hp-alert *ngIf="resendSuccess" variant="success" [dismissible]="true" (dismiss)="resendSuccess = false">
          Verification email sent successfully!
        </hp-alert>
      </ng-container>

      <ng-container *ngIf="isVerified">
        <h1 class="hp-verify-email__title">Email verified!</h1>
        <p class="hp-verify-email__message">
          Your email has been successfully verified.
        </p>
        <div class="hp-verify-email__actions">
          <hp-button variant="primary" (click)="continueToApp()">
            Continue to Dashboard
          </hp-button>
        </div>
      </ng-container>

      <ng-container *ngIf="hasError">
        <h1 class="hp-verify-email__title">Verification failed</h1>
        <p class="hp-verify-email__message">
          {{ errorMessage }}
        </p>
        <div class="hp-verify-email__actions">
          <hp-button variant="primary" (click)="resendEmail()" [loading]="isResending">
            Send new verification link
          </hp-button>
          <hp-button variant="outline" routerLink="/auth/login">
            Back to login
          </hp-button>
        </div>
      </ng-container>

      <div class="hp-verify-email__footer">
        <p>
          Wrong email? <a routerLink="/auth/login">Sign in with a different account</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .hp-verify-email {
      text-align: center;
      max-width: 400px;
      margin: 0 auto;

      &__icon {
        width: 80px;
        height: 80px;
        margin: 0 auto var(--hp-spacing-6);
        background: var(--hp-glass-bg);
        border-radius: var(--hp-radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--hp-glass-border);

        svg {
          width: 40px;
          height: 40px;
          color: var(--hp-color-primary);
        }

        &--success {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--hp-color-success);

          svg {
            color: var(--hp-color-success);
          }
        }

        &--error {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--hp-color-error);

          svg {
            color: var(--hp-color-error);
          }
        }
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-3);
      }

      &__message {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-secondary);
        margin: 0 0 var(--hp-spacing-2);
        line-height: 1.6;

        strong {
          color: var(--hp-text-primary);
        }
      }

      &__hint {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        margin: 0 0 var(--hp-spacing-6);
      }

      &__actions {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-6);
      }

      &__footer {
        padding-top: var(--hp-spacing-6);
        border-top: 1px solid var(--hp-glass-border);

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-tertiary);
          margin: 0;
        }

        a {
          color: var(--hp-color-primary);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    hp-alert {
      display: block;
      margin-bottom: var(--hp-spacing-4);
      text-align: left;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyEmailComponent implements OnInit {
  email = 'user@example.com';
  isVerified = false;
  hasError = false;
  errorMessage = '';
  isResending = false;
  resendSuccess = false;
  resendCooldown = 0;

  private cooldownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
      if (params['token']) {
        this.verifyToken(params['token']);
      }
    });
  }

  verifyToken(token: string): void {
    // Mock verification - in production this would call an API
    setTimeout(() => {
      if (token === 'valid') {
        this.isVerified = true;
      } else if (token === 'expired') {
        this.hasError = true;
        this.errorMessage = 'This verification link has expired. Please request a new one.';
      } else if (token === 'invalid') {
        this.hasError = true;
        this.errorMessage = 'This verification link is invalid. Please check your email or request a new link.';
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  resendEmail(): void {
    if (this.resendCooldown > 0) return;

    this.isResending = true;
    this.resendSuccess = false;

    // Mock API call
    setTimeout(() => {
      this.isResending = false;
      this.resendSuccess = true;
      this.hasError = false;
      this.startCooldown();
      this.cdr.markForCheck();
    }, 1500);
  }

  startCooldown(): void {
    this.resendCooldown = 60;
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  continueToApp(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }
}
