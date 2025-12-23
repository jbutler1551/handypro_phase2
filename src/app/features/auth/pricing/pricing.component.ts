import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

@Component({
  selector: 'hp-pricing',
  template: `
    <div class="hp-pricing">
      <div class="hp-pricing__header">
        <a routerLink="/auth/login" class="hp-pricing__back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Login
        </a>
        <h1 class="hp-pricing__title">Choose Your Plan</h1>
        <p class="hp-pricing__subtitle">
          Simple, transparent pricing. Start with a 14-day free trial, no credit card required.
        </p>
      </div>

      <div class="hp-pricing__grid">
        <div
          *ngFor="let tier of tiers"
          class="hp-pricing__card"
          [class.hp-pricing__card--highlighted]="tier.highlighted"
        >
          <hp-badge *ngIf="tier.badge" variant="primary" class="hp-pricing__badge">
            {{ tier.badge }}
          </hp-badge>
          <div class="hp-pricing__card-header">
            <h3 class="hp-pricing__plan-name">{{ tier.name }}</h3>
            <div class="hp-pricing__price">
              <span class="hp-pricing__currency">$</span>
              <span class="hp-pricing__amount">{{ tier.price }}</span>
              <span class="hp-pricing__period">/month</span>
            </div>
            <p class="hp-pricing__description">{{ tier.description }}</p>
          </div>
          <ul class="hp-pricing__features">
            <li *ngFor="let feature of tier.features" class="hp-pricing__feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {{ feature }}
            </li>
          </ul>
          <hp-button
            [variant]="tier.highlighted ? 'primary' : 'outline'"
            [fullWidth]="true"
            (click)="selectPlan(tier)"
          >
            Start Free Trial
          </hp-button>
        </div>
      </div>

      <div class="hp-pricing__footer">
        <p class="hp-pricing__guarantee">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          30-day money-back guarantee on all plans
        </p>
        <div class="hp-pricing__comparison-link">
          <a (click)="scrollToComparison()">View full feature comparison</a>
        </div>
      </div>

      <div class="hp-pricing__comparison" id="comparison">
        <h2 class="hp-pricing__comparison-title">Feature Comparison</h2>
        <div class="hp-pricing__comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Starter</th>
                <th>Professional</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of comparisonData">
                <td>{{ row.feature }}</td>
                <td [class.hp-pricing__check]="row.starter === true" [class.hp-pricing__limit]="isString(row.starter)">
                  <ng-container *ngIf="row.starter === true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </ng-container>
                  <ng-container *ngIf="row.starter === false">-</ng-container>
                  <ng-container *ngIf="isString(row.starter)">{{ row.starter }}</ng-container>
                </td>
                <td [class.hp-pricing__check]="row.professional === true" [class.hp-pricing__limit]="isString(row.professional)">
                  <ng-container *ngIf="row.professional === true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </ng-container>
                  <ng-container *ngIf="row.professional === false">-</ng-container>
                  <ng-container *ngIf="isString(row.professional)">{{ row.professional }}</ng-container>
                </td>
                <td [class.hp-pricing__check]="row.enterprise === true" [class.hp-pricing__limit]="isString(row.enterprise)">
                  <ng-container *ngIf="row.enterprise === true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </ng-container>
                  <ng-container *ngIf="row.enterprise === false">-</ng-container>
                  <ng-container *ngIf="isString(row.enterprise)">{{ row.enterprise }}</ng-container>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-pricing {
      padding: var(--hp-spacing-8);
      max-width: 1200px;
      margin: 0 auto;

      &__header {
        text-align: center;
        margin-bottom: var(--hp-spacing-10);
      }

      &__back {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        color: var(--hp-text-secondary);
        text-decoration: none;
        font-size: var(--hp-font-size-sm);
        margin-bottom: var(--hp-spacing-6);

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          color: var(--hp-color-primary);
        }
      }

      &__title {
        font-size: var(--hp-font-size-3xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin-bottom: var(--hp-spacing-3);
      }

      &__subtitle {
        font-size: var(--hp-font-size-lg);
        color: var(--hp-text-secondary);
        max-width: 500px;
        margin: 0 auto;
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--hp-spacing-6);
        margin-bottom: var(--hp-spacing-10);
      }

      &__card {
        position: relative;
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-lg);
        padding: var(--hp-spacing-8);
        display: flex;
        flex-direction: column;
        transition: transform 200ms ease, box-shadow 200ms ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--hp-shadow-xl);
        }

        &--highlighted {
          border-color: var(--hp-color-primary);
          box-shadow: var(--hp-glow-primary-subtle);

          &:hover {
            box-shadow: var(--hp-shadow-xl), var(--hp-glow-primary);
          }
        }
      }

      &__badge {
        position: absolute;
        top: calc(-1 * var(--hp-spacing-3));
        left: 50%;
        transform: translateX(-50%);
      }

      &__card-header {
        text-align: center;
        margin-bottom: var(--hp-spacing-6);
        padding-bottom: var(--hp-spacing-6);
        border-bottom: 1px solid var(--hp-glass-border);
      }

      &__plan-name {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin-bottom: var(--hp-spacing-4);
      }

      &__price {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--hp-spacing-1);
        margin-bottom: var(--hp-spacing-3);
      }

      &__currency {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
      }

      &__amount {
        font-size: var(--hp-font-size-4xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__period {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__description {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__features {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--hp-spacing-8);
        flex: 1;
      }

      &__feature {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-2) 0;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);

        svg {
          width: 18px;
          height: 18px;
          color: var(--hp-color-success);
          flex-shrink: 0;
          margin-top: 1px;
        }
      }

      &__footer {
        text-align: center;
        margin-bottom: var(--hp-spacing-12);
      }

      &__guarantee {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin-bottom: var(--hp-spacing-4);

        svg {
          width: 18px;
          height: 18px;
          color: var(--hp-color-success);
        }
      }

      &__comparison-link a {
        color: var(--hp-color-primary);
        text-decoration: none;
        font-size: var(--hp-font-size-sm);
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

      &__comparison {
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-lg);
        padding: var(--hp-spacing-8);
      }

      &__comparison-title {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        text-align: center;
        margin-bottom: var(--hp-spacing-6);
      }

      &__comparison-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: var(--hp-spacing-3) var(--hp-spacing-4);
          text-align: left;
          border-bottom: 1px solid var(--hp-glass-border);
        }

        th {
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-text-primary);
          font-size: var(--hp-font-size-sm);

          &:not(:first-child) {
            text-align: center;
          }
        }

        td {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-secondary);

          &:not(:first-child) {
            text-align: center;
          }
        }
      }

      &__check svg {
        width: 18px;
        height: 18px;
        color: var(--hp-color-success);
        display: inline-block;
      }

      &__limit {
        color: var(--hp-text-primary);
        font-weight: var(--hp-font-weight-medium);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingComponent {
  tiers: PricingTier[] = [
    {
      name: 'Starter',
      price: 99,
      description: 'Perfect for small franchises just getting started',
      features: [
        'Up to 5 franchise locations',
        'Basic compliance tracking',
        'Document storage (5GB)',
        'Email support',
        'Standard reporting',
        'Mobile app access'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      price: 299,
      description: 'For growing businesses with multiple locations',
      features: [
        'Up to 25 franchise locations',
        'Advanced compliance automation',
        'Document storage (50GB)',
        'Priority support',
        'Custom reporting',
        'API access',
        'White-label options',
        'Audit trail'
      ],
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: 799,
      description: 'Full platform for large franchise operations',
      features: [
        'Unlimited franchise locations',
        'Full compliance suite',
        'Unlimited storage',
        'Dedicated account manager',
        'Custom integrations',
        'SSO/SAML support',
        'Custom domain',
        'SLA guarantee',
        'On-premise option'
      ],
      highlighted: false
    }
  ];

  comparisonData = [
    { feature: 'Franchise Locations', starter: '5', professional: '25', enterprise: 'Unlimited' },
    { feature: 'Document Storage', starter: '5 GB', professional: '50 GB', enterprise: 'Unlimited' },
    { feature: 'Team Members', starter: '10', professional: '50', enterprise: 'Unlimited' },
    { feature: 'Compliance Tracking', starter: true, professional: true, enterprise: true },
    { feature: 'Audit Trail', starter: false, professional: true, enterprise: true },
    { feature: 'API Access', starter: false, professional: true, enterprise: true },
    { feature: 'White-label Branding', starter: false, professional: true, enterprise: true },
    { feature: 'Custom Domain', starter: false, professional: false, enterprise: true },
    { feature: 'SSO/SAML', starter: false, professional: false, enterprise: true },
    { feature: 'Priority Support', starter: false, professional: true, enterprise: true },
    { feature: 'Dedicated Account Manager', starter: false, professional: false, enterprise: true },
    { feature: 'Custom Integrations', starter: false, professional: false, enterprise: true },
    { feature: 'SLA Guarantee', starter: false, professional: false, enterprise: true }
  ];

  constructor(private router: Router) {}

  selectPlan(tier: PricingTier): void {
    this.router.navigate(['/onboarding'], { queryParams: { plan: tier.name.toLowerCase() } });
  }

  scrollToComparison(): void {
    document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' });
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }
}
