import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OnboardingService } from '../../services/onboarding.service';
import { SubscriptionPlan } from '@core/models';

@Component({
  selector: 'hp-step-plan',
  template: `
    <div class="hp-step-plan">
      <div class="hp-step-plan__header">
        <h2 class="hp-step-plan__title">Choose your plan</h2>
        <p class="hp-step-plan__description">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      <!-- Billing Toggle -->
      <div class="hp-step-plan__billing-toggle">
        <span [class.hp-step-plan__billing-option--active]="billingCycle === 'monthly'">Monthly</span>
        <label class="hp-step-plan__toggle">
          <input
            type="checkbox"
            [checked]="billingCycle === 'annual'"
            (change)="toggleBilling()"
          />
          <span class="hp-step-plan__toggle-slider"></span>
        </label>
        <span [class.hp-step-plan__billing-option--active]="billingCycle === 'annual'">
          Annual
          <hp-badge variant="success" size="sm">Save 20%</hp-badge>
        </span>
      </div>

      <!-- Plans Grid -->
      <div class="hp-step-plan__grid">
        <div
          *ngFor="let plan of plans"
          class="hp-step-plan__card"
          [class.hp-step-plan__card--selected]="selectedPlanId === plan.id"
          [class.hp-step-plan__card--popular]="plan.tier === 'professional'"
          (click)="selectPlan(plan)"
        >
          <div *ngIf="plan.tier === 'professional'" class="hp-step-plan__popular-badge">
            Most Popular
          </div>

          <h3 class="hp-step-plan__plan-name">{{ plan.name }}</h3>

          <div class="hp-step-plan__price">
            <span class="hp-step-plan__price-amount">
              \${{ billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice }}
            </span>
            <span class="hp-step-plan__price-period">/month</span>
          </div>

          <p *ngIf="billingCycle === 'annual'" class="hp-step-plan__annual-note">
            Billed annually (\${{ plan.annualPrice * 12 }}/year)
          </p>

          <ul class="hp-step-plan__features">
            <li *ngFor="let feature of plan.features" [class.hp-step-plan__feature--included]="feature.included">
              <svg *ngIf="feature.included" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg *ngIf="!feature.included" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              {{ feature.name }}
            </li>
          </ul>

          <div class="hp-step-plan__limits">
            <span>{{ plan.limits.adminSeats }} admin seats</span>
            <span>{{ plan.limits.technicianSeats }} technicians</span>
            <span>{{ plan.limits.storageGb }}GB storage</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="hp-step-plan__actions">
        <hp-button
          variant="primary"
          [fullWidth]="true"
          [disabled]="!selectedPlanId"
          (click)="onContinue()"
        >
          Continue with {{ selectedPlan?.name || 'selected plan' }}
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-step-plan {
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

      &__billing-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-8);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
      }

      &__billing-option--active {
        color: var(--hp-color-neutral-900);
        font-weight: var(--hp-font-weight-medium);
      }

      &__toggle {
        position: relative;
        width: 44px;
        height: 24px;

        input {
          opacity: 0;
          width: 0;
          height: 0;

          &:checked + .hp-step-plan__toggle-slider {
            background-color: var(--hp-color-primary);

            &::before {
              transform: translateX(20px);
            }
          }
        }
      }

      &__toggle-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background-color: var(--hp-color-neutral-300);
        border-radius: 12px;
        transition: 150ms;

        &::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: 150ms;
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-6);
        margin-bottom: var(--hp-spacing-8);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      &__card {
        position: relative;
        padding: var(--hp-spacing-6);
        background-color: var(--hp-color-neutral-0);
        border: 2px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-lg);
        cursor: pointer;
        transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;

        &:hover {
          border-color: var(--hp-color-neutral-300);
        }

        &--selected {
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 4px var(--hp-color-primary-100);
        }

        &--popular {
          border-color: var(--hp-color-primary-200);
        }
      }

      &__popular-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        padding: var(--hp-spacing-1) var(--hp-spacing-3);
        background-color: var(--hp-color-primary);
        color: white;
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        border-radius: var(--hp-radius-full);
        white-space: nowrap;
      }

      &__plan-name {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__price {
        margin-bottom: var(--hp-spacing-1);
      }

      &__price-amount {
        font-size: var(--hp-font-size-3xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
      }

      &__price-period {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
      }

      &__annual-note {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__features {
        list-style: none;
        margin: var(--hp-spacing-4) 0;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
          margin-bottom: var(--hp-spacing-2);

          svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
        }
      }

      &__feature--included {
        color: var(--hp-color-neutral-700);

        svg {
          color: var(--hp-color-success);
        }
      }

      &__limits {
        display: flex;
        flex-wrap: wrap;
        gap: var(--hp-spacing-2);
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-200);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);

        span {
          padding: var(--hp-spacing-1) var(--hp-spacing-2);
          background-color: var(--hp-color-neutral-100);
          border-radius: var(--hp-radius-sm);
        }
      }

      &__actions {
        max-width: 400px;
        margin: 0 auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepPlanComponent {
  @Output() next = new EventEmitter<void>();

  plans: SubscriptionPlan[];
  selectedPlanId: string | undefined;
  billingCycle: 'monthly' | 'annual' = 'annual';

  constructor(private onboardingService: OnboardingService) {
    this.plans = this.onboardingService.plans;
    this.selectedPlanId = this.onboardingService.data.planId;
    this.billingCycle = this.onboardingService.data.billingCycle || 'annual';
  }

  get selectedPlan(): SubscriptionPlan | undefined {
    return this.plans.find(p => p.id === this.selectedPlanId);
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlanId = plan.id;
  }

  toggleBilling(): void {
    this.billingCycle = this.billingCycle === 'monthly' ? 'annual' : 'monthly';
  }

  onContinue(): void {
    if (this.selectedPlanId) {
      this.onboardingService.updateData({
        planId: this.selectedPlanId,
        billingCycle: this.billingCycle
      });
      this.next.emit();
    }
  }
}
