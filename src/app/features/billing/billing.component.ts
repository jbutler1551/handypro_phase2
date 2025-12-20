import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface PlanFeature {
  name: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
  franchise: boolean | string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  current?: boolean;
  limits: {
    adminSeats: number | string;
    technicianSeats: number | string;
    franchises: number | string;
    smsCredits: number | string;
    storageGb: number | string;
  };
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  isDefault: boolean;
  status: 'active' | 'expiring' | 'expired';
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  createdAt: Date;
  paidAt?: Date;
  dueDate?: Date;
  pdfUrl: string;
  items: { name: string; quantity: number; amount: number }[];
}

interface UsageMetric {
  name: string;
  current: number;
  limit: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  history: number[];
}

@Component({
  selector: 'hp-billing',
  template: `
    <div class="hp-billing">
      <!-- Header -->
      <div class="hp-billing__header">
        <div class="hp-billing__header-content">
          <h1 class="hp-billing__title">Billing & Subscription</h1>
          <p class="hp-billing__subtitle">Manage your subscription, payments, and usage</p>
        </div>
        <div class="hp-billing__header-actions">
          <hp-button variant="outline" size="sm" (click)="openBillingPortal()">
            <span class="hp-billing__btn-icon" [innerHTML]="sanitizeHtml(icons.externalLink)"></span>
            Stripe Portal
          </hp-button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="hp-billing__stats">
        <div class="hp-billing__stat-card">
          <div class="hp-billing__stat-icon hp-billing__stat-icon--primary" [innerHTML]="sanitizeHtml(icons.creditCard)"></div>
          <div class="hp-billing__stat-content">
            <span class="hp-billing__stat-value">\${{ currentPlan.monthlyPrice }}</span>
            <span class="hp-billing__stat-label">Monthly Cost</span>
          </div>
        </div>
        <div class="hp-billing__stat-card">
          <div class="hp-billing__stat-icon hp-billing__stat-icon--success" [innerHTML]="sanitizeHtml(icons.calendar)"></div>
          <div class="hp-billing__stat-content">
            <span class="hp-billing__stat-value">Jan 15</span>
            <span class="hp-billing__stat-label">Next Billing</span>
          </div>
        </div>
        <div class="hp-billing__stat-card">
          <div class="hp-billing__stat-icon hp-billing__stat-icon--warning" [innerHTML]="sanitizeHtml(icons.users)"></div>
          <div class="hp-billing__stat-content">
            <span class="hp-billing__stat-value">{{ usedSeats }}/{{ totalSeats }}</span>
            <span class="hp-billing__stat-label">Seats Used</span>
          </div>
        </div>
        <div class="hp-billing__stat-card">
          <div class="hp-billing__stat-icon hp-billing__stat-icon--info" [innerHTML]="sanitizeHtml(icons.trendingUp)"></div>
          <div class="hp-billing__stat-content">
            <span class="hp-billing__stat-value">78%</span>
            <span class="hp-billing__stat-label">Usage Rate</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="hp-billing__tabs">
        <button
          *ngFor="let tab of tabs"
          class="hp-billing__tab"
          [class.hp-billing__tab--active]="activeTab === tab.id"
          (click)="activeTab = tab.id"
        >
          <span class="hp-billing__tab-icon" [innerHTML]="sanitizeHtml(tab.icon)"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="hp-billing__content">
        <!-- Overview Tab -->
        <div *ngIf="activeTab === 'overview'" class="hp-billing__panel">
          <!-- Current Plan Card -->
          <hp-card class="hp-billing__plan-card">
            <div class="hp-billing__plan-header">
              <div class="hp-billing__plan-info">
                <div class="hp-billing__plan-badges">
                  <hp-badge variant="primary">Current Plan</hp-badge>
                  <hp-badge variant="success" *ngIf="billingCycle === 'annual'">20% Savings</hp-badge>
                </div>
                <h2 class="hp-billing__plan-name">{{ currentPlan.name }}</h2>
                <p class="hp-billing__plan-desc">{{ currentPlan.description }}</p>
              </div>
              <div class="hp-billing__plan-pricing">
                <div class="hp-billing__price">
                  <span class="hp-billing__price-amount">\${{ billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice }}</span>
                  <span class="hp-billing__price-period">/month</span>
                </div>
                <div class="hp-billing__billing-toggle">
                  <button
                    class="hp-billing__cycle-btn"
                    [class.hp-billing__cycle-btn--active]="billingCycle === 'monthly'"
                    (click)="billingCycle = 'monthly'"
                  >Monthly</button>
                  <button
                    class="hp-billing__cycle-btn"
                    [class.hp-billing__cycle-btn--active]="billingCycle === 'annual'"
                    (click)="billingCycle = 'annual'"
                  >Annual</button>
                </div>
              </div>
            </div>

            <div class="hp-billing__plan-details">
              <div class="hp-billing__plan-detail">
                <span class="hp-billing__detail-label">Billing Period</span>
                <span class="hp-billing__detail-value">{{ billingCycle === 'annual' ? 'Annual' : 'Monthly' }}</span>
              </div>
              <div class="hp-billing__plan-detail">
                <span class="hp-billing__detail-label">Next Billing Date</span>
                <span class="hp-billing__detail-value">January 15, 2025</span>
              </div>
              <div class="hp-billing__plan-detail">
                <span class="hp-billing__detail-label">Account Status</span>
                <hp-badge variant="success">Active</hp-badge>
              </div>
              <div class="hp-billing__plan-detail">
                <span class="hp-billing__detail-label">Member Since</span>
                <span class="hp-billing__detail-value">March 2024</span>
              </div>
            </div>

            <div class="hp-billing__plan-actions">
              <hp-button variant="primary" size="sm" (click)="activeTab = 'plans'">
                <span class="hp-billing__btn-icon" [innerHTML]="sanitizeHtml(icons.arrowUp)"></span>
                Upgrade Plan
              </hp-button>
              <hp-button variant="outline" size="sm">
                <span class="hp-billing__btn-icon" [innerHTML]="sanitizeHtml(icons.download)"></span>
                Download Receipt
              </hp-button>
            </div>
          </hp-card>

          <div class="hp-billing__overview-grid">
            <!-- Usage Summary -->
            <hp-card>
              <div class="hp-billing__section-header">
                <h3 class="hp-billing__section-title">Usage Summary</h3>
                <hp-button variant="ghost" size="sm" (click)="activeTab = 'usage'">View Details</hp-button>
              </div>
              <div class="hp-billing__usage-list">
                <div class="hp-billing__usage-item" *ngFor="let metric of usageMetrics.slice(0, 4)">
                  <div class="hp-billing__usage-info">
                    <span class="hp-billing__usage-name">{{ metric.name }}</span>
                    <span class="hp-billing__usage-value">{{ metric.current }} / {{ metric.limit }} {{ metric.unit }}</span>
                  </div>
                  <div class="hp-billing__progress">
                    <div
                      class="hp-billing__progress-bar"
                      [class.hp-billing__progress-bar--warning]="getUsagePercent(metric) > 75"
                      [class.hp-billing__progress-bar--danger]="getUsagePercent(metric) > 90"
                      [style.width.%]="getUsagePercent(metric)"
                    ></div>
                  </div>
                </div>
              </div>
            </hp-card>

            <!-- Payment Method Summary -->
            <hp-card>
              <div class="hp-billing__section-header">
                <h3 class="hp-billing__section-title">Payment Method</h3>
                <hp-button variant="ghost" size="sm" (click)="activeTab = 'payment'">Manage</hp-button>
              </div>
              <div class="hp-billing__payment-summary">
                <div class="hp-billing__card-visual">
                  <div class="hp-billing__card-chip"></div>
                  <div class="hp-billing__card-number">•••• •••• •••• {{ defaultPaymentMethod.last4 }}</div>
                  <div class="hp-billing__card-footer">
                    <span class="hp-billing__card-brand">{{ defaultPaymentMethod.brand }}</span>
                    <span class="hp-billing__card-expiry">{{ defaultPaymentMethod.expMonth }}/{{ defaultPaymentMethod.expYear }}</span>
                  </div>
                </div>
                <div class="hp-billing__payment-status">
                  <hp-badge [variant]="defaultPaymentMethod.status === 'active' ? 'success' : 'warning'">
                    {{ defaultPaymentMethod.status === 'active' ? 'Active' : 'Expiring Soon' }}
                  </hp-badge>
                  <span class="hp-billing__payment-count">{{ paymentMethods.length }} payment method{{ paymentMethods.length !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </hp-card>
          </div>

          <!-- Recent Invoices -->
          <hp-card>
            <div class="hp-billing__section-header">
              <h3 class="hp-billing__section-title">Recent Invoices</h3>
              <hp-button variant="ghost" size="sm" (click)="activeTab = 'invoices'">View All</hp-button>
            </div>
            <div class="hp-billing__invoice-list">
              <div class="hp-billing__invoice-row" *ngFor="let invoice of invoices.slice(0, 3)">
                <div class="hp-billing__invoice-info">
                  <span class="hp-billing__invoice-number">{{ invoice.number }}</span>
                  <span class="hp-billing__invoice-date">{{ invoice.createdAt | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="hp-billing__invoice-desc">{{ invoice.description }}</div>
                <div class="hp-billing__invoice-amount">\${{ invoice.amount | number:'1.2-2' }}</div>
                <hp-badge [variant]="getInvoiceStatusVariant(invoice.status)" size="sm">
                  {{ invoice.status }}
                </hp-badge>
                <button class="hp-billing__invoice-action" (click)="downloadInvoice(invoice)">
                  <span [innerHTML]="sanitizeHtml(icons.download)"></span>
                </button>
              </div>
            </div>
          </hp-card>
        </div>

        <!-- Plans Tab -->
        <div *ngIf="activeTab === 'plans'" class="hp-billing__panel">
          <div class="hp-billing__plans-header">
            <h2 class="hp-billing__section-heading">Choose Your Plan</h2>
            <p class="hp-billing__section-desc">Select the plan that best fits your franchise management needs</p>
            <div class="hp-billing__billing-switch">
              <span [class.hp-billing__billing-switch-label--active]="billingCycle === 'monthly'">Monthly</span>
              <button
                class="hp-billing__switch"
                [class.hp-billing__switch--on]="billingCycle === 'annual'"
                (click)="billingCycle = billingCycle === 'annual' ? 'monthly' : 'annual'"
              >
                <span class="hp-billing__switch-thumb"></span>
              </button>
              <span [class.hp-billing__billing-switch-label--active]="billingCycle === 'annual'">
                Annual <hp-badge variant="success" size="sm">Save 20%</hp-badge>
              </span>
            </div>
          </div>

          <!-- Plan Cards -->
          <div class="hp-billing__plans-grid">
            <div
              *ngFor="let plan of plans"
              class="hp-billing__plan-option"
              [class.hp-billing__plan-option--popular]="plan.popular"
              [class.hp-billing__plan-option--current]="plan.current"
            >
              <div class="hp-billing__plan-option-header">
                <hp-badge *ngIf="plan.popular" variant="primary" size="sm">Most Popular</hp-badge>
                <hp-badge *ngIf="plan.current" variant="success" size="sm">Current Plan</hp-badge>
                <h3 class="hp-billing__plan-option-name">{{ plan.name }}</h3>
                <p class="hp-billing__plan-option-desc">{{ plan.description }}</p>
              </div>
              <div class="hp-billing__plan-option-price">
                <span class="hp-billing__plan-option-amount">
                  \${{ billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice }}
                </span>
                <span class="hp-billing__plan-option-period">/month</span>
              </div>
              <ul class="hp-billing__plan-option-features">
                <li>
                  <span class="hp-billing__check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                  {{ plan.limits.adminSeats }} Admin Seats
                </li>
                <li>
                  <span class="hp-billing__check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                  {{ plan.limits.technicianSeats }} Technician Seats
                </li>
                <li>
                  <span class="hp-billing__check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                  {{ plan.limits.franchises }} Franchises
                </li>
                <li>
                  <span class="hp-billing__check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                  {{ plan.limits.smsCredits }} SMS Credits/mo
                </li>
                <li>
                  <span class="hp-billing__check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                  {{ plan.limits.storageGb }} Storage
                </li>
              </ul>
              <hp-button
                [variant]="plan.current ? 'outline' : (plan.popular ? 'primary' : 'secondary')"
                [disabled]="!!plan.current"
                class="hp-billing__plan-option-btn"
              >
                {{ plan.current ? 'Current Plan' : 'Select Plan' }}
              </hp-button>
            </div>
          </div>

          <!-- Feature Comparison -->
          <hp-card class="hp-billing__comparison">
            <h3 class="hp-billing__section-title">Feature Comparison</h3>
            <div class="hp-billing__comparison-table-wrapper">
              <table class="hp-billing__comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Starter</th>
                    <th>Professional</th>
                    <th>Enterprise</th>
                    <th>Franchise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let feature of planFeatures">
                    <td>{{ feature.name }}</td>
                    <td>
                      <span *ngIf="feature.starter === true" class="hp-billing__feature-check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                      <span *ngIf="feature.starter === false" class="hp-billing__feature-x" [innerHTML]="sanitizeHtml(icons.x)"></span>
                      <span *ngIf="isString(feature.starter)">{{ feature.starter }}</span>
                    </td>
                    <td>
                      <span *ngIf="feature.professional === true" class="hp-billing__feature-check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                      <span *ngIf="feature.professional === false" class="hp-billing__feature-x" [innerHTML]="sanitizeHtml(icons.x)"></span>
                      <span *ngIf="isString(feature.professional)">{{ feature.professional }}</span>
                    </td>
                    <td>
                      <span *ngIf="feature.enterprise === true" class="hp-billing__feature-check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                      <span *ngIf="feature.enterprise === false" class="hp-billing__feature-x" [innerHTML]="sanitizeHtml(icons.x)"></span>
                      <span *ngIf="isString(feature.enterprise)">{{ feature.enterprise }}</span>
                    </td>
                    <td>
                      <span *ngIf="feature.franchise === true" class="hp-billing__feature-check" [innerHTML]="sanitizeHtml(icons.check)"></span>
                      <span *ngIf="feature.franchise === false" class="hp-billing__feature-x" [innerHTML]="sanitizeHtml(icons.x)"></span>
                      <span *ngIf="isString(feature.franchise)">{{ feature.franchise }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </hp-card>
        </div>

        <!-- Payment Methods Tab -->
        <div *ngIf="activeTab === 'payment'" class="hp-billing__panel">
          <div class="hp-billing__section-header">
            <div>
              <h2 class="hp-billing__section-heading">Payment Methods</h2>
              <p class="hp-billing__section-desc">Manage your payment methods and billing preferences</p>
            </div>
            <hp-button variant="primary" size="sm" (click)="addPaymentMethod()">
              <span class="hp-billing__btn-icon" [innerHTML]="sanitizeHtml(icons.plus)"></span>
              Add Payment Method
            </hp-button>
          </div>

          <div class="hp-billing__payment-grid">
            <div
              *ngFor="let method of paymentMethods"
              class="hp-billing__payment-card"
              [class.hp-billing__payment-card--default]="method.isDefault"
            >
              <div class="hp-billing__payment-card-header">
                <div class="hp-billing__payment-type">
                  <span class="hp-billing__payment-icon" [innerHTML]="sanitizeHtml(method.type === 'card' ? icons.creditCard : icons.bank)"></span>
                  <span class="hp-billing__payment-brand">{{ method.brand }}</span>
                </div>
                <div class="hp-billing__payment-badges">
                  <hp-badge *ngIf="method.isDefault" variant="primary" size="sm">Default</hp-badge>
                  <hp-badge
                    [variant]="method.status === 'active' ? 'success' : (method.status === 'expiring' ? 'warning' : 'error')"
                    size="sm"
                  >
                    {{ method.status | titlecase }}
                  </hp-badge>
                </div>
              </div>
              <div class="hp-billing__payment-card-body">
                <div class="hp-billing__payment-number">
                  •••• •••• •••• {{ method.last4 }}
                </div>
                <div class="hp-billing__payment-expiry" *ngIf="method.type === 'card'">
                  Expires {{ method.expMonth }}/{{ method.expYear }}
                </div>
                <div class="hp-billing__payment-bank" *ngIf="method.type === 'bank'">
                  {{ method.bankName }}
                </div>
              </div>
              <div class="hp-billing__payment-card-actions">
                <hp-button variant="ghost" size="sm" *ngIf="!method.isDefault" (click)="setDefaultPaymentMethod(method)">
                  Set as Default
                </hp-button>
                <hp-button variant="ghost" size="sm" (click)="editPaymentMethod(method)">Edit</hp-button>
                <hp-button variant="ghost" size="sm" *ngIf="!method.isDefault" (click)="deletePaymentMethod(method)">
                  <span class="hp-billing__text-danger">Remove</span>
                </hp-button>
              </div>
            </div>

            <!-- Add Payment Method Card -->
            <div class="hp-billing__payment-card hp-billing__payment-card--add" (click)="addPaymentMethod()">
              <span class="hp-billing__add-icon" [innerHTML]="sanitizeHtml(icons.plus)"></span>
              <span class="hp-billing__add-label">Add Payment Method</span>
            </div>
          </div>

          <!-- Billing Address -->
          <hp-card class="hp-billing__address-card">
            <div class="hp-billing__section-header">
              <h3 class="hp-billing__section-title">Billing Address</h3>
              <hp-button variant="ghost" size="sm" (click)="editBillingAddress()">Edit</hp-button>
            </div>
            <div class="hp-billing__address-content">
              <div class="hp-billing__address-icon" [innerHTML]="sanitizeHtml(icons.mapPin)"></div>
              <div class="hp-billing__address-details">
                <p class="hp-billing__address-name">{{ billingAddress.name }}</p>
                <p class="hp-billing__address-company">{{ billingAddress.company }}</p>
                <p class="hp-billing__address-line">{{ billingAddress.line1 }}</p>
                <p class="hp-billing__address-line" *ngIf="billingAddress.line2">{{ billingAddress.line2 }}</p>
                <p class="hp-billing__address-city">{{ billingAddress.city }}, {{ billingAddress.state }} {{ billingAddress.zip }}</p>
                <p class="hp-billing__address-country">{{ billingAddress.country }}</p>
              </div>
            </div>
          </hp-card>

          <!-- Tax Information -->
          <hp-card>
            <div class="hp-billing__section-header">
              <h3 class="hp-billing__section-title">Tax Information</h3>
              <hp-button variant="ghost" size="sm" (click)="editTaxInfo()">Edit</hp-button>
            </div>
            <div class="hp-billing__tax-info">
              <div class="hp-billing__tax-item">
                <span class="hp-billing__tax-label">Tax ID (EIN)</span>
                <span class="hp-billing__tax-value">{{ taxInfo.ein || 'Not provided' }}</span>
              </div>
              <div class="hp-billing__tax-item">
                <span class="hp-billing__tax-label">Tax Exempt</span>
                <hp-badge [variant]="taxInfo.exempt ? 'success' : 'secondary'" size="sm">
                  {{ taxInfo.exempt ? 'Yes' : 'No' }}
                </hp-badge>
              </div>
              <div class="hp-billing__tax-item" *ngIf="taxInfo.exempt">
                <span class="hp-billing__tax-label">Exempt Certificate</span>
                <a href="#" class="hp-billing__tax-link">View Certificate</a>
              </div>
            </div>
          </hp-card>
        </div>

        <!-- Invoices Tab -->
        <div *ngIf="activeTab === 'invoices'" class="hp-billing__panel">
          <div class="hp-billing__section-header">
            <div>
              <h2 class="hp-billing__section-heading">Invoice History</h2>
              <p class="hp-billing__section-desc">View and download your billing history</p>
            </div>
            <div class="hp-billing__invoice-actions">
              <hp-button variant="outline" size="sm" (click)="downloadAllInvoices()">
                <span class="hp-billing__btn-icon" [innerHTML]="sanitizeHtml(icons.download)"></span>
                Download All
              </hp-button>
            </div>
          </div>

          <!-- Filters -->
          <div class="hp-billing__filters">
            <div class="hp-billing__filter-group">
              <label class="hp-billing__filter-label">Status</label>
              <select class="hp-billing__filter-select" [(ngModel)]="invoiceFilter.status">
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div class="hp-billing__filter-group">
              <label class="hp-billing__filter-label">Date Range</label>
              <select class="hp-billing__filter-select" [(ngModel)]="invoiceFilter.dateRange">
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
            <div class="hp-billing__filter-group hp-billing__filter-group--search">
              <input
                type="text"
                class="hp-billing__filter-input"
                placeholder="Search invoices..."
                [(ngModel)]="invoiceFilter.search"
              />
            </div>
          </div>

          <!-- Invoice Table -->
          <hp-card class="hp-billing__invoices-table-card">
            <table class="hp-billing__invoices-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invoice of filteredInvoices">
                  <td>
                    <span class="hp-billing__invoice-num">{{ invoice.number }}</span>
                  </td>
                  <td>{{ invoice.createdAt | date:'MMM d, yyyy' }}</td>
                  <td>{{ invoice.description }}</td>
                  <td class="hp-billing__invoice-amount-cell">\${{ invoice.amount | number:'1.2-2' }}</td>
                  <td>
                    <hp-badge [variant]="getInvoiceStatusVariant(invoice.status)" size="sm">
                      {{ invoice.status | titlecase }}
                    </hp-badge>
                  </td>
                  <td>
                    <div class="hp-billing__invoice-table-actions">
                      <button class="hp-billing__action-btn" (click)="viewInvoice(invoice)" title="View">
                        <span [innerHTML]="sanitizeHtml(icons.eye)"></span>
                      </button>
                      <button class="hp-billing__action-btn" (click)="downloadInvoice(invoice)" title="Download">
                        <span [innerHTML]="sanitizeHtml(icons.download)"></span>
                      </button>
                      <button
                        class="hp-billing__action-btn"
                        *ngIf="invoice.status === 'failed'"
                        (click)="retryPayment(invoice)"
                        title="Retry Payment"
                      >
                        <span [innerHTML]="sanitizeHtml(icons.refresh)"></span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="hp-billing__pagination">
              <span class="hp-billing__pagination-info">Showing 1-{{ filteredInvoices.length }} of {{ invoices.length }} invoices</span>
              <div class="hp-billing__pagination-controls">
                <button class="hp-billing__pagination-btn" disabled>Previous</button>
                <button class="hp-billing__pagination-btn hp-billing__pagination-btn--active">1</button>
                <button class="hp-billing__pagination-btn">2</button>
                <button class="hp-billing__pagination-btn">3</button>
                <button class="hp-billing__pagination-btn">Next</button>
              </div>
            </div>
          </hp-card>
        </div>

        <!-- Usage Tab -->
        <div *ngIf="activeTab === 'usage'" class="hp-billing__panel">
          <div class="hp-billing__section-header">
            <div>
              <h2 class="hp-billing__section-heading">Usage Dashboard</h2>
              <p class="hp-billing__section-desc">Monitor your resource consumption and optimize your plan</p>
            </div>
            <div class="hp-billing__usage-period">
              <select class="hp-billing__filter-select" [(ngModel)]="usagePeriod">
                <option value="current">Current Billing Period</option>
                <option value="previous">Previous Period</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>
          </div>

          <!-- Usage Cards -->
          <div class="hp-billing__usage-grid">
            <div *ngFor="let metric of usageMetrics" class="hp-billing__usage-card">
              <div class="hp-billing__usage-card-header">
                <h4 class="hp-billing__usage-card-title">{{ metric.name }}</h4>
                <div class="hp-billing__usage-trend" [class.hp-billing__usage-trend--up]="metric.trend === 'up'" [class.hp-billing__usage-trend--down]="metric.trend === 'down'">
                  <span [innerHTML]="sanitizeHtml(metric.trend === 'up' ? icons.trendingUp : (metric.trend === 'down' ? icons.trendingDown : icons.minus))"></span>
                  {{ metric.trendValue }}%
                </div>
              </div>
              <div class="hp-billing__usage-card-value">
                <span class="hp-billing__usage-current">{{ metric.current }}</span>
                <span class="hp-billing__usage-limit">/ {{ metric.limit }} {{ metric.unit }}</span>
              </div>
              <div class="hp-billing__progress hp-billing__progress--lg">
                <div
                  class="hp-billing__progress-bar"
                  [class.hp-billing__progress-bar--warning]="getUsagePercent(metric) > 75"
                  [class.hp-billing__progress-bar--danger]="getUsagePercent(metric) > 90"
                  [style.width.%]="getUsagePercent(metric)"
                ></div>
              </div>
              <div class="hp-billing__usage-chart">
                <div class="hp-billing__mini-chart">
                  <div
                    *ngFor="let value of metric.history; let i = index"
                    class="hp-billing__mini-bar"
                    [style.height.%]="(value / getMaxHistory(metric)) * 100"
                    [class.hp-billing__mini-bar--current]="i === metric.history.length - 1"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Breakdown -->
          <hp-card>
            <h3 class="hp-billing__section-title">Usage Breakdown by Franchise</h3>
            <div class="hp-billing__breakdown-table-wrapper">
              <table class="hp-billing__breakdown-table">
                <thead>
                  <tr>
                    <th>Franchise</th>
                    <th>Admin Seats</th>
                    <th>Technicians</th>
                    <th>SMS Used</th>
                    <th>Storage</th>
                    <th>API Calls</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let franchise of franchiseUsage">
                    <td>
                      <div class="hp-billing__franchise-cell">
                        <span class="hp-billing__franchise-name">{{ franchise.name }}</span>
                        <span class="hp-billing__franchise-location">{{ franchise.location }}</span>
                      </div>
                    </td>
                    <td>{{ franchise.adminSeats }}</td>
                    <td>{{ franchise.technicians }}</td>
                    <td>{{ franchise.smsUsed }}</td>
                    <td>{{ franchise.storage }}</td>
                    <td>{{ franchise.apiCalls | number }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </hp-card>

          <!-- Overage Warning -->
          <div class="hp-billing__overage-alert" *ngIf="hasOverageRisk">
            <div class="hp-billing__alert-icon" [innerHTML]="sanitizeHtml(icons.alertTriangle)"></div>
            <div class="hp-billing__alert-content">
              <h4 class="hp-billing__alert-title">Approaching Usage Limits</h4>
              <p class="hp-billing__alert-desc">
                You're using more than 80% of your SMS credits. Consider upgrading your plan to avoid overage charges.
              </p>
            </div>
            <hp-button variant="primary" size="sm" (click)="activeTab = 'plans'">Upgrade Plan</hp-button>
          </div>
        </div>
      </div>

      <!-- Cancel Subscription Section -->
      <hp-card class="hp-billing__danger-zone" *ngIf="activeTab === 'overview'">
        <h3 class="hp-billing__danger-title">Danger Zone</h3>
        <div class="hp-billing__danger-content">
          <div class="hp-billing__danger-info">
            <p class="hp-billing__danger-heading">Cancel Subscription</p>
            <p class="hp-billing__danger-desc">
              Once cancelled, you will lose access to all features at the end of your billing period.
              Your data will be retained for 30 days after cancellation.
            </p>
          </div>
          <hp-button variant="danger" size="sm" (click)="cancelSubscription()">Cancel Subscription</hp-button>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-billing {
      max-width: 1200px;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__subtitle {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__btn-icon {
        display: inline-flex;
        width: 16px;
        height: 16px;
        margin-right: var(--hp-spacing-2);

        svg {
          width: 100%;
          height: 100%;
        }
      }

      /* Stats */
      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 991px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__stat-card {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5);
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
        transition: transform 200ms ease, box-shadow 200ms ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--hp-shadow-md);
        }
      }

      &__stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--hp-radius-modern-sm);

        svg {
          width: 24px;
          height: 24px;
        }

        &--primary {
          background: var(--hp-color-primary-100);
          color: var(--hp-color-primary);
        }

        &--success {
          background: var(--hp-color-success-100);
          color: var(--hp-color-success);
        }

        &--warning {
          background: var(--hp-color-warning-100);
          color: var(--hp-color-warning);
        }

        &--info {
          background: var(--hp-color-info-100);
          color: var(--hp-color-info);
        }
      }

      &__stat-content {
        display: flex;
        flex-direction: column;
      }

      &__stat-value {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__stat-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      /* Tabs */
      &__tabs {
        display: flex;
        gap: var(--hp-spacing-1);
        padding: var(--hp-spacing-2);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-md);
        margin-bottom: var(--hp-spacing-6);
        overflow-x: auto;
      }

      &__tab {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-3) var(--hp-spacing-5);
        background: transparent;
        border: none;
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 200ms ease;

        &:hover {
          color: var(--hp-text-primary);
          background: var(--hp-glass-bg);
        }

        &--active {
          background: var(--hp-surface-card);
          color: var(--hp-text-primary);
          box-shadow: var(--hp-shadow-sm);
        }
      }

      &__tab-icon {
        display: flex;
        width: 18px;
        height: 18px;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      /* Panel */
      &__panel {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-6);
      }

      /* Plan Card */
      &__plan-card {
        background: linear-gradient(135deg, var(--hp-surface-card) 0%, var(--hp-glass-bg-subtle) 100%);
      }

      &__plan-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__plan-badges {
        display: flex;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-2);
      }

      &__plan-name {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__plan-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__plan-pricing {
        text-align: right;
      }

      &__price {
        margin-bottom: var(--hp-spacing-2);
      }

      &__price-amount {
        font-size: var(--hp-font-size-3xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-primary);
      }

      &__price-period {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-secondary);
      }

      &__billing-toggle {
        display: flex;
        gap: var(--hp-spacing-1);
        padding: var(--hp-spacing-1);
        background: var(--hp-glass-bg);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__cycle-btn {
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: transparent;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        &--active {
          background: var(--hp-surface-card);
          color: var(--hp-text-primary);
          box-shadow: var(--hp-shadow-sm);
        }
      }

      &__plan-details {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5) 0;
        border-top: 1px solid var(--hp-glass-border);
        border-bottom: 1px solid var(--hp-glass-border);
        margin-bottom: var(--hp-spacing-5);

        @media (max-width: 767px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      &__plan-detail {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__detail-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__detail-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__plan-actions {
        display: flex;
        gap: var(--hp-spacing-3);
        flex-wrap: wrap;
      }

      /* Overview Grid */
      &__overview-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-6);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      /* Section Header */
      &__section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);
        flex-wrap: wrap;
        gap: var(--hp-spacing-3);
      }

      &__section-heading {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__section-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__section-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0;
      }

      /* Usage List */
      &__usage-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__usage-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__usage-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__usage-name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
      }

      &__usage-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__progress {
        height: 6px;
        background: var(--hp-glass-bg);
        border-radius: 3px;
        overflow: hidden;

        &--lg {
          height: 10px;
          border-radius: 5px;
        }
      }

      &__progress-bar {
        height: 100%;
        background: var(--hp-gradient-primary);
        border-radius: inherit;
        transition: width 300ms ease;

        &--warning {
          background: var(--hp-color-warning);
        }

        &--danger {
          background: var(--hp-color-danger);
        }
      }

      /* Payment Summary */
      &__payment-summary {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__card-visual {
        background: linear-gradient(135deg, var(--hp-color-neutral-800) 0%, var(--hp-color-neutral-900) 100%);
        padding: var(--hp-spacing-5);
        border-radius: var(--hp-radius-modern-md);
        color: white;
      }

      &__card-chip {
        width: 40px;
        height: 28px;
        background: linear-gradient(135deg, #f0d78c 0%, #c9a227 100%);
        border-radius: 4px;
        margin-bottom: var(--hp-spacing-4);
      }

      &__card-number {
        font-size: var(--hp-font-size-lg);
        font-family: monospace;
        letter-spacing: 0.1em;
        margin-bottom: var(--hp-spacing-3);
      }

      &__card-footer {
        display: flex;
        justify-content: space-between;
        font-size: var(--hp-font-size-sm);
        opacity: 0.8;
      }

      &__payment-status {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__payment-count {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      /* Invoice List */
      &__invoice-list {
        display: flex;
        flex-direction: column;
      }

      &__invoice-row {
        display: grid;
        grid-template-columns: 120px 1fr auto auto 40px;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4) 0;
        border-bottom: 1px solid var(--hp-glass-border);

        &:last-child {
          border-bottom: none;
        }

        @media (max-width: 767px) {
          grid-template-columns: 1fr auto;
          gap: var(--hp-spacing-2);
        }
      }

      &__invoice-info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__invoice-number {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__invoice-date {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__invoice-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);

        @media (max-width: 767px) {
          display: none;
        }
      }

      &__invoice-amount {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
      }

      &__invoice-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        &:hover {
          background: var(--hp-glass-bg);
          color: var(--hp-color-primary);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      /* Plans Tab */
      &__plans-header {
        text-align: center;
        margin-bottom: var(--hp-spacing-8);
      }

      &__billing-switch {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--hp-spacing-3);
        margin-top: var(--hp-spacing-4);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__billing-switch-label--active {
        color: var(--hp-text-primary);
        font-weight: var(--hp-font-weight-medium);
      }

      &__switch {
        position: relative;
        width: 48px;
        height: 26px;
        background: var(--hp-glass-bg-prominent);
        border: 1px solid var(--hp-glass-border);
        border-radius: 13px;
        cursor: pointer;
        transition: all 200ms ease;

        &--on {
          background: var(--hp-color-primary);
          border-color: var(--hp-color-primary);
        }
      }

      &__switch-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        box-shadow: var(--hp-shadow-sm);
        transition: transform 200ms ease;

        .hp-billing__switch--on & {
          transform: translateX(22px);
        }
      }

      /* Plan Cards Grid */
      &__plans-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-8);

        @media (max-width: 1199px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__plan-option {
        display: flex;
        flex-direction: column;
        padding: var(--hp-spacing-6);
        background: var(--hp-surface-card);
        border: 2px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-lg);
        transition: all 200ms ease;

        &:hover {
          border-color: var(--hp-color-primary-200);
          box-shadow: var(--hp-shadow-md);
        }

        &--popular {
          border-color: var(--hp-color-primary);
          box-shadow: var(--hp-shadow-primary);
        }

        &--current {
          border-color: var(--hp-color-success);
          background: linear-gradient(135deg, var(--hp-color-success-50) 0%, var(--hp-surface-card) 100%);
        }
      }

      &__plan-option-header {
        margin-bottom: var(--hp-spacing-4);
      }

      &__plan-option-name {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: var(--hp-spacing-2) 0;
      }

      &__plan-option-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__plan-option-price {
        margin-bottom: var(--hp-spacing-5);
        padding-bottom: var(--hp-spacing-5);
        border-bottom: 1px solid var(--hp-glass-border);
      }

      &__plan-option-amount {
        font-size: var(--hp-font-size-3xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__plan-option-period {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__plan-option-features {
        list-style: none;
        margin: 0 0 var(--hp-spacing-5);
        padding: 0;
        flex: 1;

        li {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          padding: var(--hp-spacing-2) 0;
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-secondary);
        }
      }

      &__check {
        display: flex;
        color: var(--hp-color-success);

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__plan-option-btn {
        width: 100%;
      }

      /* Comparison Table */
      &__comparison {
        overflow: hidden;
      }

      &__comparison-table-wrapper {
        overflow-x: auto;
        margin-top: var(--hp-spacing-4);
      }

      &__comparison-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--hp-font-size-sm);

        th, td {
          padding: var(--hp-spacing-3) var(--hp-spacing-4);
          text-align: center;
          border-bottom: 1px solid var(--hp-glass-border);
        }

        th {
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-text-primary);
          background: var(--hp-glass-bg-subtle);
        }

        th:first-child,
        td:first-child {
          text-align: left;
        }

        td {
          color: var(--hp-text-secondary);
        }
      }

      &__feature-check {
        display: inline-flex;
        color: var(--hp-color-success);

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__feature-x {
        display: inline-flex;
        color: var(--hp-text-tertiary);

        svg {
          width: 18px;
          height: 18px;
        }
      }

      /* Payment Methods */
      &__payment-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 991px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__payment-card {
        display: flex;
        flex-direction: column;
        padding: var(--hp-spacing-5);
        background: var(--hp-surface-card);
        border: 2px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
        transition: all 200ms ease;

        &--default {
          border-color: var(--hp-color-primary);
        }

        &--add {
          align-items: center;
          justify-content: center;
          gap: var(--hp-spacing-3);
          min-height: 180px;
          border-style: dashed;
          cursor: pointer;
          color: var(--hp-text-secondary);

          &:hover {
            border-color: var(--hp-color-primary);
            background: var(--hp-glass-bg-subtle);
          }
        }
      }

      &__payment-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-4);
      }

      &__payment-type {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
      }

      &__payment-icon {
        display: flex;
        color: var(--hp-text-secondary);

        svg {
          width: 24px;
          height: 24px;
        }
      }

      &__payment-brand {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
      }

      &__payment-badges {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__payment-card-body {
        margin-bottom: var(--hp-spacing-4);
        flex: 1;
      }

      &__payment-number {
        font-size: var(--hp-font-size-lg);
        font-family: monospace;
        color: var(--hp-text-primary);
        margin-bottom: var(--hp-spacing-2);
      }

      &__payment-expiry,
      &__payment-bank {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__payment-card-actions {
        display: flex;
        gap: var(--hp-spacing-2);
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-glass-border);
      }

      &__text-danger {
        color: var(--hp-color-danger);
      }

      &__add-icon {
        display: flex;
        width: 48px;
        height: 48px;
        align-items: center;
        justify-content: center;
        background: var(--hp-glass-bg);
        border-radius: 50%;

        svg {
          width: 24px;
          height: 24px;
        }
      }

      &__add-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
      }

      /* Address Card */
      &__address-card {
        margin-bottom: var(--hp-spacing-6);
      }

      &__address-content {
        display: flex;
        gap: var(--hp-spacing-4);
      }

      &__address-icon {
        display: flex;
        align-items: flex-start;
        color: var(--hp-text-secondary);

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__address-details p {
        margin: 0;
        line-height: 1.6;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__address-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary) !important;
      }

      /* Tax Info */
      &__tax-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__tax-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__tax-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__tax-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
      }

      &__tax-link {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      /* Filters */
      &__filters {
        display: flex;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__filter-group {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);

        &--search {
          flex: 1;
          min-width: 200px;
        }
      }

      &__filter-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        font-weight: var(--hp-font-weight-medium);
      }

      &__filter-select,
      &__filter-input {
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
        min-width: 150px;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 3px var(--hp-color-primary-100);
        }
      }

      /* Invoices Table */
      &__invoices-table-card {
        overflow: hidden;
      }

      &__invoices-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--hp-font-size-sm);

        th, td {
          padding: var(--hp-spacing-4);
          text-align: left;
          border-bottom: 1px solid var(--hp-glass-border);
        }

        th {
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-text-secondary);
          background: var(--hp-glass-bg-subtle);
          font-size: var(--hp-font-size-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        td {
          color: var(--hp-text-primary);
        }
      }

      &__invoice-num {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-primary);
      }

      &__invoice-amount-cell {
        font-weight: var(--hp-font-weight-semibold);
      }

      &__invoice-table-actions {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        &:hover {
          background: var(--hp-glass-bg);
          color: var(--hp-color-primary);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      /* Pagination */
      &__pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-glass-border);
        flex-wrap: wrap;
        gap: var(--hp-spacing-3);
      }

      &__pagination-info {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__pagination-controls {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__pagination-btn {
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: transparent;
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        &:hover:not(:disabled) {
          border-color: var(--hp-color-primary);
          color: var(--hp-color-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &--active {
          background: var(--hp-color-primary);
          border-color: var(--hp-color-primary);
          color: white;
        }
      }

      /* Usage Dashboard */
      &__usage-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 991px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__usage-card {
        padding: var(--hp-spacing-5);
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
      }

      &__usage-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-3);
      }

      &__usage-card-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__usage-trend {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-tertiary);

        svg {
          width: 14px;
          height: 14px;
        }

        &--up {
          color: var(--hp-color-success);
        }

        &--down {
          color: var(--hp-color-danger);
        }
      }

      &__usage-card-value {
        margin-bottom: var(--hp-spacing-3);
      }

      &__usage-current {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__usage-limit {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__usage-chart {
        margin-top: var(--hp-spacing-4);
      }

      &__mini-chart {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 40px;
      }

      &__mini-bar {
        flex: 1;
        background: var(--hp-glass-bg-prominent);
        border-radius: 2px;
        min-height: 4px;
        transition: all 200ms ease;

        &--current {
          background: var(--hp-color-primary);
        }
      }

      /* Breakdown Table */
      &__breakdown-table-wrapper {
        overflow-x: auto;
        margin-top: var(--hp-spacing-4);
      }

      &__breakdown-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--hp-font-size-sm);

        th, td {
          padding: var(--hp-spacing-3) var(--hp-spacing-4);
          text-align: left;
          border-bottom: 1px solid var(--hp-glass-border);
        }

        th {
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-text-secondary);
          font-size: var(--hp-font-size-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        td {
          color: var(--hp-text-primary);
        }
      }

      &__franchise-cell {
        display: flex;
        flex-direction: column;
      }

      &__franchise-name {
        font-weight: var(--hp-font-weight-medium);
      }

      &__franchise-location {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
      }

      /* Overage Alert */
      &__overage-alert {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5);
        background: var(--hp-color-warning-50);
        border: 1px solid var(--hp-color-warning-200);
        border-radius: var(--hp-radius-modern-md);
        flex-wrap: wrap;
      }

      &__alert-icon {
        display: flex;
        color: var(--hp-color-warning);

        svg {
          width: 24px;
          height: 24px;
        }
      }

      &__alert-content {
        flex: 1;
        min-width: 200px;
      }

      &__alert-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-warning-800);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__alert-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-warning-700);
        margin: 0;
      }

      /* Danger Zone */
      &__danger-zone {
        border: 1px solid var(--hp-color-danger-200);
        background: var(--hp-color-danger-50);
      }

      &__danger-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-danger-700);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__danger-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__danger-heading {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__danger-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0;
        max-width: 500px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {
  activeTab = 'overview';
  billingCycle: 'monthly' | 'annual' = 'monthly';
  usagePeriod = 'current';
  usedSeats = 5;
  totalSeats = 10;
  hasOverageRisk = true;

  invoiceFilter = {
    status: 'all',
    dateRange: 'all',
    search: ''
  };

  tabs = [
    { id: 'overview', label: 'Overview', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
    { id: 'plans', label: 'Plans', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>' },
    { id: 'payment', label: 'Payment', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>' },
    { id: 'invoices', label: 'Invoices', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' },
    { id: 'usage', label: 'Usage', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>' }
  ];

  icons = {
    creditCard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
    trendingDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    alertTriangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  };

  currentPlan: Plan = {
    id: 'professional',
    name: 'Professional',
    description: 'Perfect for growing franchise operations',
    monthlyPrice: 299,
    annualPrice: 239,
    current: true,
    limits: {
      adminSeats: 5,
      technicianSeats: 25,
      franchises: 3,
      smsCredits: '2,500',
      storageGb: '25 GB'
    }
  };

  plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For small single-location businesses',
      monthlyPrice: 99,
      annualPrice: 79,
      limits: {
        adminSeats: 2,
        technicianSeats: 5,
        franchises: 1,
        smsCredits: '500',
        storageGb: '5 GB'
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Perfect for growing franchise operations',
      monthlyPrice: 299,
      annualPrice: 239,
      popular: true,
      current: true,
      limits: {
        adminSeats: 5,
        technicianSeats: 25,
        franchises: 3,
        smsCredits: '2,500',
        storageGb: '25 GB'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For established multi-location franchises',
      monthlyPrice: 599,
      annualPrice: 479,
      limits: {
        adminSeats: 15,
        technicianSeats: 100,
        franchises: 10,
        smsCredits: '10,000',
        storageGb: '100 GB'
      }
    },
    {
      id: 'franchise',
      name: 'Franchise',
      description: 'Unlimited scale for enterprise franchisors',
      monthlyPrice: 1499,
      annualPrice: 1199,
      limits: {
        adminSeats: 'Unlimited',
        technicianSeats: 'Unlimited',
        franchises: 'Unlimited',
        smsCredits: 'Unlimited',
        storageGb: 'Unlimited'
      }
    }
  ];

  planFeatures: PlanFeature[] = [
    { name: 'Dashboard & Analytics', starter: true, professional: true, enterprise: true, franchise: true },
    { name: 'Job Scheduling', starter: true, professional: true, enterprise: true, franchise: true },
    { name: 'Customer Management', starter: true, professional: true, enterprise: true, franchise: true },
    { name: 'Invoicing & Payments', starter: true, professional: true, enterprise: true, franchise: true },
    { name: 'Mobile App Access', starter: true, professional: true, enterprise: true, franchise: true },
    { name: 'Multi-location Support', starter: false, professional: true, enterprise: true, franchise: true },
    { name: 'Custom Branding', starter: false, professional: true, enterprise: true, franchise: true },
    { name: 'API Access', starter: false, professional: true, enterprise: true, franchise: true },
    { name: 'Advanced Reporting', starter: false, professional: true, enterprise: true, franchise: true },
    { name: 'Franchise Management', starter: false, professional: false, enterprise: true, franchise: true },
    { name: 'Territory Mapping', starter: false, professional: false, enterprise: true, franchise: true },
    { name: 'White-label Portal', starter: false, professional: false, enterprise: false, franchise: true },
    { name: 'Dedicated Support', starter: false, professional: false, enterprise: true, franchise: true },
    { name: 'Custom Integrations', starter: false, professional: false, enterprise: false, franchise: true },
    { name: 'SLA Guarantee', starter: false, professional: false, enterprise: '99.9%', franchise: '99.99%' }
  ];

  defaultPaymentMethod: PaymentMethod = {
    id: '1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
    status: 'active'
  };

  paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      status: 'active'
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expMonth: 3,
      expYear: 2025,
      isDefault: false,
      status: 'expiring'
    },
    {
      id: '3',
      type: 'bank',
      brand: 'ACH',
      last4: '6789',
      bankName: 'Chase Business Checking',
      isDefault: false,
      status: 'active'
    }
  ];

  billingAddress = {
    name: 'John Doe',
    company: 'ABC Handyman Services LLC',
    line1: '123 Main Street',
    line2: 'Suite 400',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States'
  };

  taxInfo = {
    ein: '12-3456789',
    exempt: false
  };

  invoices: Invoice[] = [
    { id: '1', number: 'INV-2024-0012', amount: 299, status: 'paid', description: 'Professional Plan - December 2024', createdAt: new Date('2024-12-15'), paidAt: new Date('2024-12-15'), pdfUrl: '#', items: [] },
    { id: '2', number: 'INV-2024-0011', amount: 299, status: 'paid', description: 'Professional Plan - November 2024', createdAt: new Date('2024-11-15'), paidAt: new Date('2024-11-15'), pdfUrl: '#', items: [] },
    { id: '3', number: 'INV-2024-0010', amount: 299, status: 'paid', description: 'Professional Plan - October 2024', createdAt: new Date('2024-10-15'), paidAt: new Date('2024-10-15'), pdfUrl: '#', items: [] },
    { id: '4', number: 'INV-2024-0009', amount: 299, status: 'paid', description: 'Professional Plan - September 2024', createdAt: new Date('2024-09-15'), paidAt: new Date('2024-09-15'), pdfUrl: '#', items: [] },
    { id: '5', number: 'INV-2024-0008', amount: 299, status: 'paid', description: 'Professional Plan - August 2024', createdAt: new Date('2024-08-15'), paidAt: new Date('2024-08-15'), pdfUrl: '#', items: [] },
    { id: '6', number: 'INV-2024-0007', amount: 349, status: 'paid', description: 'Professional Plan + SMS Add-on - July 2024', createdAt: new Date('2024-07-15'), paidAt: new Date('2024-07-15'), pdfUrl: '#', items: [] },
    { id: '7', number: 'INV-2024-0006', amount: 299, status: 'refunded', description: 'Professional Plan - June 2024', createdAt: new Date('2024-06-15'), pdfUrl: '#', items: [] }
  ];

  usageMetrics: UsageMetric[] = [
    { name: 'Admin Seats', current: 3, limit: 5, unit: 'seats', trend: 'stable', trendValue: 0, history: [2, 2, 3, 3, 3, 3] },
    { name: 'Technicians', current: 18, limit: 25, unit: 'users', trend: 'up', trendValue: 12, history: [12, 14, 15, 16, 17, 18] },
    { name: 'SMS Credits', current: 2150, limit: 2500, unit: 'credits', trend: 'up', trendValue: 18, history: [1200, 1400, 1650, 1800, 1980, 2150] },
    { name: 'Storage', current: 18.5, limit: 25, unit: 'GB', trend: 'up', trendValue: 8, history: [12, 14, 15, 16, 17, 18.5] },
    { name: 'API Calls', current: 45000, limit: 100000, unit: 'calls', trend: 'up', trendValue: 22, history: [28000, 32000, 36000, 40000, 42000, 45000] },
    { name: 'Franchises', current: 2, limit: 3, unit: 'locations', trend: 'stable', trendValue: 0, history: [1, 1, 2, 2, 2, 2] }
  ];

  franchiseUsage = [
    { name: 'Manhattan Central', location: 'New York, NY', adminSeats: 2, technicians: 8, smsUsed: 890, storage: '8.2 GB', apiCalls: 18500 },
    { name: 'Brooklyn Heights', location: 'Brooklyn, NY', adminSeats: 1, technicians: 6, smsUsed: 720, storage: '6.1 GB', apiCalls: 15200 },
    { name: 'Queens Village', location: 'Queens, NY', adminSeats: 0, technicians: 4, smsUsed: 540, storage: '4.2 GB', apiCalls: 11300 }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  isString(value: boolean | string): boolean {
    return typeof value === 'string';
  }

  get filteredInvoices(): Invoice[] {
    return this.invoices.filter(invoice => {
      if (this.invoiceFilter.status !== 'all' && invoice.status !== this.invoiceFilter.status) {
        return false;
      }
      if (this.invoiceFilter.search) {
        const search = this.invoiceFilter.search.toLowerCase();
        return invoice.number.toLowerCase().includes(search) ||
               invoice.description.toLowerCase().includes(search);
      }
      return true;
    });
  }

  getUsagePercent(metric: UsageMetric): number {
    if (typeof metric.limit === 'string') return 0;
    return (metric.current / metric.limit) * 100;
  }

  getMaxHistory(metric: UsageMetric): number {
    return Math.max(...metric.history);
  }

  getInvoiceStatusVariant(status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'secondary';
      default: return 'secondary';
    }
  }

  openBillingPortal(): void {
    console.log('Opening Stripe billing portal...');
  }

  addPaymentMethod(): void {
    console.log('Opening add payment method modal...');
  }

  editPaymentMethod(method: PaymentMethod): void {
    console.log('Editing payment method:', method.id);
  }

  deletePaymentMethod(method: PaymentMethod): void {
    console.log('Deleting payment method:', method.id);
  }

  setDefaultPaymentMethod(method: PaymentMethod): void {
    console.log('Setting default payment method:', method.id);
  }

  editBillingAddress(): void {
    console.log('Editing billing address...');
  }

  editTaxInfo(): void {
    console.log('Editing tax information...');
  }

  viewInvoice(invoice: Invoice): void {
    console.log('Viewing invoice:', invoice.number);
  }

  downloadInvoice(invoice: Invoice): void {
    console.log('Downloading invoice:', invoice.number);
  }

  downloadAllInvoices(): void {
    console.log('Downloading all invoices...');
  }

  retryPayment(invoice: Invoice): void {
    console.log('Retrying payment for invoice:', invoice.number);
  }

  cancelSubscription(): void {
    console.log('Opening cancel subscription confirmation...');
  }
}
