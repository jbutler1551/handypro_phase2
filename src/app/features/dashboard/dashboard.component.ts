import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  type: 'franchise' | 'billing' | 'compliance' | 'system' | 'user';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  actionRoute?: string;
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
      <!-- Welcome Header -->
      <div class="hp-dashboard__header">
        <div class="hp-dashboard__welcome">
          <h1 class="hp-dashboard__title">Welcome back, John</h1>
          <p class="hp-dashboard__subtitle">Here's what's happening with your franchise network today.</p>
        </div>
        <div class="hp-dashboard__header-actions">
          <hp-button variant="outline" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hp-dashboard__btn-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Report
          </hp-button>
        </div>
      </div>

      <!-- Alerts Banner -->
      <div *ngIf="alerts.length > 0" class="hp-dashboard__alerts">
        <div
          *ngFor="let alert of alerts"
          class="hp-dashboard__alert"
          [class.hp-dashboard__alert--critical]="alert.severity === 'critical'"
          [class.hp-dashboard__alert--warning]="alert.severity === 'warning'"
          [class.hp-dashboard__alert--info]="alert.severity === 'info'"
        >
          <div class="hp-dashboard__alert-icon">
            <svg *ngIf="alert.severity === 'critical'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <svg *ngIf="alert.severity === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg *ngIf="alert.severity === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="hp-dashboard__alert-content">
            <strong>{{ alert.title }}</strong>
            <span>{{ alert.description }}</span>
          </div>
          <hp-button *ngIf="alert.action" variant="ghost" size="sm" [routerLink]="alert.actionRoute">
            {{ alert.action }}
          </hp-button>
          <button class="hp-dashboard__alert-dismiss" (click)="dismissAlert(alert.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
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
            <hp-button variant="ghost" size="sm" routerLink="/reports">View All</hp-button>
          </div>
          <div class="hp-dashboard__activity-list">
            <div *ngFor="let item of activityItems" class="hp-dashboard__activity-item">
              <div
                class="hp-dashboard__activity-icon"
                [class.hp-dashboard__activity-icon--franchise]="item.type === 'franchise'"
                [class.hp-dashboard__activity-icon--billing]="item.type === 'billing'"
                [class.hp-dashboard__activity-icon--compliance]="item.type === 'compliance'"
                [class.hp-dashboard__activity-icon--system]="item.type === 'system'"
                [class.hp-dashboard__activity-icon--user]="item.type === 'user'"
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

        <!-- Franchise Overview -->
        <hp-card class="hp-dashboard__franchise-overview">
          <div class="hp-dashboard__section-header">
            <h2 class="hp-dashboard__section-title">Franchise Overview</h2>
            <hp-button variant="ghost" size="sm" routerLink="/settings/franchises">Manage</hp-button>
          </div>
          <div class="hp-dashboard__franchise-stats">
            <div class="hp-dashboard__franchise-stat">
              <span class="hp-dashboard__franchise-stat-value">12</span>
              <span class="hp-dashboard__franchise-stat-label">Active Locations</span>
            </div>
            <div class="hp-dashboard__franchise-stat">
              <span class="hp-dashboard__franchise-stat-value">3</span>
              <span class="hp-dashboard__franchise-stat-label">Pending Setup</span>
            </div>
            <div class="hp-dashboard__franchise-stat">
              <span class="hp-dashboard__franchise-stat-value">48</span>
              <span class="hp-dashboard__franchise-stat-label">Total Technicians</span>
            </div>
            <div class="hp-dashboard__franchise-stat">
              <span class="hp-dashboard__franchise-stat-value">94%</span>
              <span class="hp-dashboard__franchise-stat-label">Compliance Rate</span>
            </div>
          </div>
          <div class="hp-dashboard__franchise-list">
            <div class="hp-dashboard__franchise-item">
              <div class="hp-dashboard__franchise-info">
                <span class="hp-dashboard__franchise-name">HandyPro Denver</span>
                <span class="hp-dashboard__franchise-location">Denver, CO</span>
              </div>
              <hp-badge variant="success" size="sm">Active</hp-badge>
            </div>
            <div class="hp-dashboard__franchise-item">
              <div class="hp-dashboard__franchise-info">
                <span class="hp-dashboard__franchise-name">HandyPro Austin</span>
                <span class="hp-dashboard__franchise-location">Austin, TX</span>
              </div>
              <hp-badge variant="success" size="sm">Active</hp-badge>
            </div>
            <div class="hp-dashboard__franchise-item">
              <div class="hp-dashboard__franchise-info">
                <span class="hp-dashboard__franchise-name">HandyPro Phoenix</span>
                <span class="hp-dashboard__franchise-location">Phoenix, AZ</span>
              </div>
              <hp-badge variant="warning" size="sm">Setup</hp-badge>
            </div>
          </div>
        </hp-card>

        <!-- Compliance Status -->
        <hp-card class="hp-dashboard__compliance">
          <div class="hp-dashboard__section-header">
            <h2 class="hp-dashboard__section-title">Compliance Status</h2>
            <hp-button variant="ghost" size="sm" routerLink="/compliance">View All</hp-button>
          </div>
          <div class="hp-dashboard__compliance-items">
            <div class="hp-dashboard__compliance-item">
              <div class="hp-dashboard__compliance-info">
                <span class="hp-dashboard__compliance-label">Insurance Certificates</span>
                <span class="hp-dashboard__compliance-status">10 of 12 valid</span>
              </div>
              <div class="hp-dashboard__compliance-bar">
                <div class="hp-dashboard__compliance-progress" style="width: 83%"></div>
              </div>
            </div>
            <div class="hp-dashboard__compliance-item">
              <div class="hp-dashboard__compliance-info">
                <span class="hp-dashboard__compliance-label">Business Licenses</span>
                <span class="hp-dashboard__compliance-status">12 of 12 valid</span>
              </div>
              <div class="hp-dashboard__compliance-bar">
                <div class="hp-dashboard__compliance-progress hp-dashboard__compliance-progress--success" style="width: 100%"></div>
              </div>
            </div>
            <div class="hp-dashboard__compliance-item">
              <div class="hp-dashboard__compliance-info">
                <span class="hp-dashboard__compliance-label">Background Checks</span>
                <span class="hp-dashboard__compliance-status">45 of 48 complete</span>
              </div>
              <div class="hp-dashboard__compliance-bar">
                <div class="hp-dashboard__compliance-progress" style="width: 94%"></div>
              </div>
            </div>
            <div class="hp-dashboard__compliance-item hp-dashboard__compliance-item--warning">
              <div class="hp-dashboard__compliance-info">
                <span class="hp-dashboard__compliance-label">Expiring Soon</span>
                <span class="hp-dashboard__compliance-status hp-dashboard__compliance-status--warning">2 items need attention</span>
              </div>
              <hp-button variant="outline" size="sm" routerLink="/compliance">Review</hp-button>
            </div>
          </div>
        </hp-card>

        <!-- Billing Summary -->
        <hp-card class="hp-dashboard__billing">
          <div class="hp-dashboard__section-header">
            <h2 class="hp-dashboard__section-title">Billing Summary</h2>
            <hp-button variant="ghost" size="sm" routerLink="/billing">Manage</hp-button>
          </div>
          <div class="hp-dashboard__billing-content">
            <div class="hp-dashboard__billing-plan">
              <div class="hp-dashboard__billing-plan-info">
                <span class="hp-dashboard__billing-plan-name">Professional Plan</span>
                <span class="hp-dashboard__billing-plan-price">$299<span>/month</span></span>
              </div>
              <hp-badge variant="success" size="sm">Active</hp-badge>
            </div>
            <div class="hp-dashboard__billing-stats">
              <div class="hp-dashboard__billing-stat">
                <span class="hp-dashboard__billing-stat-label">Next Invoice</span>
                <span class="hp-dashboard__billing-stat-value">Jan 1, 2025</span>
              </div>
              <div class="hp-dashboard__billing-stat">
                <span class="hp-dashboard__billing-stat-label">Amount Due</span>
                <span class="hp-dashboard__billing-stat-value">$299.00</span>
              </div>
            </div>
            <div class="hp-dashboard__billing-usage">
              <span class="hp-dashboard__billing-usage-title">Plan Usage</span>
              <div class="hp-dashboard__billing-usage-item">
                <span>Franchise Locations</span>
                <span>12 of 25</span>
              </div>
              <div class="hp-dashboard__billing-usage-bar">
                <div class="hp-dashboard__billing-usage-progress" style="width: 48%"></div>
              </div>
              <div class="hp-dashboard__billing-usage-item">
                <span>Admin Seats</span>
                <span>3 of 5</span>
              </div>
              <div class="hp-dashboard__billing-usage-bar">
                <div class="hp-dashboard__billing-usage-progress" style="width: 60%"></div>
              </div>
            </div>
          </div>
        </hp-card>

        <!-- System Announcements -->
        <hp-card class="hp-dashboard__announcements">
          <h2 class="hp-dashboard__section-title">System Announcements</h2>
          <div class="hp-dashboard__announcement-list">
            <div class="hp-dashboard__announcement">
              <div class="hp-dashboard__announcement-badge">New</div>
              <div class="hp-dashboard__announcement-content">
                <span class="hp-dashboard__announcement-title">QuickBooks Integration Update</span>
                <p class="hp-dashboard__announcement-text">We've improved our QuickBooks sync with better error handling and faster processing times.</p>
                <span class="hp-dashboard__announcement-date">December 18, 2024</span>
              </div>
            </div>
            <div class="hp-dashboard__announcement">
              <div class="hp-dashboard__announcement-content">
                <span class="hp-dashboard__announcement-title">Holiday Support Hours</span>
                <p class="hp-dashboard__announcement-text">Our support team will have modified hours during the holiday season. See schedule for details.</p>
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

      /* Alerts */
      &__alerts {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__alert {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        border-radius: var(--hp-radius-modern-sm);
        background: var(--hp-glass-bg);
        border: 1px solid var(--hp-glass-border);

        &--critical {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }

        &--warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }

        &--info {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }
      }

      &__alert-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;

        svg {
          width: 100%;
          height: 100%;
        }

        .hp-dashboard__alert--critical & { color: var(--hp-color-error); }
        .hp-dashboard__alert--warning & { color: var(--hp-color-warning); }
        .hp-dashboard__alert--info & { color: var(--hp-color-primary); }
      }

      &__alert-content {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);

        strong {
          font-weight: var(--hp-font-weight-semibold);
        }
      }

      &__alert-dismiss {
        width: 24px;
        height: 24px;
        padding: 0;
        background: transparent;
        border: none;
        color: var(--hp-text-tertiary);
        cursor: pointer;
        border-radius: var(--hp-radius-modern-xs);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 150ms ease;

        &:hover {
          background: var(--hp-glass-bg);
          color: var(--hp-text-primary);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      /* Stats Grid */
      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 1200px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 600px) {
          grid-template-columns: 1fr;
        }
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

        svg {
          width: 24px;
          height: 24px;
        }

        .hp-dashboard__stat-card--primary & {
          background: rgba(30, 58, 95, 0.1);
          color: var(--hp-color-primary);
        }

        .hp-dashboard__stat-card--success & {
          background: rgba(34, 197, 94, 0.1);
          color: var(--hp-color-success);
        }

        .hp-dashboard__stat-card--warning & {
          background: rgba(245, 158, 11, 0.1);
          color: var(--hp-color-warning);
        }

        .hp-dashboard__stat-card--error & {
          background: rgba(239, 68, 68, 0.1);
          color: var(--hp-color-error);
        }
      }

      &__stat-content {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__stat-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__stat-value {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__stat-change {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        font-size: var(--hp-font-size-xs);

        svg {
          width: 14px;
          height: 14px;
        }

        &.positive {
          color: var(--hp-color-success);
        }

        &.negative {
          color: var(--hp-color-error);
        }
      }

      /* Main Grid */
      &__grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: var(--hp-spacing-6);

        @media (max-width: 1200px) {
          grid-template-columns: 1fr;
        }
      }

      &__quick-actions {
        grid-column: span 4;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

      &__activity {
        grid-column: span 8;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

      &__franchise-overview {
        grid-column: span 6;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

      &__compliance {
        grid-column: span 6;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

      &__billing {
        grid-column: span 5;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

      &__announcements {
        grid-column: span 7;

        @media (max-width: 1200px) {
          grid-column: span 1;
        }
      }

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

        .hp-dashboard__section-title {
          margin: 0;
        }
      }

      /* Quick Actions */
      &__actions-grid {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

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

        &:hover {
          background: var(--hp-glass-bg);
          border-color: var(--hp-glass-border);
          transform: translateX(4px);
        }
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

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__action-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__action-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__action-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__action-arrow {
        width: 16px;
        height: 16px;
        color: var(--hp-text-tertiary);
      }

      /* Activity List */
      &__activity-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

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

        svg {
          width: 16px;
          height: 16px;
        }

        &--franchise {
          background: rgba(30, 58, 95, 0.1);
          color: var(--hp-color-primary);
        }

        &--billing {
          background: rgba(34, 197, 94, 0.1);
          color: var(--hp-color-success);
        }

        &--compliance {
          background: rgba(245, 158, 11, 0.1);
          color: var(--hp-color-warning);
        }

        &--system {
          background: rgba(107, 114, 128, 0.1);
          color: var(--hp-text-secondary);
        }

        &--user {
          background: rgba(139, 92, 246, 0.1);
          color: #8B5CF6;
        }
      }

      &__activity-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__activity-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__activity-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__activity-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        white-space: nowrap;
      }

      /* Franchise Overview */
      &__franchise-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
        padding-bottom: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-glass-border);

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      &__franchise-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      &__franchise-stat-value {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__franchise-stat-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__franchise-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__franchise-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__franchise-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__franchise-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__franchise-location {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      /* Compliance */
      &__compliance-items {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__compliance-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);

        &--warning {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: var(--hp-spacing-3);
          background: rgba(245, 158, 11, 0.1);
          border-radius: var(--hp-radius-modern-sm);
        }
      }

      &__compliance-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__compliance-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__compliance-status {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);

        &--warning {
          color: var(--hp-color-warning);
          font-weight: var(--hp-font-weight-medium);
        }
      }

      &__compliance-bar {
        height: 6px;
        background: var(--hp-glass-bg);
        border-radius: 3px;
        overflow: hidden;
      }

      &__compliance-progress {
        height: 100%;
        background: var(--hp-gradient-primary);
        border-radius: 3px;
        transition: width 500ms ease;

        &--success {
          background: var(--hp-color-success);
        }
      }

      /* Billing */
      &__billing-content {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__billing-plan {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__billing-plan-name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        display: block;
        margin-bottom: var(--hp-spacing-1);
      }

      &__billing-plan-price {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);

        span {
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-normal);
          color: var(--hp-text-tertiary);
        }
      }

      &__billing-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);
      }

      &__billing-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__billing-stat-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__billing-stat-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__billing-usage {
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__billing-usage-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
        display: block;
        margin-bottom: var(--hp-spacing-3);
      }

      &__billing-usage-item {
        display: flex;
        justify-content: space-between;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        margin-bottom: var(--hp-spacing-2);
      }

      &__billing-usage-bar {
        height: 4px;
        background: var(--hp-glass-bg);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: var(--hp-spacing-3);

        &:last-child {
          margin-bottom: 0;
        }
      }

      &__billing-usage-progress {
        height: 100%;
        background: var(--hp-gradient-primary);
        border-radius: 2px;
      }

      /* Announcements */
      &__announcement-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

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

      &__announcement-content {
        flex: 1;
      }

      &__announcement-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        display: block;
        margin-bottom: var(--hp-spacing-1);
      }

      &__announcement-text {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0 0 var(--hp-spacing-2);
        line-height: 1.5;
      }

      &__announcement-date {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  constructor(private sanitizer: DomSanitizer) {}

  stats: StatCard[] = [
    {
      label: 'Total Franchises',
      value: 15,
      change: 12,
      changeLabel: 'from last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      color: 'primary'
    },
    {
      label: 'Active Technicians',
      value: 48,
      change: 8,
      changeLabel: 'from last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      color: 'success'
    },
    {
      label: 'Monthly Revenue',
      value: '$45,890',
      change: 15,
      changeLabel: 'from last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      color: 'primary'
    },
    {
      label: 'Compliance Issues',
      value: 2,
      change: -50,
      changeLabel: 'from last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      color: 'warning'
    }
  ];

  alerts: AlertItem[] = [
    {
      id: '1',
      severity: 'warning',
      title: 'Insurance Expiring',
      description: '2 franchise locations have insurance certificates expiring within 30 days.',
      action: 'Review',
      actionRoute: '/compliance'
    },
    {
      id: '2',
      severity: 'info',
      title: 'New Feature Available',
      description: 'Territory mapping is now available for all Professional plan users.',
      action: 'Learn More',
      actionRoute: '/settings/franchises'
    }
  ];

  quickActions: QuickAction[] = [
    {
      label: 'Add Franchise',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>',
      route: '/settings/franchises',
      description: 'Onboard a new location'
    },
    {
      label: 'Invite User',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
      route: '/settings/franchises',
      description: 'Add team member'
    },
    {
      label: 'View Reports',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>',
      route: '/reports',
      description: 'Analytics & insights'
    },
    {
      label: 'Manage Billing',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
      route: '/billing',
      description: 'Subscription & payments'
    }
  ];

  activityItems: ActivityItem[] = [
    {
      id: '1',
      type: 'franchise',
      title: 'New Franchise Added',
      description: 'HandyPro Phoenix has been onboarded and is pending setup completion.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
    },
    {
      id: '2',
      type: 'billing',
      title: 'Payment Received',
      description: 'Monthly subscription payment of $299.00 processed successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    },
    {
      id: '3',
      type: 'compliance',
      title: 'Document Uploaded',
      description: 'HandyPro Denver uploaded their updated insurance certificate.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
    },
    {
      id: '4',
      type: 'user',
      title: 'Team Member Invited',
      description: 'sarah.johnson@example.com was invited as a Franchise Manager.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>'
    },
    {
      id: '5',
      type: 'system',
      title: 'QuickBooks Synced',
      description: '15 invoices and 8 payments synced to QuickBooks successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>'
    }
  ];

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  dismissAlert(id: string): void {
    this.alerts = this.alerts.filter(a => a.id !== id);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }
}
