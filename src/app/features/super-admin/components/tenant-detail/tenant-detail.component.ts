import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface TenantDetail {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'canceled';
  users: number;
  mrr: number;
  createdAt: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  trialEndsAt?: string;
  lastActiveAt: string;
  totalJobs: number;
  totalRevenue: number;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
}

@Component({
  selector: 'hp-tenant-detail',
  template: `
    <div class="hp-tenant-detail">
      <!-- Back Navigation -->
      <a class="hp-tenant-detail__back" routerLink="/admin/tenants">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Tenants
      </a>

      <!-- Header -->
      <div class="hp-tenant-detail__header">
        <div class="hp-tenant-detail__header-info">
          <div class="hp-tenant-detail__logo">
            <span>{{ getInitials(tenant.name) }}</span>
          </div>
          <div class="hp-tenant-detail__header-text">
            <h1 class="hp-tenant-detail__name">{{ tenant.name }}</h1>
            <span class="hp-tenant-detail__domain">{{ tenant.domain }}</span>
          </div>
          <hp-badge [variant]="getStatusVariant(tenant.status)" size="sm">
            {{ tenant.status | titlecase }}
          </hp-badge>
        </div>
        <div class="hp-tenant-detail__header-actions">
          <hp-button variant="outline" (click)="impersonate()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Login as Tenant
          </hp-button>
          <hp-button variant="danger" *ngIf="tenant.status === 'active'" (click)="suspendTenant()">
            Suspend
          </hp-button>
          <hp-button variant="primary" *ngIf="tenant.status === 'suspended'" (click)="activateTenant()">
            Activate
          </hp-button>
        </div>
      </div>

      <div class="hp-tenant-detail__content">
        <!-- Main Content -->
        <div class="hp-tenant-detail__main">
          <!-- Stats Cards -->
          <div class="hp-tenant-detail__stats">
            <div class="hp-tenant-detail__stat-card">
              <span class="hp-tenant-detail__stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              <div class="hp-tenant-detail__stat-info">
                <span class="hp-tenant-detail__stat-value">{{ tenant.users }}</span>
                <span class="hp-tenant-detail__stat-label">Team Members</span>
              </div>
            </div>
            <div class="hp-tenant-detail__stat-card">
              <span class="hp-tenant-detail__stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </span>
              <div class="hp-tenant-detail__stat-info">
                <span class="hp-tenant-detail__stat-value">{{ tenant.totalJobs.toLocaleString() }}</span>
                <span class="hp-tenant-detail__stat-label">Total Jobs</span>
              </div>
            </div>
            <div class="hp-tenant-detail__stat-card">
              <span class="hp-tenant-detail__stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
              <div class="hp-tenant-detail__stat-info">
                <span class="hp-tenant-detail__stat-value">\${{ tenant.totalRevenue.toLocaleString() }}</span>
                <span class="hp-tenant-detail__stat-label">Total Revenue</span>
              </div>
            </div>
            <div class="hp-tenant-detail__stat-card">
              <span class="hp-tenant-detail__stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>
              <div class="hp-tenant-detail__stat-info">
                <span class="hp-tenant-detail__stat-value">\${{ tenant.mrr }}/mo</span>
                <span class="hp-tenant-detail__stat-label">MRR</span>
              </div>
            </div>
          </div>

          <!-- Subscription Section -->
          <div class="hp-tenant-detail__section">
            <h2 class="hp-tenant-detail__section-title">Subscription</h2>
            <div class="hp-tenant-detail__card">
              <div class="hp-tenant-detail__subscription">
                <div class="hp-tenant-detail__subscription-plan">
                  <span class="hp-tenant-detail__plan-badge" [class]="'hp-tenant-detail__plan-badge--' + tenant.plan">
                    {{ tenant.plan | titlecase }}
                  </span>
                  <span class="hp-tenant-detail__plan-price">\${{ getPlanPrice(tenant.plan) }}/month</span>
                </div>
                <div class="hp-tenant-detail__subscription-details">
                  <div class="hp-tenant-detail__detail-row">
                    <span>Billing Cycle</span>
                    <span>Annual (20% discount)</span>
                  </div>
                  <div class="hp-tenant-detail__detail-row">
                    <span>Next Billing Date</span>
                    <span>Feb 15, 2024</span>
                  </div>
                  <div *ngIf="tenant.status === 'trial'" class="hp-tenant-detail__detail-row">
                    <span>Trial Ends</span>
                    <span class="hp-tenant-detail__trial-end">{{ tenant.trialEndsAt }}</span>
                  </div>
                </div>
                <div class="hp-tenant-detail__subscription-actions">
                  <hp-button variant="outline" size="sm">Change Plan</hp-button>
                  <hp-button variant="ghost" size="sm">View Invoices</hp-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Section -->
          <div class="hp-tenant-detail__section">
            <h2 class="hp-tenant-detail__section-title">Recent Activity</h2>
            <div class="hp-tenant-detail__card">
              <div class="hp-tenant-detail__activity-list">
                <div *ngFor="let activity of activities" class="hp-tenant-detail__activity-item">
                  <div class="hp-tenant-detail__activity-dot"></div>
                  <div class="hp-tenant-detail__activity-content">
                    <span class="hp-tenant-detail__activity-action">{{ activity.action }}</span>
                    <span class="hp-tenant-detail__activity-time">{{ activity.timestamp }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="hp-tenant-detail__sidebar">
          <!-- Contact Info -->
          <div class="hp-tenant-detail__sidebar-section">
            <h3 class="hp-tenant-detail__sidebar-title">Contact Information</h3>
            <div class="hp-tenant-detail__info-list">
              <div class="hp-tenant-detail__info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{{ tenant.email }}</span>
              </div>
              <div class="hp-tenant-detail__info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{{ tenant.phone }}</span>
              </div>
              <div class="hp-tenant-detail__info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{{ tenant.address }}</span>
              </div>
            </div>
          </div>

          <!-- Account Details -->
          <div class="hp-tenant-detail__sidebar-section">
            <h3 class="hp-tenant-detail__sidebar-title">Account Details</h3>
            <div class="hp-tenant-detail__info-list">
              <div class="hp-tenant-detail__info-row">
                <span>Created</span>
                <span>{{ formatDate(tenant.createdAt) }}</span>
              </div>
              <div class="hp-tenant-detail__info-row">
                <span>Last Active</span>
                <span>{{ tenant.lastActiveAt }}</span>
              </div>
              <div class="hp-tenant-detail__info-row">
                <span>Tenant ID</span>
                <span class="hp-tenant-detail__id">{{ tenant.id }}</span>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="hp-tenant-detail__sidebar-section hp-tenant-detail__sidebar-section--danger">
            <h3 class="hp-tenant-detail__sidebar-title">Danger Zone</h3>
            <p class="hp-tenant-detail__danger-text">
              Permanently delete this tenant and all associated data.
            </p>
            <hp-button variant="danger" [fullWidth]="true" (click)="deleteTenant()">
              Delete Tenant
            </hp-button>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .hp-tenant-detail {
      &__back {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-6);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        text-decoration: none;
        transition: color 150ms;

        &:hover {
          color: var(--hp-color-neutral-0);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-8);
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__header-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__logo {
        width: 64px;
        height: 64px;
        border-radius: var(--hp-radius-lg);
        background-color: var(--hp-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;

        span {
          font-size: var(--hp-font-size-xl);
          font-weight: var(--hp-font-weight-bold);
          color: var(--hp-color-neutral-0);
        }
      }

      &__header-text {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__name {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        margin: 0;
      }

      &__domain {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__header-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__content {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: var(--hp-spacing-6);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      &__main {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-6);
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 767px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      &__stat-card {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-primary);

        svg {
          width: 22px;
          height: 22px;
        }
      }

      &__stat-info {
        display: flex;
        flex-direction: column;
      }

      &__stat-value {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__stat-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-400);
      }

      &__section {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__section-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0;
      }

      &__card {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__subscription {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__subscription-plan {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__plan-badge {
        padding: var(--hp-spacing-1) var(--hp-spacing-3);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);

        &--starter {
          background-color: var(--hp-color-neutral-700);
          color: var(--hp-color-neutral-200);
        }

        &--professional {
          background-color: rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }

        &--enterprise {
          background-color: rgba(168, 85, 247, 0.2);
          color: #c084fc;
        }
      }

      &__plan-price {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__subscription-details {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-4) 0;
        border-top: 1px solid var(--hp-color-neutral-700);
        border-bottom: 1px solid var(--hp-color-neutral-700);
      }

      &__detail-row {
        display: flex;
        justify-content: space-between;
        font-size: var(--hp-font-size-sm);

        span:first-child {
          color: var(--hp-color-neutral-400);
        }

        span:last-child {
          color: var(--hp-color-neutral-200);
        }
      }

      &__trial-end {
        color: var(--hp-color-warning) !important;
      }

      &__subscription-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__activity-list {
        display: flex;
        flex-direction: column;
      }

      &__activity-item {
        display: flex;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) 0;
        border-bottom: 1px solid var(--hp-color-neutral-700);

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        &:first-child {
          padding-top: 0;
        }
      }

      &__activity-dot {
        width: 8px;
        height: 8px;
        margin-top: 6px;
        background-color: var(--hp-color-primary);
        border-radius: 50%;
        flex-shrink: 0;
      }

      &__activity-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__activity-action {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-200);
      }

      &__activity-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-6);
      }

      &__sidebar-section {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);

        &--danger {
          border-color: var(--hp-color-error-900);
        }
      }

      &__sidebar-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__info-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__info-item {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);

        svg {
          width: 16px;
          height: 16px;
          color: var(--hp-color-neutral-500);
          flex-shrink: 0;
          margin-top: 2px;
        }
      }

      &__info-row {
        display: flex;
        justify-content: space-between;
        font-size: var(--hp-font-size-sm);

        span:first-child {
          color: var(--hp-color-neutral-500);
        }

        span:last-child {
          color: var(--hp-color-neutral-200);
        }
      }

      &__id {
        font-family: var(--hp-font-family-mono);
        font-size: var(--hp-font-size-xs);
      }

      &__danger-text {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin: 0 0 var(--hp-spacing-4);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantDetailComponent implements OnInit {
  tenant: TenantDetail = {
    id: 'tn_1234567890',
    name: 'Acme Plumbing',
    domain: 'acme-plumbing.handypro.app',
    plan: 'professional',
    status: 'active',
    users: 12,
    mrr: 149,
    createdAt: '2023-01-15',
    email: 'contact@acmeplumbing.com',
    phone: '(555) 123-4567',
    address: '123 Main Street, Suite 100, San Francisco, CA 94102',
    lastActiveAt: '2 hours ago',
    totalJobs: 1247,
    totalRevenue: 287450
  };

  activities: Activity[] = [
    { id: '1', action: 'New team member added: Sarah Johnson', timestamp: '2 hours ago' },
    { id: '2', action: 'Invoice #1234 paid ($450)', timestamp: '5 hours ago' },
    { id: '3', action: 'Job #5678 completed', timestamp: 'Yesterday' },
    { id: '4', action: 'New customer added: Metro Properties', timestamp: 'Yesterday' },
    { id: '5', action: 'Plan upgraded from Starter to Professional', timestamp: '3 days ago' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // In real app, fetch tenant by ID
    console.log('Loading tenant:', id);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'neutral' {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'suspended': return 'warning';
      case 'canceled': return 'error';
      default: return 'neutral';
    }
  }

  getPlanPrice(plan: string): number {
    switch (plan) {
      case 'starter': return 49;
      case 'professional': return 149;
      case 'enterprise': return 399;
      default: return 0;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  impersonate(): void {
    console.log('Impersonate tenant');
  }

  suspendTenant(): void {
    console.log('Suspend tenant');
  }

  activateTenant(): void {
    console.log('Activate tenant');
  }

  deleteTenant(): void {
    console.log('Delete tenant');
  }
}
