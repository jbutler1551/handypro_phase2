import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hp-invoice-detail',
  template: `
    <div class="hp-invoice-detail">
      <div class="hp-invoice-detail__header">
        <button class="hp-invoice-detail__back" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Invoices
        </button>
        <div class="hp-invoice-detail__title-row">
          <h1 class="hp-invoice-detail__title">Invoice {{ invoice.number }}</h1>
          <hp-badge [variant]="getStatusVariant(invoice.status)" size="lg">{{ invoice.status | titlecase }}</hp-badge>
        </div>
      </div>

      <div class="hp-invoice-detail__content">
        <div class="hp-invoice-detail__main">
          <hp-card class="hp-invoice-detail__invoice">
            <div class="hp-invoice-detail__invoice-header">
              <div class="hp-invoice-detail__company">
                <h2>Acme Plumbing Co.</h2>
                <p>123 Business St, Springfield, IL 62701</p>
                <p>Phone: (555) 123-4567</p>
              </div>
              <div class="hp-invoice-detail__meta">
                <div><strong>Invoice #:</strong> {{ invoice.number }}</div>
                <div><strong>Date:</strong> {{ invoice.createdAt }}</div>
                <div><strong>Due Date:</strong> {{ invoice.dueDate }}</div>
              </div>
            </div>

            <div class="hp-invoice-detail__bill-to">
              <h3>Bill To:</h3>
              <p><strong>{{ invoice.customer.name }}</strong></p>
              <p>{{ invoice.customer.address }}</p>
              <p>{{ invoice.customer.email }}</p>
            </div>

            <div class="hp-invoice-detail__job-ref">
              <strong>Job Reference:</strong> {{ invoice.job.number }} - {{ invoice.job.title }}
            </div>

            <table class="hp-invoice-detail__items">
              <thead>
                <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of invoice.items">
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>\${{ item.rate | number:'1.2-2' }}</td>
                  <td>\${{ item.amount | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>

            <div class="hp-invoice-detail__totals">
              <div class="hp-invoice-detail__total-row"><span>Subtotal</span><span>\${{ invoice.subtotal | number:'1.2-2' }}</span></div>
              <div class="hp-invoice-detail__total-row"><span>Tax (8%)</span><span>\${{ invoice.tax | number:'1.2-2' }}</span></div>
              <div class="hp-invoice-detail__total-row hp-invoice-detail__total-row--grand"><span>Total</span><span>\${{ invoice.total | number:'1.2-2' }}</span></div>
            </div>

            <div *ngIf="invoice.notes" class="hp-invoice-detail__notes">
              <strong>Notes:</strong>
              <p>{{ invoice.notes }}</p>
            </div>
          </hp-card>
        </div>

        <div class="hp-invoice-detail__sidebar">
          <hp-card>
            <h3 class="hp-invoice-detail__card-title">Actions</h3>
            <div class="hp-invoice-detail__actions">
              <hp-button variant="primary" [fullWidth]="true">Send Invoice</hp-button>
              <hp-button variant="outline" [fullWidth]="true">Download PDF</hp-button>
              <hp-button variant="outline" [fullWidth]="true">Record Payment</hp-button>
              <hp-button variant="outline" [fullWidth]="true">Edit Invoice</hp-button>
            </div>
          </hp-card>

          <hp-card>
            <h3 class="hp-invoice-detail__card-title">Payment History</h3>
            <div class="hp-invoice-detail__payments">
              <div *ngFor="let payment of payments" class="hp-invoice-detail__payment">
                <div class="hp-invoice-detail__payment-info">
                  <span class="hp-invoice-detail__payment-date">{{ payment.date }}</span>
                  <span class="hp-invoice-detail__payment-method">{{ payment.method }}</span>
                </div>
                <span class="hp-invoice-detail__payment-amount">\${{ payment.amount | number:'1.2-2' }}</span>
              </div>
              <div *ngIf="payments.length === 0" class="hp-invoice-detail__no-payments">No payments recorded</div>
            </div>
          </hp-card>

          <hp-card>
            <h3 class="hp-invoice-detail__card-title">Activity</h3>
            <div class="hp-invoice-detail__activity">
              <div *ngFor="let activity of activities" class="hp-invoice-detail__activity-item">
                <span class="hp-invoice-detail__activity-date">{{ activity.date }}</span>
                <span class="hp-invoice-detail__activity-text">{{ activity.text }}</span>
              </div>
            </div>
          </hp-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-invoice-detail {
      &__header { margin-bottom: var(--hp-spacing-6); }
      &__back { display: inline-flex; align-items: center; gap: var(--hp-spacing-1); padding: 0; background: none; border: none; font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); cursor: pointer; margin-bottom: var(--hp-spacing-3); svg { width: 18px; height: 18px; } &:hover { color: var(--hp-color-primary); } }
      &__title-row { display: flex; align-items: center; gap: var(--hp-spacing-3); }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); margin: 0; }
      &__content { display: grid; grid-template-columns: 1fr 320px; gap: var(--hp-spacing-6); @media (max-width: 991px) { grid-template-columns: 1fr; } }
      &__main { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__sidebar { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__invoice { padding: var(--hp-spacing-6) !important; }
      &__invoice-header { display: flex; justify-content: space-between; margin-bottom: var(--hp-spacing-6); padding-bottom: var(--hp-spacing-6); border-bottom: 1px solid var(--hp-color-neutral-200); }
      &__company { h2 { font-size: var(--hp-font-size-xl); margin: 0 0 var(--hp-spacing-2); } p { margin: 0; font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-600); } }
      &__meta { text-align: right; font-size: var(--hp-font-size-sm); div { margin-bottom: var(--hp-spacing-1); } }
      &__bill-to { margin-bottom: var(--hp-spacing-6); h3 { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); margin: 0 0 var(--hp-spacing-2); } p { margin: 0 0 var(--hp-spacing-1); font-size: var(--hp-font-size-sm); } }
      &__job-ref { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-600); margin-bottom: var(--hp-spacing-6); padding: var(--hp-spacing-3); background-color: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); }
      &__items { width: 100%; border-collapse: collapse; margin-bottom: var(--hp-spacing-6); th, td { padding: var(--hp-spacing-3); text-align: left; border-bottom: 1px solid var(--hp-color-neutral-200); } th { font-size: var(--hp-font-size-xs); font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-neutral-500); text-transform: uppercase; background-color: var(--hp-color-neutral-50); } td { font-size: var(--hp-font-size-sm); } th:last-child, td:last-child { text-align: right; } }
      &__totals { display: flex; flex-direction: column; align-items: flex-end; gap: var(--hp-spacing-2); margin-bottom: var(--hp-spacing-6); }
      &__total-row { display: flex; justify-content: space-between; width: 200px; font-size: var(--hp-font-size-sm); &--grand { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-bold); padding-top: var(--hp-spacing-2); border-top: 2px solid var(--hp-color-neutral-900); } }
      &__notes { padding: var(--hp-spacing-4); background-color: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); font-size: var(--hp-font-size-sm); p { margin: var(--hp-spacing-2) 0 0; color: var(--hp-color-neutral-600); } }
      &__card-title { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); margin: 0 0 var(--hp-spacing-4); }
      &__actions { display: flex; flex-direction: column; gap: var(--hp-spacing-2); }
      &__payments, &__activity { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__payment { display: flex; justify-content: space-between; align-items: center; }
      &__payment-info { display: flex; flex-direction: column; gap: 2px; }
      &__payment-date { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); }
      &__payment-method { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); }
      &__payment-amount { font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-success); }
      &__no-payments { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-400); text-align: center; padding: var(--hp-spacing-4); }
      &__activity-item { display: flex; flex-direction: column; gap: 2px; padding-bottom: var(--hp-spacing-2); border-bottom: 1px solid var(--hp-color-neutral-100); &:last-child { border: none; } }
      &__activity-date { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-400); }
      &__activity-text { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-700); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailComponent {
  invoice = {
    id: '1', number: 'INV-001', status: 'sent', createdAt: 'December 15, 2024', dueDate: 'December 30, 2024',
    customer: { name: 'John Smith', email: 'john@email.com', address: '123 Oak Street, Apt 4B, Springfield, IL 62701' },
    job: { number: 'JOB-001', title: 'Water Heater Replacement' },
    items: [
      { description: 'Rheem Tankless Water Heater', quantity: 1, rate: 1800, amount: 1800 },
      { description: 'Gas Line Fittings', quantity: 1, rate: 150, amount: 150 },
      { description: 'Venting Kit', quantity: 1, rate: 200, amount: 200 },
      { description: 'Labor', quantity: 3, rate: 200, amount: 600 }
    ],
    subtotal: 2750, tax: 220, total: 2970,
    notes: 'Thank you for your business! Payment is due within 15 days.'
  };

  payments: any[] = [];
  activities = [
    { date: 'Dec 15, 2024 3:45 PM', text: 'Invoice created' },
    { date: 'Dec 15, 2024 4:00 PM', text: 'Invoice sent to john@email.com' }
  ];

  constructor(private router: Router) {}
  goBack(): void { this.router.navigate(['/invoices']); }
  getStatusVariant(status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' { const v: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'> = { draft: 'neutral', sent: 'info', paid: 'success', overdue: 'error' }; return v[status] || 'neutral'; }
}
