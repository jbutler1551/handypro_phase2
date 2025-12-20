import { Component, ChangeDetectionStrategy } from '@angular/core';

interface PlatformMetric {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

interface TenantAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  tenant: string;
  timestamp: string;
}

interface RecentActivity {
  id: string;
  action: string;
  tenant?: string;
  user?: string;
  timestamp: string;
}

@Component({
  selector: 'hp-admin-dashboard',
  template: `
    <div class="hp-admin-dashboard">
      <!-- Header -->
      <div class="hp-admin-dashboard__header">
        <div class="hp-admin-dashboard__title-section">
          <h1 class="hp-admin-dashboard__title">Platform Overview</h1>
          <p class="hp-admin-dashboard__subtitle">Monitor your entire TruztPro platform at a glance</p>
        </div>
        <div class="hp-admin-dashboard__actions">
          <hp-button variant="outline" (click)="exportReport()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Report
          </hp-button>
          <hp-button variant="primary" (click)="refreshData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Refresh
          </hp-button>
        </div>
      </div>

      <!-- Platform Metrics -->
      <div class="hp-admin-dashboard__metrics">
        <div *ngFor="let metric of platformMetrics" class="hp-admin-dashboard__metric-card">
          <div class="hp-admin-dashboard__metric-icon" [innerHTML]="metric.icon"></div>
          <div class="hp-admin-dashboard__metric-content">
            <span class="hp-admin-dashboard__metric-value">{{ metric.value }}</span>
            <span class="hp-admin-dashboard__metric-label">{{ metric.label }}</span>
          </div>
          <div class="hp-admin-dashboard__metric-change" [class.positive]="metric.change > 0" [class.negative]="metric.change < 0">
            <svg *ngIf="metric.change > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <svg *ngIf="metric.change < 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
              <polyline points="17 18 23 18 23 12"></polyline>
            </svg>
            <span>{{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%</span>
            <span class="hp-admin-dashboard__change-label">{{ metric.changeLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="hp-admin-dashboard__grid">
        <!-- Revenue Chart Section -->
        <div class="hp-admin-dashboard__card hp-admin-dashboard__card--wide">
          <div class="hp-admin-dashboard__card-header">
            <h2 class="hp-admin-dashboard__card-title">Monthly Recurring Revenue</h2>
            <div class="hp-admin-dashboard__card-tabs">
              <button [class.active]="revenueTimeframe === '7d'" (click)="revenueTimeframe = '7d'">7D</button>
              <button [class.active]="revenueTimeframe === '30d'" (click)="revenueTimeframe = '30d'">30D</button>
              <button [class.active]="revenueTimeframe === '90d'" (click)="revenueTimeframe = '90d'">90D</button>
              <button [class.active]="revenueTimeframe === '1y'" (click)="revenueTimeframe = '1y'">1Y</button>
            </div>
          </div>
          <div class="hp-admin-dashboard__chart">
            <div class="hp-admin-dashboard__chart-placeholder">
              <div class="hp-admin-dashboard__chart-bar" style="height: 45%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 52%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 48%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 61%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 55%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 67%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 72%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 69%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 78%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 82%;"></div>
              <div class="hp-admin-dashboard__chart-bar" style="height: 89%;"></div>
              <div class="hp-admin-dashboard__chart-bar hp-admin-dashboard__chart-bar--current" style="height: 95%;"></div>
            </div>
            <div class="hp-admin-dashboard__chart-labels">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
          <div class="hp-admin-dashboard__chart-summary">
            <div class="hp-admin-dashboard__summary-item">
              <span class="hp-admin-dashboard__summary-value">$47,850</span>
              <span class="hp-admin-dashboard__summary-label">Current MRR</span>
            </div>
            <div class="hp-admin-dashboard__summary-item">
              <span class="hp-admin-dashboard__summary-value">$574,200</span>
              <span class="hp-admin-dashboard__summary-label">ARR</span>
            </div>
            <div class="hp-admin-dashboard__summary-item">
              <span class="hp-admin-dashboard__summary-value">$119.62</span>
              <span class="hp-admin-dashboard__summary-label">ARPU</span>
            </div>
            <div class="hp-admin-dashboard__summary-item">
              <span class="hp-admin-dashboard__summary-value">2.1%</span>
              <span class="hp-admin-dashboard__summary-label">Churn Rate</span>
            </div>
          </div>
        </div>

        <!-- Tenant Distribution -->
        <div class="hp-admin-dashboard__card">
          <div class="hp-admin-dashboard__card-header">
            <h2 class="hp-admin-dashboard__card-title">Tenant Distribution</h2>
          </div>
          <div class="hp-admin-dashboard__distribution">
            <div class="hp-admin-dashboard__distribution-chart">
              <svg viewBox="0 0 100 100" class="hp-admin-dashboard__donut">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--hp-color-neutral-700)" stroke-width="12"/>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" stroke-width="12"
                  stroke-dasharray="75.4 251.2" stroke-dashoffset="0" transform="rotate(-90 50 50)"/>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" stroke-width="12"
                  stroke-dasharray="50.3 251.2" stroke-dashoffset="-75.4" transform="rotate(-90 50 50)"/>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--hp-color-neutral-500)" stroke-width="12"
                  stroke-dasharray="25.1 251.2" stroke-dashoffset="-125.7" transform="rotate(-90 50 50)"/>
              </svg>
              <div class="hp-admin-dashboard__donut-center">
                <span class="hp-admin-dashboard__donut-value">400</span>
                <span class="hp-admin-dashboard__donut-label">Total</span>
              </div>
            </div>
            <div class="hp-admin-dashboard__distribution-legend">
              <div class="hp-admin-dashboard__legend-item">
                <span class="hp-admin-dashboard__legend-dot" style="background: #22c55e;"></span>
                <span class="hp-admin-dashboard__legend-label">Professional</span>
                <span class="hp-admin-dashboard__legend-value">240 (60%)</span>
              </div>
              <div class="hp-admin-dashboard__legend-item">
                <span class="hp-admin-dashboard__legend-dot" style="background: #a855f7;"></span>
                <span class="hp-admin-dashboard__legend-label">Enterprise</span>
                <span class="hp-admin-dashboard__legend-value">80 (20%)</span>
              </div>
              <div class="hp-admin-dashboard__legend-item">
                <span class="hp-admin-dashboard__legend-dot" style="background: var(--hp-color-neutral-500);"></span>
                <span class="hp-admin-dashboard__legend-label">Starter</span>
                <span class="hp-admin-dashboard__legend-value">80 (20%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts Section -->
        <div class="hp-admin-dashboard__card">
          <div class="hp-admin-dashboard__card-header">
            <h2 class="hp-admin-dashboard__card-title">Active Alerts</h2>
            <hp-badge variant="error" size="sm">{{ alerts.length }}</hp-badge>
          </div>
          <div class="hp-admin-dashboard__alerts">
            <div *ngFor="let alert of alerts" class="hp-admin-dashboard__alert" [class]="'hp-admin-dashboard__alert--' + alert.type">
              <div class="hp-admin-dashboard__alert-icon">
                <svg *ngIf="alert.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <svg *ngIf="alert.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <svg *ngIf="alert.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div class="hp-admin-dashboard__alert-content">
                <span class="hp-admin-dashboard__alert-message">{{ alert.message }}</span>
                <span class="hp-admin-dashboard__alert-meta">{{ alert.tenant }} • {{ alert.timestamp }}</span>
              </div>
              <button class="hp-admin-dashboard__alert-dismiss" (click)="dismissAlert(alert)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="hp-admin-dashboard__card hp-admin-dashboard__card--wide">
          <div class="hp-admin-dashboard__card-header">
            <h2 class="hp-admin-dashboard__card-title">Recent Platform Activity</h2>
            <hp-button variant="ghost" size="sm" routerLink="../analytics">View All</hp-button>
          </div>
          <div class="hp-admin-dashboard__activity-list">
            <div *ngFor="let activity of recentActivity" class="hp-admin-dashboard__activity-item">
              <div class="hp-admin-dashboard__activity-dot"></div>
              <div class="hp-admin-dashboard__activity-content">
                <span class="hp-admin-dashboard__activity-action">{{ activity.action }}</span>
                <span class="hp-admin-dashboard__activity-meta">
                  <span *ngIf="activity.tenant">{{ activity.tenant }}</span>
                  <span *ngIf="activity.user"> by {{ activity.user }}</span>
                </span>
              </div>
              <span class="hp-admin-dashboard__activity-time">{{ activity.timestamp }}</span>
            </div>
          </div>
        </div>

        <!-- Top Tenants -->
        <div class="hp-admin-dashboard__card">
          <div class="hp-admin-dashboard__card-header">
            <h2 class="hp-admin-dashboard__card-title">Top Tenants by Revenue</h2>
          </div>
          <div class="hp-admin-dashboard__top-tenants">
            <div *ngFor="let tenant of topTenants; let i = index" class="hp-admin-dashboard__tenant-row">
              <span class="hp-admin-dashboard__tenant-rank">{{ i + 1 }}</span>
              <div class="hp-admin-dashboard__tenant-info">
                <span class="hp-admin-dashboard__tenant-name">{{ tenant.name }}</span>
                <span class="hp-admin-dashboard__tenant-plan">{{ tenant.plan }}</span>
              </div>
              <span class="hp-admin-dashboard__tenant-revenue">\${{ tenant.mrr }}/mo</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="hp-admin-dashboard__card">
          <div class="hp-admin-dashboard__card-header">
            <h2 class="hp-admin-dashboard__card-title">Quick Actions</h2>
          </div>
          <div class="hp-admin-dashboard__quick-actions">
            <button class="hp-admin-dashboard__quick-action" routerLink="../tenants">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Add Tenant</span>
            </button>
            <button class="hp-admin-dashboard__quick-action" routerLink="../feature-flags">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <span>Manage Flags</span>
            </button>
            <button class="hp-admin-dashboard__quick-action" routerLink="../impersonation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Impersonate</span>
            </button>
            <button class="hp-admin-dashboard__quick-action" routerLink="../system">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-admin-dashboard {
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
        color: var(--hp-color-neutral-0);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__subtitle {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin: 0;
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__metrics {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 1199px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 599px) {
          grid-template-columns: 1fr;
        }
      }

      &__metric-card {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__metric-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-lg);
        flex-shrink: 0;

        svg, :host ::ng-deep svg {
          width: 24px;
          height: 24px;
          color: white;
        }
      }

      &__metric-content {
        flex: 1;
        min-width: 0;
      }

      &__metric-value {
        display: block;
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        line-height: 1.2;
      }

      &__metric-label {
        display: block;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin-top: var(--hp-spacing-1);
      }

      &__metric-change {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);

        svg {
          width: 16px;
          height: 16px;
          margin-bottom: 2px;
        }

        &.positive {
          color: #22c55e;
        }

        &.negative {
          color: var(--hp-color-error);
        }
      }

      &__change-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        font-weight: var(--hp-font-weight-normal);
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 1199px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__card {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);

        &--wide {
          grid-column: span 2;

          @media (max-width: 767px) {
            grid-column: span 1;
          }
        }
      }

      &__card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);
      }

      &__card-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0;
      }

      &__card-tabs {
        display: flex;
        gap: var(--hp-spacing-1);
        background-color: var(--hp-color-neutral-700);
        padding: 2px;
        border-radius: var(--hp-radius-md);

        button {
          padding: var(--hp-spacing-1) var(--hp-spacing-3);
          background: none;
          border: none;
          border-radius: var(--hp-radius-sm);
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-400);
          cursor: pointer;
          transition: all 150ms;

          &:hover {
            color: var(--hp-color-neutral-200);
          }

          &.active {
            background-color: var(--hp-color-neutral-600);
            color: var(--hp-color-neutral-0);
          }
        }
      }

      &__chart {
        margin-bottom: var(--hp-spacing-4);
      }

      &__chart-placeholder {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 200px;
        padding-bottom: var(--hp-spacing-3);
        border-bottom: 1px solid var(--hp-color-neutral-700);
      }

      &__chart-bar {
        flex: 1;
        max-width: 40px;
        background: linear-gradient(180deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-sm) var(--hp-radius-sm) 0 0;
        margin: 0 4px;
        opacity: 0.7;
        transition: opacity 150ms;

        &:hover {
          opacity: 1;
        }

        &--current {
          opacity: 1;
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
        }
      }

      &__chart-labels {
        display: flex;
        justify-content: space-between;
        padding-top: var(--hp-spacing-2);

        span {
          flex: 1;
          text-align: center;
          font-size: var(--hp-font-size-xs);
          color: var(--hp-color-neutral-500);
        }
      }

      &__chart-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-700);
      }

      &__summary-item {
        text-align: center;
      }

      &__summary-value {
        display: block;
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__summary-label {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: 2px;
      }

      &__distribution {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__distribution-chart {
        position: relative;
        width: 180px;
        height: 180px;
        margin: 0 auto;
      }

      &__donut {
        width: 100%;
        height: 100%;
      }

      &__donut-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      &__donut-value {
        display: block;
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__donut-label {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__distribution-legend {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__legend-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
      }

      &__legend-dot {
        width: 10px;
        height: 10px;
        border-radius: var(--hp-radius-full);
        flex-shrink: 0;
      }

      &__legend-label {
        flex: 1;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__legend-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
      }

      &__alerts {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
        max-height: 280px;
        overflow-y: auto;
      }

      &__alert {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        border-radius: var(--hp-radius-md);
        background-color: var(--hp-color-neutral-750);

        &--error {
          border-left: 3px solid var(--hp-color-error);

          .hp-admin-dashboard__alert-icon {
            color: var(--hp-color-error);
          }
        }

        &--warning {
          border-left: 3px solid var(--hp-color-warning);

          .hp-admin-dashboard__alert-icon {
            color: var(--hp-color-warning);
          }
        }

        &--info {
          border-left: 3px solid var(--hp-color-info);

          .hp-admin-dashboard__alert-icon {
            color: var(--hp-color-info);
          }
        }
      }

      &__alert-icon {
        flex-shrink: 0;

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__alert-content {
        flex: 1;
        min-width: 0;
      }

      &__alert-message {
        display: block;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-200);
      }

      &__alert-meta {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: 2px;
      }

      &__alert-dismiss {
        padding: 4px;
        background: none;
        border: none;
        color: var(--hp-color-neutral-500);
        cursor: pointer;
        transition: color 150ms;

        &:hover {
          color: var(--hp-color-neutral-300);
        }

        svg {
          width: 14px;
          height: 14px;
        }
      }

      &__activity-list {
        display: flex;
        flex-direction: column;
      }

      &__activity-item {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) 0;
        border-bottom: 1px solid var(--hp-color-neutral-700);

        &:last-child {
          border-bottom: none;
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
        flex: 1;
        min-width: 0;
      }

      &__activity-action {
        display: block;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-200);
      }

      &__activity-meta {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: 2px;
      }

      &__activity-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        white-space: nowrap;
      }

      &__top-tenants {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__tenant-row {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background-color: var(--hp-color-neutral-750);
        border-radius: var(--hp-radius-md);
      }

      &__tenant-rank {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-sm);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-300);
      }

      &__tenant-info {
        flex: 1;
        min-width: 0;
      }

      &__tenant-name {
        display: block;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
      }

      &__tenant-plan {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        text-transform: capitalize;
      }

      &__tenant-revenue {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: #22c55e;
      }

      &__quick-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-2);
      }

      &__quick-action {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-750);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-300);
        cursor: pointer;
        transition: all 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-700);
          border-color: var(--hp-color-primary);
          color: var(--hp-color-neutral-0);

          svg {
            color: var(--hp-color-primary);
          }
        }

        svg {
          width: 24px;
          height: 24px;
          transition: color 150ms;
        }

        span {
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-medium);
          text-align: center;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  revenueTimeframe = '1y';

  platformMetrics: PlatformMetric[] = [
    {
      label: 'Total Tenants',
      value: 400,
      change: 12,
      changeLabel: 'vs last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
    },
    {
      label: 'Active Users',
      value: '2,847',
      change: 8,
      changeLabel: 'vs last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    },
    {
      label: 'Monthly Revenue',
      value: '$47,850',
      change: 15,
      changeLabel: 'vs last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
    },
    {
      label: 'Jobs Completed',
      value: '18,432',
      change: 23,
      changeLabel: 'vs last month',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'
    }
  ];

  alerts: TenantAlert[] = [
    { id: '1', type: 'error', message: 'Payment failed - Invoice #4521', tenant: 'Metro Repairs', timestamp: '2 hours ago' },
    { id: '2', type: 'warning', message: 'Trial expires in 3 days', tenant: 'HomeHelp Pro', timestamp: '5 hours ago' },
    { id: '3', type: 'warning', message: 'High API usage detected', tenant: 'Quick Fix Services', timestamp: '1 day ago' },
    { id: '4', type: 'info', message: 'New enterprise inquiry', tenant: 'BuildRight Inc', timestamp: '2 days ago' }
  ];

  recentActivity: RecentActivity[] = [
    { id: '1', action: 'New tenant registered', tenant: 'ProFix Solutions', timestamp: '15 min ago' },
    { id: '2', action: 'Plan upgraded to Enterprise', tenant: 'Quick Fix Services', timestamp: '1 hour ago' },
    { id: '3', action: 'Impersonation session started', tenant: 'Acme Plumbing', user: 'Admin', timestamp: '2 hours ago' },
    { id: '4', action: 'Feature flag enabled: dark_mode', timestamp: '3 hours ago' },
    { id: '5', action: 'Subscription cancelled', tenant: 'City Services Inc', timestamp: '5 hours ago' },
    { id: '6', action: 'New support ticket created', tenant: 'Elite Maintenance', timestamp: '6 hours ago' }
  ];

  topTenants = [
    { name: 'Quick Fix Services', plan: 'enterprise', mrr: 399 },
    { name: 'Pro Fix Solutions', plan: 'enterprise', mrr: 399 },
    { name: 'AllStar Home Services', plan: 'professional', mrr: 149 },
    { name: 'Acme Plumbing', plan: 'professional', mrr: 149 },
    { name: 'Elite Maintenance', plan: 'professional', mrr: 149 }
  ];

  exportReport(): void {
    console.log('Export report');
  }

  refreshData(): void {
    console.log('Refresh data');
  }

  dismissAlert(alert: TenantAlert): void {
    const index = this.alerts.findIndex(a => a.id === alert.id);
    if (index > -1) {
      this.alerts.splice(index, 1);
    }
  }
}
