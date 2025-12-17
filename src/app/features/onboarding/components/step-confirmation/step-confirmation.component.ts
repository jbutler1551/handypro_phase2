import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'hp-step-confirmation',
  template: `
    <div class="hp-step-confirmation">
      <div class="hp-step-confirmation__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h2 class="hp-step-confirmation__title">You're all set!</h2>
      <p class="hp-step-confirmation__description">
        Your account has been created and your 14-day free trial has started.
      </p>

      <!-- Summary -->
      <div class="hp-step-confirmation__summary">
        <div class="hp-step-confirmation__summary-item">
          <span class="hp-step-confirmation__summary-label">Account</span>
          <span class="hp-step-confirmation__summary-value">{{ accountEmail }}</span>
        </div>
        <div class="hp-step-confirmation__summary-item">
          <span class="hp-step-confirmation__summary-label">Company</span>
          <span class="hp-step-confirmation__summary-value">{{ companyName }}</span>
        </div>
        <div class="hp-step-confirmation__summary-item">
          <span class="hp-step-confirmation__summary-label">Plan</span>
          <span class="hp-step-confirmation__summary-value">{{ planName }} ({{ billingCycle }})</span>
        </div>
        <div class="hp-step-confirmation__summary-item">
          <span class="hp-step-confirmation__summary-label">Trial ends</span>
          <span class="hp-step-confirmation__summary-value">{{ trialEndDate }}</span>
        </div>
      </div>

      <!-- What's Next -->
      <div class="hp-step-confirmation__next-steps">
        <h3 class="hp-step-confirmation__next-title">What's next?</h3>
        <ul class="hp-step-confirmation__next-list">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Complete your company profile
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Add your first customer
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Create your first job
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Download the mobile app
          </li>
        </ul>
      </div>

      <div class="hp-step-confirmation__actions">
        <hp-button
          variant="primary"
          size="lg"
          [fullWidth]="true"
          [loading]="isLoading"
          (click)="onComplete()"
        >
          Go to Dashboard
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-step-confirmation {
      text-align: center;
      max-width: 480px;
      margin: 0 auto;

      &__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        margin-bottom: var(--hp-spacing-6);
        background-color: var(--hp-color-success-50);
        border-radius: 50%;

        svg {
          width: 40px;
          height: 40px;
          color: var(--hp-color-success);
        }
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
        margin: 0 0 var(--hp-spacing-8);
      }

      &__summary {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-lg);
        margin-bottom: var(--hp-spacing-8);
        text-align: left;
      }

      &__summary-item {
        display: flex;
        justify-content: space-between;
        padding: var(--hp-spacing-3) 0;

        &:not(:last-child) {
          border-bottom: 1px solid var(--hp-color-neutral-200);
        }
      }

      &__summary-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
      }

      &__summary-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__next-steps {
        text-align: left;
        margin-bottom: var(--hp-spacing-8);
      }

      &__next-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__next-list {
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-3);
          padding: var(--hp-spacing-2) 0;
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-700);

          svg {
            width: 18px;
            height: 18px;
            color: var(--hp-color-primary);
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepConfirmationComponent {
  @Output() complete = new EventEmitter<void>();

  isLoading = false;

  constructor(
    private onboardingService: OnboardingService,
    private cdr: ChangeDetectorRef
  ) {}

  get accountEmail(): string {
    return this.onboardingService.data.account?.email || '';
  }

  get companyName(): string {
    return this.onboardingService.data.company?.companyName || '';
  }

  get planName(): string {
    return this.onboardingService.getSelectedPlan()?.name || '';
  }

  get billingCycle(): string {
    return this.onboardingService.data.billingCycle || 'annual';
  }

  get trialEndDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  onComplete(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.complete.emit();
  }
}
