import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hp-customer-detail',
  template: `
    <div class="hp-customer-detail">
      <div class="hp-customer-detail__header">
        <button class="hp-customer-detail__back" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Customers
        </button>
        <div class="hp-customer-detail__title-row">
          <div class="hp-customer-detail__avatar">{{ getInitials(customer.name) }}</div>
          <div>
            <h1 class="hp-customer-detail__title">{{ customer.name }}</h1>
            <div class="hp-customer-detail__badges">
              <hp-badge variant="info">{{ customer.type | titlecase }}</hp-badge>
              <hp-badge variant="success">{{ customer.status | titlecase }}</hp-badge>
            </div>
          </div>
        </div>
      </div>

      <div class="hp-customer-detail__content">
        <div class="hp-customer-detail__main">
          <!-- Stats -->
          <div class="hp-customer-detail__stats">
            <hp-card class="hp-customer-detail__stat-card">
              <span class="hp-customer-detail__stat-value">{{ customer.totalJobs }}</span>
              <span class="hp-customer-detail__stat-label">Total Jobs</span>
            </hp-card>
            <hp-card class="hp-customer-detail__stat-card">
              <span class="hp-customer-detail__stat-value">\${{ customer.totalSpent | number }}</span>
              <span class="hp-customer-detail__stat-label">Total Spent</span>
            </hp-card>
            <hp-card class="hp-customer-detail__stat-card">
              <span class="hp-customer-detail__stat-value">{{ customer.avgJobValue | currency }}</span>
              <span class="hp-customer-detail__stat-label">Avg Job Value</span>
            </hp-card>
            <hp-card class="hp-customer-detail__stat-card">
              <span class="hp-customer-detail__stat-value">{{ customer.lastService }}</span>
              <span class="hp-customer-detail__stat-label">Last Service</span>
            </hp-card>
          </div>

          <!-- Job History -->
          <hp-card>
            <div class="hp-customer-detail__section-header">
              <h2 class="hp-customer-detail__section-title">Job History</h2>
              <hp-button variant="outline" size="sm">View All</hp-button>
            </div>
            <div class="hp-customer-detail__jobs">
              <div *ngFor="let job of recentJobs" class="hp-customer-detail__job">
                <div class="hp-customer-detail__job-info">
                  <span class="hp-customer-detail__job-number">{{ job.number }}</span>
                  <span class="hp-customer-detail__job-title">{{ job.title }}</span>
                </div>
                <div class="hp-customer-detail__job-meta">
                  <span class="hp-customer-detail__job-date">{{ job.date }}</span>
                  <hp-badge [variant]="job.status === 'completed' ? 'success' : 'warning'" size="sm">
                    {{ job.status | titlecase }}
                  </hp-badge>
                  <span class="hp-customer-detail__job-amount">\${{ job.amount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </hp-card>

          <!-- Invoices -->
          <hp-card>
            <div class="hp-customer-detail__section-header">
              <h2 class="hp-customer-detail__section-title">Invoices</h2>
              <hp-button variant="outline" size="sm">Create Invoice</hp-button>
            </div>
            <div class="hp-customer-detail__invoices">
              <div *ngFor="let invoice of invoices" class="hp-customer-detail__invoice">
                <div class="hp-customer-detail__invoice-info">
                  <span class="hp-customer-detail__invoice-number">{{ invoice.number }}</span>
                  <span class="hp-customer-detail__invoice-date">{{ invoice.date }}</span>
                </div>
                <div class="hp-customer-detail__invoice-meta">
                  <hp-badge [variant]="invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'error' : 'warning'" size="sm">
                    {{ invoice.status | titlecase }}
                  </hp-badge>
                  <span class="hp-customer-detail__invoice-amount">\${{ invoice.amount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </hp-card>
        </div>

        <div class="hp-customer-detail__sidebar">
          <!-- Contact Info -->
          <hp-card>
            <h3 class="hp-customer-detail__card-title">Contact Information</h3>
            <div class="hp-customer-detail__contact-list">
              <div class="hp-customer-detail__contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href="mailto:{{ customer.email }}">{{ customer.email }}</a>
              </div>
              <div class="hp-customer-detail__contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href="tel:{{ customer.phone }}">{{ customer.phone }}</a>
              </div>
              <div class="hp-customer-detail__contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ customer.address }}<br>{{ customer.city }}, {{ customer.state }} {{ customer.zipCode }}</span>
              </div>
            </div>
            <hp-button variant="outline" size="sm" [fullWidth]="true">Edit Customer</hp-button>
          </hp-card>

          <!-- Notes -->
          <hp-card>
            <h3 class="hp-customer-detail__card-title">Notes</h3>
            <div class="hp-customer-detail__notes">
              <div *ngFor="let note of notes" class="hp-customer-detail__note">
                <p>{{ note.content }}</p>
                <span>{{ note.date }} by {{ note.author }}</span>
              </div>
            </div>
            <hp-button variant="outline" size="sm" [fullWidth]="true">Add Note</hp-button>
          </hp-card>

          <!-- Quick Actions -->
          <hp-card>
            <h3 class="hp-customer-detail__card-title">Quick Actions</h3>
            <div class="hp-customer-detail__actions">
              <hp-button variant="primary" [fullWidth]="true">Create Job</hp-button>
              <hp-button variant="outline" [fullWidth]="true">Send Message</hp-button>
              <hp-button variant="outline" [fullWidth]="true">Create Quote</hp-button>
            </div>
          </hp-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-customer-detail {
      &__header { margin-bottom: var(--hp-spacing-6); }
      &__back {
        display: inline-flex; align-items: center; gap: var(--hp-spacing-1);
        padding: 0; background: none; border: none; font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500); cursor: pointer; margin-bottom: var(--hp-spacing-3);
        svg { width: 18px; height: 18px; }
        &:hover { color: var(--hp-color-primary); }
      }
      &__title-row { display: flex; align-items: center; gap: var(--hp-spacing-4); }
      &__avatar {
        width: 64px; height: 64px; border-radius: 50%; background-color: var(--hp-color-primary);
        color: white; font-size: var(--hp-font-size-xl); font-weight: var(--hp-font-weight-bold);
        display: flex; align-items: center; justify-content: center;
      }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); margin: 0 0 var(--hp-spacing-2); }
      &__badges { display: flex; gap: var(--hp-spacing-2); }
      &__content { display: grid; grid-template-columns: 1fr 340px; gap: var(--hp-spacing-6); @media (max-width: 991px) { grid-template-columns: 1fr; } }
      &__main { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__sidebar { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); @media (max-width: 767px) { grid-template-columns: repeat(2, 1fr); } }
      &__stat-card { text-align: center; padding: var(--hp-spacing-4) !important; }
      &__stat-value { display: block; font-size: var(--hp-font-size-xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-color-neutral-900); }
      &__stat-label { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); }
      &__section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--hp-spacing-4); }
      &__section-title { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-semibold); margin: 0; }
      &__card-title { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); margin: 0 0 var(--hp-spacing-4); }
      &__jobs, &__invoices { display: flex; flex-direction: column; }
      &__job, &__invoice { display: flex; justify-content: space-between; align-items: center; padding: var(--hp-spacing-3) 0; border-bottom: 1px solid var(--hp-color-neutral-100); &:last-child { border: none; } }
      &__job-info, &__invoice-info { display: flex; flex-direction: column; gap: 2px; }
      &__job-number, &__invoice-number { font-family: var(--hp-font-family-mono); font-size: var(--hp-font-size-sm); color: var(--hp-color-primary); }
      &__job-title { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-700); }
      &__job-date, &__invoice-date { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); }
      &__job-meta, &__invoice-meta { display: flex; align-items: center; gap: var(--hp-spacing-3); }
      &__job-amount, &__invoice-amount { font-weight: var(--hp-font-weight-semibold); }
      &__contact-list { display: flex; flex-direction: column; gap: var(--hp-spacing-3); margin-bottom: var(--hp-spacing-4); }
      &__contact-item { display: flex; gap: var(--hp-spacing-2); font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-600); svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--hp-color-neutral-400); } a { color: var(--hp-color-primary); text-decoration: none; &:hover { text-decoration: underline; } } }
      &__notes { display: flex; flex-direction: column; gap: var(--hp-spacing-3); margin-bottom: var(--hp-spacing-4); }
      &__note { padding: var(--hp-spacing-3); background-color: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); p { font-size: var(--hp-font-size-sm); margin: 0 0 var(--hp-spacing-2); } span { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-400); } }
      &__actions { display: flex; flex-direction: column; gap: var(--hp-spacing-2); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDetailComponent {
  customer = {
    id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567',
    address: '123 Oak Street, Apt 4B', city: 'Springfield', state: 'IL', zipCode: '62701',
    type: 'residential', status: 'active', totalJobs: 8, totalSpent: 4250, avgJobValue: 531.25, lastService: 'Dec 15, 2024'
  };

  recentJobs = [
    { number: 'JOB-001', title: 'Water Heater Replacement', date: 'Dec 15, 2024', status: 'completed', amount: 2850 },
    { number: 'JOB-098', title: 'Faucet Repair', date: 'Nov 20, 2024', status: 'completed', amount: 175 },
    { number: 'JOB-087', title: 'Drain Cleaning', date: 'Oct 5, 2024', status: 'completed', amount: 225 },
  ];

  invoices = [
    { number: 'INV-001', date: 'Dec 15, 2024', status: 'paid', amount: 2850 },
    { number: 'INV-098', date: 'Nov 20, 2024', status: 'paid', amount: 175 },
    { number: 'INV-087', date: 'Oct 5, 2024', status: 'paid', amount: 225 },
  ];

  notes = [
    { content: 'Customer prefers morning appointments.', date: 'Dec 10, 2024', author: 'Mike W.' },
    { content: 'Has a dog - please call before arriving.', date: 'Nov 15, 2024', author: 'Sarah J.' },
  ];

  constructor(private router: Router) {}

  goBack(): void { this.router.navigate(['/customers']); }
  getInitials(name: string): string { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
}
