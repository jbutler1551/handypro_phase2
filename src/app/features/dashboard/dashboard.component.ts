import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

interface ActivityItem {
  id: string;
  type: 'billing' | 'system' | 'user' | 'integration';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  description: string;
}

@Component({
  selector: 'hp-dashboard',
  template: `
    <div class="hp-dashboard">
      <!-- Trial Banner (shown if in trial period) -->
      <hp-trial-banner
        *ngIf="showTrialBanner"
        [daysRemaining]="trialDaysRemaining"
        [dismissible]="trialDaysRemaining > 3"
        (onUpgrade)="goToUpgrade()"
        (onDismiss)="dismissTrialBanner()"
      ></hp-trial-banner>

      <!-- Welcome Header -->
      <div class="hp-dashboard__header">
        <div class="hp-dashboard__welcome">
          <h1 class="hp-dashboard__title">Welcome back, John</h1>
          <p class="hp-dashboard__subtitle">Here's an overview of your TruztPro account.</p>
        </div>
        <div class="hp-dashboard__header-actions">
          <hp-button variant="primary" routerLink="/settings/integrations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hp-dashboard__btn-icon">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Connect Apps
          </hp-button>
        </div>
      </div>

      <!-- Stats Grid - SaaS focused -->
      <div class="hp-dashboard__stats">
        <div
          *ngFor="let stat of stats"
          class="hp-dashboard__stat-card"
          [class.hp-dashboard__stat-card--primary]="stat.color === 'primary'"
          [class.hp-dashboard__stat-card--success]="stat.color === 'success'"
          [class.hp-dashboard__stat-card--warning]="stat.color === 'warning'"
          [class.hp-dashboard__stat-card--error]="stat.color === 'error'"
        >
          <div class="hp-dashboard__stat-icon" [innerHTML]="sanitizeHtml(stat.icon)"></div>
          <div class="hp-dashboard__stat-content">
            <span class="hp-dashboard__stat-label">{{ stat.label }}</span>
            <span class="hp-dashboard__stat-value">{{ stat.value }}</span>
            <div *ngIf="stat.change !== undefined" class="hp-dashboard__stat-change" [class.positive]="stat.change >= 0" [class.negative]="stat.change < 0">
              <svg *ngIf="stat.change >= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <svg *ngIf="stat.change < 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span>{{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}% {{ stat.changeLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="hp-dashboard__grid">
        <!-- Subscription & Usage -->
        <hp-card class="hp-dashboard__subscription">
          <div class="hp-dashboard__section-header">
            <h2 class="hp-dashboard__section-title">Subscription & Usage</h2>
            <hp-button variant="ghost" size="sm" routerLink="/billing">Manage</hp-button>
          </div>
          <div class="hp-dashboard__subscription-content">
            <div class="hp-dashboard__plan-info">
              <div class="hp-dashboard__plan-details">
                <span class="hp-dashboard__plan-name">{{ currentPlan.name }}</span>
                <span class="hp-dashboard__plan-price">{{ currentPlan.price }}<span>/month</span></span>
              </div>
              <hp-badge [variant]="currentPlan.status === 'active' ? 'success' : 'warning'" size="sm">
                {{ currentPlan.status === 'active' ? 'Active' : 'Trial' }}
              </hp-badge>
            </div>

            <div class="hp-dashboard__usage-section">
              <hp-usage-meter
                label="Franchise Locations"
                [current]="usageData.locations.current"
                [limit]="usageData.locations.limit"
              ></hp-usage-meter>

              <hp-usage-meter
                label="Admin Seats"
                [current]="usageData.seats.current"
                [limit]="usageData.seats.limit"
              ></hp-usage-meter>

              <hp-usage-meter
                label="Storage"
                [current]="usageData.storage.current"
                [limit]="usageData.storage.limit"
                unit="GB"
              ></hp-usage-meter>
            </div>

            <div class="hp-dashboard__billing-info">
              <div class="hp-dashboard__billing-item">
                <span class="hp-dashboard__billing-label">Next Invoice</span>
                <span class="hp-dashboard__billing-value">{{ nextInvoiceDate }}</span>
              </div>
              <div class="hp-dashboard__billing-item">
                <span class="hp-dashboard__billing-label">Amount Due</span>
                <span class="hp-dashboard__billing-value">{{ currentPlan.price }}</span>
              </div>
            </div>
          </div>
        </hp-card>

        <!-- Quick Actions -->
        <hp-card class="hp-dashboard__quick-actions">
          <h2 class="hp-dashboard__section-title">Quick Actions</h2>
          <div class="hp-dashboard__actions-grid">
            <a
              *ngFor="let action of quickActions"
              [routerLink]="action.route"
              class="hp-dashboard__action-card"
            >
              <div class="hp-dashboard__action-icon" [innerHTML]="sanitizeHtml(action.icon)"></div>
              <div class="hp-dashboard__action-content">
                <span class="hp-dashboard__action-label">{{ action.label }}</span>
                <span class="hp-dashboard__action-desc">{{ action.description }}</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-dashboard__action-arrow">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </hp-card>

        <!-- Recent Activity -->
        <hp-card class="hp-dashboard__activity">
          <div class="hp-dashboard__section-header">
            <h2 class="hp-dashboard__section-title">Recent Activity</h2>
          </div>
          <div class="hp-dashboard__activity-list">
            <div *ngFor="let item of activityItems" class="hp-dashboard__activity-item">
              <div
                class="hp-dashboard__activity-icon"
                [class.hp-dashboard__activity-icon--billing]="item.type === 'billing'"
                [class.hp-dashboard__activity-icon--system]="item.type === 'system'"
                [class.hp-dashboard__activity-icon--user]="item.type === 'user'"
                [class.hp-dashboard__activity-icon--integration]="item.type === 'integration'"
                [innerHTML]="sanitizeHtml(item.icon)"
              ></div>
              <div class="hp-dashboard__activity-content">
                <span class="hp-dashboard__activity-title">{{ item.title }}</span>
                <span class="hp-dashboard__activity-desc">{{ item.description }}</span>
              </div>
              <span class="hp-dashboard__activity-time">{{ formatTime(item.timestamp) }}</span>
            </div>
          </div>
        </hp-card>

        <!-- Connected Integrations -->
        <hp-card class="hp-dashboard__integrations">
          <div class="hp-dashboard__section-header">
            <h2 class="hp-dashboard__section-title">Connected Apps</h2>
            <hp-button variant="ghost" size="sm" routerLink="/settings/integrations">View All</hp-button>
          </div>
          <div class="hp-dashboard__integrations-list">
            <div *ngFor="let integration of connectedIntegrations" class="hp-dashboard__integration-item">
              <div class="hp-dashboard__integration-icon" [innerHTML]="sanitizeHtml(integration.icon)"></div>
              <div class="hp-dashboard__integration-info">
                <span class="hp-dashboard__integration-name">{{ integration.name }}</span>
                <span class="hp-dashboard__integration-status">{{ integration.status }}</span>
              </div>
              <hp-badge [variant]="integration.connected ? 'success' : 'secondary'" size="sm">
                {{ integration.connected ? 'Connected' : 'Not Connected' }}
              </hp-badge>
            </div>
          </div>
        </hp-card>

        <!-- System Announcements -->
        <hp-card class="hp-dashboard__announcements">
          <h2 class="hp-dashboard__section-title">Announcements</h2>
          <div class="hp-dashboard__announcement-list">
            <div class="hp-dashboard__announcement">
              <div class="hp-dashboard__announcement-badge">New</div>
              <div class="hp-dashboard__announcement-content">
                <span class="hp-dashboard__announcement-title">Platform Update v2.1</span>
                <p class="hp-dashboard__announcement-text">We've improved sync speed and added new integration options.</p>
                <span class="hp-dashboard__announcement-date">December 18, 2024</span>
              </div>
            </div>
            <div class="hp-dashboard__announcement">
              <div class="hp-dashboard__announcement-content">
                <span class="hp-dashboard__announcement-title">Holiday Support Hours</span>
                <p class="hp-dashboard__announcement-text">Our support team will have modified hours during the holiday season.</p>
                <span class="hp-dashboard__announcement-date">December 15, 2024</span>
              </div>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--hp-spacing-6);

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
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
        width: 16px;
        height: 16px;
        margin-right: var(--hp-spacing-2);
      }

      /* Stats Grid */
      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 600px) { grid-template-columns: 1fr; }
      }

      &__stat-card {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5);
        background: var(--hp-glass-bg-prominent);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
        transition: all 200ms ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--hp-shadow-lg);
        }
      }

      &__stat-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--hp-radius-modern-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg { width: 24px; height: 24px; }

        .hp-dashboard__stat-card--primary & { background: rgba(30, 58, 95, 0.1); color: var(--hp-color-primary); }
        .hp-dashboard__stat-card--success & { background: rgba(34, 197, 94, 0.1); color: var(--hp-color-success); }
        .hp-dashboard__stat-card--warning & { background: rgba(245, 158, 11, 0.1); color: var(--hp-color-warning); }
        .hp-dashboard__stat-card--error & { background: rgba(239, 68, 68, 0.1); color: var(--hp-color-error); }
      }

      &__stat-content { display: flex; flex-direction: column; gap: var(--hp-spacing-1); }
      &__stat-label { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); }
      &__stat-value { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); }
      &__stat-change {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        font-size: var(--hp-font-size-xs);
        svg { width: 14px; height: 14px; }
        &.positive { color: var(--hp-color-success); }
        &.negative { color: var(--hp-color-error); }
      }

      /* Main Grid */
      &__grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: var(--hp-spacing-6);
        @media (max-width: 1200px) { grid-template-columns: 1fr; }
      }

      &__subscription { grid-column: span 5; @media (max-width: 1200px) { grid-column: span 1; } }
      &__quick-actions { grid-column: span 4; @media (max-width: 1200px) { grid-column: span 1; } }
      &__activity { grid-column: span 7; @media (max-width: 1200px) { grid-column: span 1; } }
      &__integrations { grid-column: span 5; @media (max-width: 1200px) { grid-column: span 1; } }
      &__announcements { grid-column: span 7; @media (max-width: 1200px) { grid-column: span 1; } }

      /* Section Headers */
      &__section-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);
        .hp-dashboard__section-title { margin: 0; }
      }

      /* Subscription */
      &__subscription-content { display: flex; flex-direction: column; gap: var(--hp-spacing-5); }
      &__plan-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }
      &__plan-name { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); display: block; margin-bottom: var(--hp-spacing-1); }
      &__plan-price {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        span { font-size: var(--hp-font-size-sm); font-weight: normal; color: var(--hp-text-tertiary); }
      }
      &__usage-section { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__billing-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-glass-border);
      }
      &__billing-item { display: flex; flex-direction: column; gap: 2px; }
      &__billing-label { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }
      &__billing-value { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); }

      /* Quick Actions */
      &__actions-grid { display: flex; flex-direction: column; gap: var(--hp-spacing-2); }
      &__action-card {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid transparent;
        border-radius: var(--hp-radius-modern-sm);
        text-decoration: none;
        transition: all 150ms ease;
        &:hover { background: var(--hp-glass-bg); border-color: var(--hp-glass-border); transform: translateX(4px); }
      }
      &__action-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--hp-radius-modern-xs);
        background: var(--hp-gradient-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        svg { width: 18px; height: 18px; }
      }
      &__action-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      &__action-label { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); }
      &__action-desc { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }
      &__action-arrow { width: 16px; height: 16px; color: var(--hp-text-tertiary); }

      /* Activity List */
      &__activity-list { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__activity-item {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }
      &__activity-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--hp-radius-modern-xs);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        svg { width: 16px; height: 16px; }
        &--billing { background: rgba(34, 197, 94, 0.1); color: var(--hp-color-success); }
        &--system { background: rgba(107, 114, 128, 0.1); color: var(--hp-text-secondary); }
        &--user { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }
        &--integration { background: rgba(30, 58, 95, 0.1); color: var(--hp-color-primary); }
      }
      &__activity-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      &__activity-title { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); }
      &__activity-desc { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }
      &__activity-time { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); white-space: nowrap; }

      /* Integrations */
      &__integrations-list { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__integration-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }
      &__integration-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--hp-radius-modern-xs);
        background: var(--hp-glass-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        svg { width: 20px; height: 20px; color: var(--hp-text-secondary); }
      }
      &__integration-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      &__integration-name { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); }
      &__integration-status { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }

      /* Announcements */
      &__announcement-list { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__announcement {
        display: flex;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }
      &__announcement-badge {
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        background: var(--hp-gradient-primary);
        color: white;
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        border-radius: var(--hp-radius-modern-xs);
        height: fit-content;
      }
      &__announcement-content { flex: 1; }
      &__announcement-title { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); display: block; margin-bottom: var(--hp-spacing-1); }
      &__announcement-text { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); margin: 0 0 var(--hp-spacing-2); line-height: 1.5; }
      &__announcement-date { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  showTrialBanner = true;
  trialDaysRemaining = 7;

  currentPlan = {
    name: 'Professional Plan',
    price: '$299',
    status: 'active' as 'active' | 'trial'
  };

  usageData = {
    locations: { current: 12, limit: 25 },
    seats: { current: 3, limit: 5 },
    storage: { current: 18, limit: 50 }
  };

  nextInvoiceDate = 'Jan 1, 2025';

  stats: StatCard[] = [
    {
      label: 'Current Plan',
      value: 'Professional',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
      color: 'primary'
    },
    {
      label: 'Active Locations',
      value: '12 / 25',
      change: 2,
      changeLabel: 'this month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      color: 'success'
    },
    {
      label: 'Team Members',
      value: 3,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      color: 'primary'
    },
    {
      label: 'Integrations',
      value: '3 Active',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      color: 'success'
    }
  ];

  quickActions: QuickAction[] = [
    {
      label: 'Invite Team Member',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
      route: '/settings/team',
      description: 'Add admin or viewer'
    },
    {
      label: 'Update Branding',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>',
      route: '/settings/branding',
      description: 'Logo & colors'
    },
    {
      label: 'Manage Billing',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
      route: '/billing',
      description: 'Plans & payments'
    },
    {
      label: 'View Integrations',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      route: '/settings/integrations',
      description: 'Connect apps'
    }
  ];

  activityItems: ActivityItem[] = [
    {
      id: '1',
      type: 'billing',
      title: 'Payment Received',
      description: 'Monthly subscription payment of $299.00 processed successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    },
    {
      id: '2',
      type: 'user',
      title: 'Team Member Invited',
      description: 'sarah.johnson@example.com was invited as an Admin.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>'
    },
    {
      id: '3',
      type: 'integration',
      title: 'QuickBooks Connected',
      description: 'Successfully connected to QuickBooks Online.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
    },
    {
      id: '4',
      type: 'system',
      title: 'Branding Updated',
      description: 'Company logo and colors have been updated.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
    }
  ];

  connectedIntegrations = [
    {
      name: 'QuickBooks Online',
      status: 'Last sync: 2 hours ago',
      connected: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
    },
    {
      name: 'Zapier',
      status: '5 active zaps',
      connected: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    },
    {
      name: 'Google Calendar',
      status: 'Not connected',
      connected: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    }
  ];

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goToUpgrade(): void {
    this.router.navigate(['/billing'], { queryParams: { upgrade: true } });
  }

  dismissTrialBanner(): void {
    this.showTrialBanner = false;
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
