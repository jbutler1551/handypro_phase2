import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

interface Invoice {
  id: string;
  number: string;
  customer: { name: string; email: string };
  job: { number: string; title: string };
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

@Component({
  selector: 'hp-invoices-list',
  template: `
    <div class="hp-invoices">
      <div class="hp-invoices__header">
        <div class="hp-invoices__header-left">
          <h1 class="hp-invoices__title">Invoices</h1>
          <p class="hp-invoices__subtitle">Manage billing and payments</p>
        </div>
        <hp-button variant="primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Invoice
        </hp-button>
      </div>

      <div class="hp-invoices__stats">
        <div class="hp-invoices__stat">
          <span class="hp-invoices__stat-value">\${{ stats.outstanding | number }}</span>
          <span class="hp-invoices__stat-label">Outstanding</span>
        </div>
        <div class="hp-invoices__stat">
          <span class="hp-invoices__stat-value">\${{ stats.overdue | number }}</span>
          <span class="hp-invoices__stat-label hp-invoices__stat-label--error">Overdue</span>
        </div>
        <div class="hp-invoices__stat">
          <span class="hp-invoices__stat-value">\${{ stats.paidThisMonth | number }}</span>
          <span class="hp-invoices__stat-label">Paid This Month</span>
        </div>
        <div class="hp-invoices__stat">
          <span class="hp-invoices__stat-value">{{ stats.avgDaysToPayment }}</span>
          <span class="hp-invoices__stat-label">Avg Days to Payment</span>
        </div>
      </div>

      <hp-card class="hp-invoices__filters">
        <div class="hp-invoices__filters-row">
          <div class="hp-invoices__search">
            <hp-input placeholder="Search invoices..." [(ngModel)]="searchQuery" type="search"></hp-input>
          </div>
          <div class="hp-invoices__filter-group">
            <select [(ngModel)]="statusFilter" class="hp-invoices__select">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select [(ngModel)]="dateFilter" class="hp-invoices__select">
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </hp-card>

      <hp-card class="hp-invoices__table-card">
        <div class="hp-invoices__table-wrapper">
          <table class="hp-invoices__table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Job</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invoice of filteredInvoices" (click)="viewInvoice(invoice)" class="hp-invoices__row">
                <td><span class="hp-invoices__number">{{ invoice.number }}</span></td>
                <td>
                  <div class="hp-invoices__customer">
                    <span class="hp-invoices__customer-name">{{ invoice.customer.name }}</span>
                    <span class="hp-invoices__customer-email">{{ invoice.customer.email }}</span>
                  </div>
                </td>
                <td>
                  <div class="hp-invoices__job">
                    <span class="hp-invoices__job-number">{{ invoice.job.number }}</span>
                    <span class="hp-invoices__job-title">{{ invoice.job.title }}</span>
                  </div>
                </td>
                <td><span class="hp-invoices__amount">\${{ invoice.amount | number:'1.2-2' }}</span></td>
                <td><hp-badge [variant]="getStatusVariant(invoice.status)">{{ invoice.status | titlecase }}</hp-badge></td>
                <td><span [class.hp-invoices__overdue]="invoice.status === 'overdue'">{{ invoice.dueDate }}</span></td>
                <td>
                  <button class="hp-invoices__menu-btn" (click)="openMenu($event, invoice)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-invoices {
      &__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--hp-spacing-6); @media (max-width: 575px) { flex-direction: column; gap: var(--hp-spacing-4); } }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); transition: color 200ms ease-in-out; }
      &__subtitle { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); margin: 0; transition: color 200ms ease-in-out; }
      &__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); margin-bottom: var(--hp-spacing-6); @media (max-width: 767px) { grid-template-columns: repeat(2, 1fr); } }
      &__stat { background-color: var(--hp-surface-card); border-radius: var(--hp-radius-lg); padding: var(--hp-spacing-4); transition: background-color 200ms ease-in-out; }
      &__stat-value { display: block; font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__stat-label { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; &--error { color: var(--hp-color-error); } }
      &__filters { margin-bottom: var(--hp-spacing-4); }
      &__filters-row { display: flex; gap: var(--hp-spacing-4); align-items: center; @media (max-width: 767px) { flex-direction: column; align-items: stretch; } }
      &__search { flex: 1; min-width: 200px; }
      &__filter-group { display: flex; gap: var(--hp-spacing-3); }
      &__select { height: 44px; padding: 0 var(--hp-spacing-3); border: 1px solid var(--hp-input-border); border-radius: var(--hp-radius-md); background-color: var(--hp-input-bg); color: var(--hp-text-primary); font-size: var(--hp-font-size-sm); min-width: 140px; transition: background-color 200ms, border-color 200ms, color 200ms; }
      &__table-wrapper { overflow-x: auto; }
      &__table { width: 100%; border-collapse: collapse; th, td { padding: var(--hp-spacing-3) var(--hp-spacing-4); text-align: left; white-space: nowrap; transition: background-color 200ms, color 200ms, border-color 200ms; } th { font-size: var(--hp-font-size-xs); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-tertiary); text-transform: uppercase; background-color: var(--hp-bg-tertiary); border-bottom: 1px solid var(--hp-border-primary); } td { font-size: var(--hp-font-size-sm); color: var(--hp-text-primary); border-bottom: 1px solid var(--hp-border-primary); } }
      &__row { cursor: pointer; transition: background-color 150ms; &:hover { background-color: var(--hp-bg-tertiary); } }
      &__number { font-family: var(--hp-font-family-mono); font-weight: var(--hp-font-weight-medium); color: var(--hp-color-primary); }
      &__customer, &__job { display: flex; flex-direction: column; gap: 2px; }
      &__customer-name, &__job-number { font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__customer-email, &__job-title { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__amount { font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__overdue { color: var(--hp-color-error); font-weight: var(--hp-font-weight-medium); }
      &__menu-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; background: none; border: none; border-radius: var(--hp-radius-md); color: var(--hp-text-tertiary); cursor: pointer; transition: background-color 200ms, color 200ms; &:hover { background-color: var(--hp-bg-tertiary); color: var(--hp-text-secondary); } svg { width: 18px; height: 18px; } }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicesListComponent {
  searchQuery = '';
  statusFilter = '';
  dateFilter = 'all';

  stats = { outstanding: 12450, overdue: 3200, paidThisMonth: 28500, avgDaysToPayment: 12 };

  invoices: Invoice[] = [
    { id: '1', number: 'INV-001', customer: { name: 'John Smith', email: 'john@email.com' }, job: { number: 'JOB-001', title: 'Water Heater Replacement' }, amount: 2850, status: 'sent', dueDate: 'Dec 30, 2024', createdAt: '2024-12-15' },
    { id: '2', number: 'INV-002', customer: { name: 'Acme Corporation', email: 'billing@acme.com' }, job: { number: 'JOB-045', title: 'Quarterly Maintenance' }, amount: 4500, status: 'paid', dueDate: 'Dec 10, 2024', createdAt: '2024-12-01', paidAt: '2024-12-08' },
    { id: '3', number: 'INV-003', customer: { name: 'Sarah Johnson', email: 'sarah@email.com' }, job: { number: 'JOB-002', title: 'Kitchen Faucet Install' }, amount: 650, status: 'draft', dueDate: 'Jan 5, 2025', createdAt: '2024-12-17' },
    { id: '4', number: 'INV-004', customer: { name: 'Robert Davis', email: 'rdavis@email.com' }, job: { number: 'JOB-003', title: 'Drain Cleaning' }, amount: 275, status: 'overdue', dueDate: 'Dec 5, 2024', createdAt: '2024-11-20' },
    { id: '5', number: 'INV-005', customer: { name: 'Springfield Mall', email: 'maintenance@mall.com' }, job: { number: 'JOB-089', title: 'Emergency Repair' }, amount: 1200, status: 'paid', dueDate: 'Dec 15, 2024', createdAt: '2024-12-10', paidAt: '2024-12-12' },
    { id: '6', number: 'INV-006', customer: { name: 'Lisa Anderson', email: 'lisa@email.com' }, job: { number: 'JOB-004', title: 'Pipe Repair' }, amount: 1200, status: 'sent', dueDate: 'Dec 25, 2024', createdAt: '2024-12-17' },
  ];

  get filteredInvoices(): Invoice[] {
    return this.invoices.filter(inv => {
      const matchesSearch = !this.searchQuery || inv.number.toLowerCase().includes(this.searchQuery.toLowerCase()) || inv.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || inv.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  constructor(private router: Router) {}

  getStatusVariant(status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'> = { draft: 'neutral', sent: 'info', paid: 'success', overdue: 'error', cancelled: 'neutral' };
    return variants[status] || 'neutral';
  }

  viewInvoice(invoice: Invoice): void { this.router.navigate(['/invoices', invoice.id]); }
  openMenu(event: Event, invoice: Invoice): void { event.stopPropagation(); }
}
