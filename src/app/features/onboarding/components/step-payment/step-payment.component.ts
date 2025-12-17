import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OnboardingService } from '../../services/onboarding.service';
import { SubscriptionPlan } from '@core/models';

@Component({
  selector: 'hp-step-payment',
  template: `
    <div class="hp-step-payment">
      <div class="hp-step-payment__header">
        <h2 class="hp-step-payment__title">Start your free trial</h2>
        <p class="hp-step-payment__description">
          Add a payment method. You won't be charged until your 14-day trial ends.
        </p>
      </div>

      <!-- Order Summary -->
      <div class="hp-step-payment__summary">
        <h3 class="hp-step-payment__summary-title">Order Summary</h3>
        <div class="hp-step-payment__plan">
          <span class="hp-step-payment__plan-name">{{ selectedPlan?.name }} Plan</span>
          <span class="hp-step-payment__plan-price">
            \${{ billingCycle === 'annual' ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice }}/mo
          </span>
        </div>
        <div class="hp-step-payment__billing">
          <span>Billed {{ billingCycle }}</span>
        </div>
        <div class="hp-step-payment__trial">
          <hp-badge variant="success">14-day free trial</hp-badge>
        </div>
        <div class="hp-step-payment__total">
          <span>Due today</span>
          <span class="hp-step-payment__total-amount">\$0.00</span>
        </div>
      </div>

      <!-- Card Form Placeholder -->
      <div class="hp-step-payment__card-form">
        <div class="hp-step-payment__card-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <p>Secure payment powered by Stripe</p>
          <p class="hp-step-payment__card-note">
            For this demo, click Continue to proceed without entering card details.
          </p>
        </div>
      </div>

      <!-- Guarantees -->
      <div class="hp-step-payment__guarantees">
        <div class="hp-step-payment__guarantee">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>256-bit SSL encryption</span>
        </div>
        <div class="hp-step-payment__guarantee">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Cancel anytime</span>
        </div>
        <div class="hp-step-payment__guarantee">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>30-day money back guarantee</span>
        </div>
      </div>

      <div class="hp-step-payment__actions">
        <hp-button variant="outline" (click)="onBack()">
          Back
        </hp-button>
        <hp-button variant="primary" (click)="onContinue()">
          Start Free Trial
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-step-payment {
      max-width: 480px;
      margin: 0 auto;

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

      &__summary {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-lg);
        margin-bottom: var(--hp-spacing-6);
      }

      &__summary-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-700);
        margin: 0 0 var(--hp-spacing-4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__plan {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-2);
      }

      &__plan-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__plan-price {
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
      }

      &__billing {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        margin-bottom: var(--hp-spacing-3);
      }

      &__trial {
        margin-bottom: var(--hp-spacing-4);
      }

      &__total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-200);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__total-amount {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-success);
      }

      &__card-form {
        margin-bottom: var(--hp-spacing-6);
      }

      &__card-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-8);
        background-color: var(--hp-color-neutral-100);
        border: 2px dashed var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-lg);
        text-align: center;

        svg {
          width: 48px;
          height: 48px;
          color: var(--hp-color-neutral-400);
          margin-bottom: var(--hp-spacing-4);
        }

        p {
          color: var(--hp-color-neutral-600);
          margin: 0;
        }
      }

      &__card-note {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500) !important;
        margin-top: var(--hp-spacing-2) !important;
      }

      &__guarantees {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-8);
      }

      &__guarantee {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-600);

        svg {
          width: 16px;
          height: 16px;
          color: var(--hp-color-success);
        }
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-4);
        justify-content: space-between;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepPaymentComponent {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  selectedPlan: SubscriptionPlan | undefined;
  billingCycle: 'monthly' | 'annual';

  constructor(private onboardingService: OnboardingService) {
    this.selectedPlan = this.onboardingService.getSelectedPlan();
    this.billingCycle = this.onboardingService.data.billingCycle || 'annual';
  }

  onContinue(): void {
    this.onboardingService.updateData({
      payment: {
        cardComplete: true,
        billingAddress: {
          line1: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US'
        }
      }
    });
    this.next.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
