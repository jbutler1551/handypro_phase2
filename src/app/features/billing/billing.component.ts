import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SubscriptionPlan, Invoice, PaymentMethod } from '@core/models';

@Component({
  selector: 'hp-billing',
  template: `
    <div class="hp-billing">
      <div class="hp-billing__header">
        <h1 class="hp-billing__title">Billing & Subscription</h1>
        <p class="hp-billing__subtitle">Manage your subscription and payment methods</p>
      </div>

      <!-- Current Plan -->
      <hp-card class="hp-billing__plan-card">
        <div class="hp-billing__plan-header">
          <div class="hp-billing__plan-info">
            <hp-badge variant="primary">Current Plan</hp-badge>
            <h2 class="hp-billing__plan-name">{{ currentPlan.name }}</h2>
            <p class="hp-billing__plan-price">
              \${{ currentPlan.monthlyPrice }}<span>/month</span>
            </p>
          </div>
          <div class="hp-billing__plan-actions">
            <hp-button variant="outline" size="sm">Change Plan</hp-button>
          </div>
        </div>

        <div class="hp-billing__plan-details">
          <div class="hp-billing__plan-detail">
            <span class="hp-billing__plan-label">Billing period</span>
            <span class="hp-billing__plan-value">Monthly</span>
          </div>
          <div class="hp-billing__plan-detail">
            <span class="hp-billing__plan-label">Next billing date</span>
            <span class="hp-billing__plan-value">January 15, 2025</span>
          </div>
          <div class="hp-billing__plan-detail">
            <span class="hp-billing__plan-label">Status</span>
            <hp-badge variant="success">Active</hp-badge>
          </div>
        </div>

        <div class="hp-billing__usage">
          <h3 class="hp-billing__usage-title">Usage This Month</h3>
          <div class="hp-billing__usage-grid">
            <div class="hp-billing__usage-item">
              <span class="hp-billing__usage-label">Admin Seats</span>
              <span class="hp-billing__usage-value">2 / {{ currentPlan.limits.adminSeats }}</span>
              <div class="hp-billing__progress">
                <div class="hp-billing__progress-bar" [style.width.%]="(2 / currentPlan.limits.adminSeats) * 100"></div>
              </div>
            </div>
            <div class="hp-billing__usage-item">
              <span class="hp-billing__usage-label">Technicians</span>
              <span class="hp-billing__usage-value">1 / {{ currentPlan.limits.technicianSeats }}</span>
              <div class="hp-billing__progress">
                <div class="hp-billing__progress-bar" [style.width.%]="(1 / currentPlan.limits.technicianSeats) * 100"></div>
              </div>
            </div>
            <div class="hp-billing__usage-item">
              <span class="hp-billing__usage-label">SMS Credits</span>
              <span class="hp-billing__usage-value">245 / {{ currentPlan.limits.smsCredits }}</span>
              <div class="hp-billing__progress">
                <div class="hp-billing__progress-bar" [style.width.%]="(245 / currentPlan.limits.smsCredits) * 100"></div>
              </div>
            </div>
            <div class="hp-billing__usage-item">
              <span class="hp-billing__usage-label">Storage</span>
              <span class="hp-billing__usage-value">2.5 GB / {{ currentPlan.limits.storageGb }} GB</span>
              <div class="hp-billing__progress">
                <div class="hp-billing__progress-bar" [style.width.%]="(2.5 / currentPlan.limits.storageGb) * 100"></div>
              </div>
            </div>
          </div>
        </div>
      </hp-card>

      <div class="hp-billing__grid">
        <!-- Payment Method -->
        <hp-card>
          <h3 class="hp-billing__section-title">Payment Method</h3>
          <div class="hp-billing__payment-method">
            <div class="hp-billing__card-display">
              <div class="hp-billing__card-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div class="hp-billing__card-info">
                <span class="hp-billing__card-number">Visa ending in {{ paymentMethod.last4 }}</span>
                <span class="hp-billing__card-expiry">Expires {{ paymentMethod.expMonth }}/{{ paymentMethod.expYear }}</span>
              </div>
              <hp-badge variant="success" size="sm">Default</hp-badge>
            </div>
            <hp-button variant="outline" size="sm">Update</hp-button>
          </div>
        </hp-card>

        <!-- Billing Address -->
        <hp-card>
          <h3 class="hp-billing__section-title">Billing Address</h3>
          <div class="hp-billing__address">
            <p>John Doe</p>
            <p>ABC Handyman Services</p>
            <p>123 Main Street</p>
            <p>New York, NY 10001</p>
          </div>
          <hp-button variant="outline" size="sm">Edit</hp-button>
        </hp-card>
      </div>

      <!-- Invoices -->
      <hp-card class="hp-billing__invoices-card">
        <div class="hp-billing__invoices-header">
          <h3 class="hp-billing__section-title">Billing History</h3>
          <hp-button variant="ghost" size="sm">Download All</hp-button>
        </div>

        <div class="hp-billing__invoices">
          <div class="hp-billing__invoice" *ngFor="let invoice of invoices">
            <div class="hp-billing__invoice-info">
              <span class="hp-billing__invoice-date">{{ invoice.createdAt | date:'MMM d, yyyy' }}</span>
              <span class="hp-billing__invoice-desc">{{ invoice.description }}</span>
            </div>
            <div class="hp-billing__invoice-meta">
              <span class="hp-billing__invoice-amount">\${{ invoice.amount | number:'1.2-2' }}</span>
              <hp-badge [variant]="invoice.status === 'paid' ? 'success' : 'warning'" size="sm">
                {{ invoice.status }}
              </hp-badge>
              <a *ngIf="invoice.pdfUrl" [href]="invoice.pdfUrl" class="hp-billing__invoice-download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </hp-card>

      <!-- Danger Zone -->
      <hp-card class="hp-billing__danger">
        <h3 class="hp-billing__section-title">Cancel Subscription</h3>
        <p class="hp-billing__danger-text">
          Once you cancel your subscription, you will lose access to all features at the end of your billing period.
        </p>
        <hp-button variant="danger" size="sm">Cancel Subscription</hp-button>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-billing {
      max-width: 900px;

      &__header {
        margin-bottom: var(--hp-spacing-8);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__subtitle {
        font-size: var(--hp-font-size-base);
        color: var(--hp-color-neutral-500);
        margin: 0;
      }

      &__plan-card {
        margin-bottom: var(--hp-spacing-6);
      }

      &__plan-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);
      }

      &__plan-name {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
        margin: var(--hp-spacing-2) 0;
      }

      &__plan-price {
        font-size: var(--hp-font-size-3xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-primary);
        margin: 0;

        span {
          font-size: var(--hp-font-size-base);
          font-weight: var(--hp-font-weight-normal);
          color: var(--hp-color-neutral-500);
        }
      }

      &__plan-details {
        display: flex;
        gap: var(--hp-spacing-8);
        padding: var(--hp-spacing-4) 0;
        border-top: 1px solid var(--hp-color-neutral-200);
        border-bottom: 1px solid var(--hp-color-neutral-200);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 575px) {
          flex-direction: column;
          gap: var(--hp-spacing-3);
        }
      }

      &__plan-detail {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__plan-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__plan-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__usage-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-700);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__usage-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__usage-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__usage-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__usage-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__progress {
        height: 4px;
        background-color: var(--hp-color-neutral-200);
        border-radius: 2px;
        overflow: hidden;
      }

      &__progress-bar {
        height: 100%;
        background-color: var(--hp-color-primary);
        border-radius: 2px;
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-6);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__section-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__payment-method {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__card-display {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__card-brand {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: var(--hp-color-neutral-100);
        border-radius: var(--hp-radius-md);

        svg {
          width: 20px;
          height: 20px;
          color: var(--hp-color-neutral-600);
        }
      }

      &__card-info {
        display: flex;
        flex-direction: column;
      }

      &__card-number {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__card-expiry {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__address {
        margin-bottom: var(--hp-spacing-4);

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-700);
          margin: 0;
          line-height: 1.6;
        }
      }

      &__invoices-card {
        margin-bottom: var(--hp-spacing-6);
      }

      &__invoices-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);
      }

      &__invoices {
        display: flex;
        flex-direction: column;
      }

      &__invoice {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4) 0;
        border-bottom: 1px solid var(--hp-color-neutral-100);

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
      }

      &__invoice-info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__invoice-date {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__invoice-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__invoice-meta {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__invoice-amount {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
      }

      &__invoice-download {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        color: var(--hp-color-neutral-500);
        border-radius: var(--hp-radius-md);
        transition: background-color 150ms, color 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-100);
          color: var(--hp-color-primary);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__danger {
        border: 1px solid var(--hp-color-danger-200);
        background-color: var(--hp-color-danger-50);
      }

      &__danger-text {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        margin: 0 0 var(--hp-spacing-4);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {
  currentPlan: SubscriptionPlan = {
    id: 'professional',
    name: 'Professional',
    tier: 'professional',
    monthlyPrice: 299,
    annualPrice: 239,
    features: [],
    limits: {
      adminSeats: 3,
      technicianSeats: 3,
      locations: 1,
      smsCredits: 1000,
      storageGb: 10
    }
  };

  paymentMethod: PaymentMethod = {
    id: '1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true
  };

  invoices: Invoice[] = [
    { id: '1', amount: 299, status: 'paid', description: 'Professional Plan - December 2024', createdAt: new Date('2024-12-15'), paidAt: new Date('2024-12-15'), pdfUrl: '#' },
    { id: '2', amount: 299, status: 'paid', description: 'Professional Plan - November 2024', createdAt: new Date('2024-11-15'), paidAt: new Date('2024-11-15'), pdfUrl: '#' },
    { id: '3', amount: 299, status: 'paid', description: 'Professional Plan - October 2024', createdAt: new Date('2024-10-15'), paidAt: new Date('2024-10-15'), pdfUrl: '#' }
  ];
}
