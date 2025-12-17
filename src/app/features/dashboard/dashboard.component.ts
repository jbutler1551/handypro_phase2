import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TenantService } from '@core/services/tenant.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
}

interface RecentJob {
  id: string;
  title: string;
  customer: string;
  status: string;
  date: string;
  amount: number;
}

@Component({
  selector: 'hp-dashboard',
  template: `
    <div class="hp-dashboard">
      <!-- Welcome Section -->
      <div class="hp-dashboard__welcome">
        <div class="hp-dashboard__welcome-text">
          <h1 class="hp-dashboard__title">Welcome back, {{ userName$ | async }}!</h1>
          <p class="hp-dashboard__subtitle">Here's what's happening with your business today.</p>
        </div>
        <hp-button variant="primary" routerLink="/jobs/new">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-right: 8px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Job
        </hp-button>
      </div>

      <!-- Stats Grid -->
      <div class="hp-dashboard__stats">
        <hp-stat-card
          label="Today's Jobs"
          [value]="8"
          [trend]="12"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>'
        ></hp-stat-card>

        <hp-stat-card
          label="Revenue This Month"
          [value]="12450"
          format="currency"
          [trend]="8.5"
          trendLabel="vs last month"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
        ></hp-stat-card>

        <hp-stat-card
          label="New Customers"
          [value]="23"
          [trend]="-4"
          trendLabel="vs last month"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
        ></hp-stat-card>

        <hp-stat-card
          label="Pending Invoices"
          [value]="3250"
          format="currency"
          actionLabel="invoices"
          [actionCount]="4"
          actionLink="/invoices"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
        ></hp-stat-card>
      </div>

      <!-- Quick Actions -->
      <div class="hp-dashboard__section">
        <h2 class="hp-dashboard__section-title">Quick Actions</h2>
        <div class="hp-dashboard__quick-actions">
          <a
            *ngFor="let action of quickActions"
            [routerLink]="action.route"
            class="hp-dashboard__action-card"
            [style.--action-color]="action.color"
          >
            <div class="hp-dashboard__action-icon" [innerHTML]="sanitizeHtml(action.icon)"></div>
            <span class="hp-dashboard__action-label">{{ action.label }}</span>
          </a>
        </div>
      </div>

      <!-- Recent Jobs & Activity -->
      <div class="hp-dashboard__grid">
        <!-- Recent Jobs -->
        <hp-card class="hp-dashboard__card">
          <div class="hp-dashboard__card-header">
            <h3 class="hp-dashboard__card-title">Recent Jobs</h3>
            <a routerLink="/jobs" class="hp-dashboard__view-all">View all</a>
          </div>
          <div class="hp-dashboard__jobs">
            <div *ngFor="let job of recentJobs" class="hp-dashboard__job">
              <div class="hp-dashboard__job-info">
                <span class="hp-dashboard__job-title">{{ job.title }}</span>
                <span class="hp-dashboard__job-customer">{{ job.customer }}</span>
              </div>
              <div class="hp-dashboard__job-meta">
                <hp-badge [variant]="getJobStatusVariant(job.status)" size="sm">
                  {{ job.status }}
                </hp-badge>
                <span class="hp-dashboard__job-amount">\${{ job.amount }}</span>
              </div>
            </div>
          </div>
        </hp-card>

        <!-- Activity Feed -->
        <hp-card class="hp-dashboard__card">
          <div class="hp-dashboard__card-header">
            <h3 class="hp-dashboard__card-title">Recent Activity</h3>
          </div>
          <div class="hp-dashboard__activity">
            <div *ngFor="let activity of activities" class="hp-dashboard__activity-item">
              <div class="hp-dashboard__activity-icon" [innerHTML]="sanitizeHtml(activity.icon)"></div>
              <div class="hp-dashboard__activity-content">
                <p class="hp-dashboard__activity-text">{{ activity.text }}</p>
                <span class="hp-dashboard__activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-dashboard {
      &__welcome {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-8);
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
        transition: color 200ms ease-in-out;
      }

      &__subtitle {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-tertiary);
        margin: 0;
        transition: color 200ms ease-in-out;
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-6);
        margin-bottom: var(--hp-spacing-8);

        @media (max-width: 1199px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__section {
        margin-bottom: var(--hp-spacing-8);
      }

      &__section-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-4);
        transition: color 200ms ease-in-out;
      }

      &__quick-actions {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 991px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__action-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-5);
        background-color: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-base);
        text-decoration: none;
        transition: border-color var(--hp-micro-normal) ease-in-out,
                    box-shadow var(--hp-micro-normal) ease-in-out,
                    background-color 200ms ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-sm));
          -webkit-backdrop-filter: blur(var(--hp-blur-sm));
        }

        &:hover {
          border-color: var(--action-color);
          box-shadow: 0 4px 20px color-mix(in srgb, var(--action-color) 20%, transparent),
                      0 0 0 1px color-mix(in srgb, var(--action-color) 30%, transparent);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0) scale(0.99);
        }
      }

      &__action-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        background-color: color-mix(in srgb, var(--action-color) 12%, transparent);
        border-radius: var(--hp-radius-modern-sm);
        color: var(--action-color);
        transition: transform var(--hp-micro-fast) ease-out,
                    background-color var(--hp-micro-normal) ease-in-out;

        svg {
          width: 24px;
          height: 24px;
        }
      }

      &__action-card:hover &__action-icon {
        transform: scale(1.05);
        background-color: color-mix(in srgb, var(--action-color) 18%, transparent);
      }

      &__action-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        transition: color 200ms ease-in-out;
      }

      &__action-card:hover &__action-label {
        color: var(--hp-text-primary);
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-6);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      &__card {
        height: fit-content;
      }

      &__card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-5);
      }

      &__card-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0;
        transition: color 200ms ease-in-out;
      }

      &__view-all {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-link);
        text-decoration: none;
        font-weight: var(--hp-font-weight-medium);
        transition: color 200ms ease-in-out;

        &:hover {
          color: var(--hp-text-link-hover);
          text-decoration: underline;
        }
      }

      &__jobs {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__job {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-border-primary);

        &:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }
      }

      &__job-info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__job-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
        transition: color 200ms ease-in-out;
      }

      &__job-customer {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }

      &__job-meta {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__job-amount {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        transition: color 200ms ease-in-out;
      }

      &__activity {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__activity-item {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__activity-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background-color: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-full);
        color: var(--hp-text-secondary);
        flex-shrink: 0;
        border: 1px solid var(--hp-glass-border);
        transition: background-color 200ms ease-in-out,
                    color 200ms ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__activity-item:hover &__activity-icon {
        background-color: var(--hp-glass-bg);
        color: var(--hp-color-primary);
        transform: scale(1.05);
      }

      &__activity-content {
        flex: 1;
      }

      &__activity-text {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0 0 var(--hp-spacing-1);
        transition: color 200ms ease-in-out;
      }

      &__activity-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-disabled);
        transition: color 200ms ease-in-out;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  userName$!: Observable<string>;

  quickActions: QuickAction[] = [
    {
      label: 'Create Job',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      route: '/jobs/new',
      color: '#2196F3'
    },
    {
      label: 'Add Customer',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
      route: '/customers/new',
      color: '#4CAF50'
    },
    {
      label: 'Create Invoice',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
      route: '/invoices/new',
      color: '#FF9800'
    },
    {
      label: 'View Reports',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      route: '/reports',
      color: '#9C27B0'
    }
  ];

  recentJobs: RecentJob[] = [
    { id: '1', title: 'Kitchen Faucet Repair', customer: 'John Smith', status: 'In Progress', date: 'Today', amount: 185 },
    { id: '2', title: 'Electrical Outlet Install', customer: 'Sarah Johnson', status: 'Scheduled', date: 'Tomorrow', amount: 120 },
    { id: '3', title: 'HVAC Maintenance', customer: 'Mike Davis', status: 'Completed', date: 'Yesterday', amount: 350 },
    { id: '4', title: 'Drywall Repair', customer: 'Emily Brown', status: 'Pending', date: '2 days ago', amount: 225 }
  ];

  activities = [
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>', text: 'Job #1234 was completed by Mike', time: '2 minutes ago' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>', text: 'Invoice #5678 was paid ($350)', time: '1 hour ago' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>', text: 'New customer Sarah Johnson added', time: '3 hours ago' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', text: 'Job scheduled for tomorrow at 9 AM', time: '5 hours ago' }
  ];

  constructor(
    private tenantService: TenantService,
    private sanitizer: DomSanitizer
  ) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngOnInit(): void {
    this.userName$ = this.tenantService.tenant$.pipe(
      map(tenant => tenant?.name?.split(' ')[0] || 'there')
    );
  }

  getJobStatusVariant(status: string): 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'error' | 'neutral' {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'primary';
      case 'scheduled': return 'info';
      case 'pending': return 'warning';
      default: return 'neutral';
    }
  }
}
