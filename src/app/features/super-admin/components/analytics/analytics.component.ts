import { Component, ChangeDetectionStrategy } from '@angular/core';

interface MetricCard {
  label: string;
  value: string;
  change: number;
  period: string;
}

interface UsageMetric {
  label: string;
  current: number;
  max: number;
  unit: string;
}

@Component({
  selector: 'hp-admin-analytics',
  template: `
    <div class="hp-admin-analytics">
      <!-- Header -->
      <div class="hp-admin-analytics__header">
        <div class="hp-admin-analytics__title-section">
          <h1 class="hp-admin-analytics__title">Platform Analytics</h1>
          <p class="hp-admin-analytics__subtitle">Deep insights into platform performance and usage</p>
        </div>
        <div class="hp-admin-analytics__controls">
          <select [(ngModel)]="selectedTimeframe" class="hp-admin-analytics__select">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <hp-button variant="outline" (click)="exportData()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </hp-button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="hp-admin-analytics__metrics">
        <div *ngFor="let metric of keyMetrics" class="hp-admin-analytics__metric-card">
          <span class="hp-admin-analytics__metric-label">{{ metric.label }}</span>
          <span class="hp-admin-analytics__metric-value">{{ metric.value }}</span>
          <span class="hp-admin-analytics__metric-change" [class.positive]="metric.change > 0" [class.negative]="metric.change < 0">
            {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}% {{ metric.period }}
          </span>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="hp-admin-analytics__grid">
        <!-- Revenue Trend -->
        <div class="hp-admin-analytics__card hp-admin-analytics__card--wide">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">Revenue Trend</h2>
            <div class="hp-admin-analytics__legend">
              <span class="hp-admin-analytics__legend-item">
                <span class="hp-admin-analytics__legend-dot" style="background: var(--hp-color-primary);"></span>
                MRR
              </span>
              <span class="hp-admin-analytics__legend-item">
                <span class="hp-admin-analytics__legend-dot" style="background: #22c55e;"></span>
                New Revenue
              </span>
              <span class="hp-admin-analytics__legend-item">
                <span class="hp-admin-analytics__legend-dot" style="background: var(--hp-color-error);"></span>
                Churn
              </span>
            </div>
          </div>
          <div class="hp-admin-analytics__line-chart">
            <div class="hp-admin-analytics__chart-area">
              <svg viewBox="0 0 800 200" preserveAspectRatio="none" class="hp-admin-analytics__chart-svg">
                <!-- Grid lines -->
                <line x1="0" y1="50" x2="800" y2="50" stroke="var(--hp-color-neutral-700)" stroke-dasharray="4"/>
                <line x1="0" y1="100" x2="800" y2="100" stroke="var(--hp-color-neutral-700)" stroke-dasharray="4"/>
                <line x1="0" y1="150" x2="800" y2="150" stroke="var(--hp-color-neutral-700)" stroke-dasharray="4"/>
                <!-- MRR Line -->
                <path d="M 0 180 L 67 165 L 133 150 L 200 140 L 267 125 L 333 110 L 400 95 L 467 85 L 533 70 L 600 55 L 667 45 L 733 35 L 800 20"
                  fill="none" stroke="var(--hp-color-primary)" stroke-width="3"/>
                <!-- New Revenue Line -->
                <path d="M 0 185 L 67 175 L 133 168 L 200 160 L 267 155 L 333 145 L 400 138 L 467 132 L 533 125 L 600 118 L 667 112 L 733 105 L 800 100"
                  fill="none" stroke="#22c55e" stroke-width="2"/>
              </svg>
            </div>
            <div class="hp-admin-analytics__chart-labels">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        <!-- Tenant Growth -->
        <div class="hp-admin-analytics__card">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">Tenant Growth</h2>
          </div>
          <div class="hp-admin-analytics__growth-chart">
            <div class="hp-admin-analytics__growth-bars">
              <div *ngFor="let month of tenantGrowth" class="hp-admin-analytics__growth-bar-wrapper">
                <div class="hp-admin-analytics__growth-bar" [style.height.%]="(month.value / 50) * 100">
                  <span class="hp-admin-analytics__growth-value">{{ month.value }}</span>
                </div>
                <span class="hp-admin-analytics__growth-label">{{ month.month }}</span>
              </div>
            </div>
          </div>
          <div class="hp-admin-analytics__growth-summary">
            <div class="hp-admin-analytics__growth-stat">
              <span class="hp-admin-analytics__growth-stat-value">+156</span>
              <span class="hp-admin-analytics__growth-stat-label">New tenants this quarter</span>
            </div>
            <div class="hp-admin-analytics__growth-stat">
              <span class="hp-admin-analytics__growth-stat-value">39%</span>
              <span class="hp-admin-analytics__growth-stat-label">Growth rate</span>
            </div>
          </div>
        </div>

        <!-- User Activity -->
        <div class="hp-admin-analytics__card">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">User Activity</h2>
          </div>
          <div class="hp-admin-analytics__activity-stats">
            <div class="hp-admin-analytics__activity-stat">
              <span class="hp-admin-analytics__activity-value">2,847</span>
              <span class="hp-admin-analytics__activity-label">Daily Active Users</span>
              <span class="hp-admin-analytics__activity-change positive">+12%</span>
            </div>
            <div class="hp-admin-analytics__activity-stat">
              <span class="hp-admin-analytics__activity-value">8,234</span>
              <span class="hp-admin-analytics__activity-label">Weekly Active Users</span>
              <span class="hp-admin-analytics__activity-change positive">+8%</span>
            </div>
            <div class="hp-admin-analytics__activity-stat">
              <span class="hp-admin-analytics__activity-value">15,678</span>
              <span class="hp-admin-analytics__activity-label">Monthly Active Users</span>
              <span class="hp-admin-analytics__activity-change positive">+15%</span>
            </div>
          </div>
          <div class="hp-admin-analytics__activity-heatmap">
            <span class="hp-admin-analytics__heatmap-label">Activity by day</span>
            <div class="hp-admin-analytics__heatmap-grid">
              <div *ngFor="let day of activityHeatmap" class="hp-admin-analytics__heatmap-cell"
                [style.opacity]="0.3 + (day.value / 100) * 0.7"
                [title]="day.label + ': ' + day.value + '%'">
              </div>
            </div>
            <div class="hp-admin-analytics__heatmap-days">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        <!-- API Usage -->
        <div class="hp-admin-analytics__card">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">API Usage</h2>
          </div>
          <div class="hp-admin-analytics__usage-metrics">
            <div *ngFor="let usage of apiUsage" class="hp-admin-analytics__usage-item">
              <div class="hp-admin-analytics__usage-header">
                <span class="hp-admin-analytics__usage-label">{{ usage.label }}</span>
                <span class="hp-admin-analytics__usage-value">{{ usage.current | number }}{{ usage.unit }}</span>
              </div>
              <div class="hp-admin-analytics__usage-bar">
                <div class="hp-admin-analytics__usage-fill" [style.width.%]="(usage.current / usage.max) * 100"></div>
              </div>
              <span class="hp-admin-analytics__usage-max">of {{ usage.max | number }}{{ usage.unit }}</span>
            </div>
          </div>
        </div>

        <!-- Geographic Distribution -->
        <div class="hp-admin-analytics__card">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">Geographic Distribution</h2>
          </div>
          <div class="hp-admin-analytics__geo-list">
            <div *ngFor="let region of geoDistribution" class="hp-admin-analytics__geo-item">
              <div class="hp-admin-analytics__geo-info">
                <span class="hp-admin-analytics__geo-flag">{{ region.flag }}</span>
                <span class="hp-admin-analytics__geo-name">{{ region.name }}</span>
              </div>
              <div class="hp-admin-analytics__geo-bar-wrapper">
                <div class="hp-admin-analytics__geo-bar" [style.width.%]="region.percentage"></div>
              </div>
              <span class="hp-admin-analytics__geo-value">{{ region.count }} ({{ region.percentage }}%)</span>
            </div>
          </div>
        </div>

        <!-- Feature Usage -->
        <div class="hp-admin-analytics__card">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">Feature Usage</h2>
          </div>
          <div class="hp-admin-analytics__feature-list">
            <div *ngFor="let feature of featureUsage" class="hp-admin-analytics__feature-item">
              <div class="hp-admin-analytics__feature-info">
                <span class="hp-admin-analytics__feature-name">{{ feature.name }}</span>
                <span class="hp-admin-analytics__feature-adoption">{{ feature.adoption }}% adoption</span>
              </div>
              <div class="hp-admin-analytics__feature-bar-wrapper">
                <div class="hp-admin-analytics__feature-bar" [style.width.%]="feature.adoption"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversion Funnel -->
        <div class="hp-admin-analytics__card hp-admin-analytics__card--wide">
          <div class="hp-admin-analytics__card-header">
            <h2 class="hp-admin-analytics__card-title">Conversion Funnel</h2>
          </div>
          <div class="hp-admin-analytics__funnel">
            <div *ngFor="let stage of conversionFunnel; let i = index" class="hp-admin-analytics__funnel-stage">
              <div class="hp-admin-analytics__funnel-bar" [style.width.%]="stage.width">
                <span class="hp-admin-analytics__funnel-count">{{ stage.count | number }}</span>
              </div>
              <div class="hp-admin-analytics__funnel-info">
                <span class="hp-admin-analytics__funnel-label">{{ stage.label }}</span>
                <span *ngIf="i > 0" class="hp-admin-analytics__funnel-rate">{{ stage.rate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-admin-analytics {
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

      &__controls {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__select {
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-0);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
        }
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
        flex-direction: column;
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__metric-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin-bottom: var(--hp-spacing-2);
      }

      &__metric-value {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        margin-bottom: var(--hp-spacing-1);
      }

      &__metric-change {
        font-size: var(--hp-font-size-sm);

        &.positive {
          color: #22c55e;
        }

        &.negative {
          color: var(--hp-color-error);
        }
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

      &__legend {
        display: flex;
        gap: var(--hp-spacing-4);
      }

      &__legend-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-400);
      }

      &__legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &__line-chart {
        margin-bottom: var(--hp-spacing-4);
      }

      &__chart-area {
        height: 200px;
        margin-bottom: var(--hp-spacing-2);
      }

      &__chart-svg {
        width: 100%;
        height: 100%;
      }

      &__chart-labels {
        display: flex;
        justify-content: space-between;

        span {
          font-size: var(--hp-font-size-xs);
          color: var(--hp-color-neutral-500);
        }
      }

      &__growth-chart {
        margin-bottom: var(--hp-spacing-4);
      }

      &__growth-bars {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 160px;
        padding-bottom: var(--hp-spacing-6);
      }

      &__growth-bar-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      &__growth-bar {
        width: 70%;
        max-width: 40px;
        background: linear-gradient(180deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-sm) var(--hp-radius-sm) 0 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: var(--hp-spacing-1);
        min-height: 20px;
      }

      &__growth-value {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-bold);
        color: white;
      }

      &__growth-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: var(--hp-spacing-2);
      }

      &__growth-summary {
        display: flex;
        gap: var(--hp-spacing-4);
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-700);
      }

      &__growth-stat {
        flex: 1;
        text-align: center;
      }

      &__growth-stat-value {
        display: block;
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: #22c55e;
      }

      &__growth-stat-label {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: 2px;
      }

      &__activity-stats {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-4);
      }

      &__activity-stat {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background-color: var(--hp-color-neutral-750);
        border-radius: var(--hp-radius-md);
      }

      &__activity-value {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        min-width: 80px;
      }

      &__activity-label {
        flex: 1;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__activity-change {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);

        &.positive {
          color: #22c55e;
        }
      }

      &__activity-heatmap {
        padding-top: var(--hp-spacing-3);
        border-top: 1px solid var(--hp-color-neutral-700);
      }

      &__heatmap-label {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-bottom: var(--hp-spacing-2);
      }

      &__heatmap-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: var(--hp-spacing-1);
      }

      &__heatmap-cell {
        aspect-ratio: 1;
        background-color: var(--hp-color-primary);
        border-radius: 3px;
        cursor: pointer;
      }

      &__heatmap-days {
        display: flex;
        justify-content: space-between;

        span {
          font-size: 10px;
          color: var(--hp-color-neutral-500);
        }
      }

      &__usage-metrics {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__usage-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__usage-header {
        display: flex;
        justify-content: space-between;
      }

      &__usage-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__usage-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
      }

      &__usage-bar {
        height: 8px;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-full);
        overflow: hidden;
      }

      &__usage-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-full);
        transition: width 300ms ease;
      }

      &__usage-max {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__geo-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__geo-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__geo-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        min-width: 120px;
      }

      &__geo-flag {
        font-size: var(--hp-font-size-lg);
      }

      &__geo-name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-200);
      }

      &__geo-bar-wrapper {
        flex: 1;
        height: 8px;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-full);
        overflow: hidden;
      }

      &__geo-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-full);
      }

      &__geo-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        min-width: 80px;
        text-align: right;
      }

      &__feature-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__feature-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__feature-info {
        display: flex;
        justify-content: space-between;
      }

      &__feature-name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-200);
      }

      &__feature-adoption {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__feature-bar-wrapper {
        height: 6px;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-full);
        overflow: hidden;
      }

      &__feature-bar {
        height: 100%;
        background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
        border-radius: var(--hp-radius-full);
      }

      &__funnel {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__funnel-stage {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__funnel-bar {
        height: 40px;
        background: linear-gradient(90deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 80px;
      }

      &__funnel-count {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-bold);
        color: white;
      }

      &__funnel-info {
        display: flex;
        flex-direction: column;
      }

      &__funnel-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-200);
      }

      &__funnel-rate {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnalyticsComponent {
  selectedTimeframe = '30d';

  keyMetrics: MetricCard[] = [
    { label: 'Total MRR', value: '$47,850', change: 15, period: 'vs last month' },
    { label: 'Avg Revenue Per User', value: '$119.62', change: 8, period: 'vs last month' },
    { label: 'Customer Lifetime Value', value: '$2,870', change: 12, period: 'vs last quarter' },
    { label: 'Net Revenue Retention', value: '112%', change: 5, period: 'vs last month' }
  ];

  tenantGrowth = [
    { month: 'Jul', value: 28 },
    { month: 'Aug', value: 35 },
    { month: 'Sep', value: 42 },
    { month: 'Oct', value: 38 },
    { month: 'Nov', value: 45 },
    { month: 'Dec', value: 50 }
  ];

  activityHeatmap = [
    { label: 'Mon', value: 85 },
    { label: 'Tue', value: 92 },
    { label: 'Wed', value: 88 },
    { label: 'Thu', value: 95 },
    { label: 'Fri', value: 78 },
    { label: 'Sat', value: 45 },
    { label: 'Sun', value: 35 }
  ];

  apiUsage: UsageMetric[] = [
    { label: 'API Requests', current: 2450000, max: 5000000, unit: '' },
    { label: 'Storage Used', current: 847, max: 2000, unit: ' GB' },
    { label: 'Bandwidth', current: 1.2, max: 5, unit: ' TB' }
  ];

  geoDistribution = [
    { flag: '🇺🇸', name: 'United States', count: 245, percentage: 61 },
    { flag: '🇬🇧', name: 'United Kingdom', count: 52, percentage: 13 },
    { flag: '🇨🇦', name: 'Canada', count: 48, percentage: 12 },
    { flag: '🇦🇺', name: 'Australia', count: 35, percentage: 9 },
    { flag: '🌍', name: 'Other', count: 20, percentage: 5 }
  ];

  featureUsage = [
    { name: 'Job Scheduling', adoption: 94 },
    { name: 'Invoicing', adoption: 87 },
    { name: 'Customer Portal', adoption: 72 },
    { name: 'Team Management', adoption: 68 },
    { name: 'Reporting', adoption: 54 },
    { name: 'API Integration', adoption: 32 }
  ];

  conversionFunnel = [
    { label: 'Website Visitors', count: 15000, width: 100, rate: 0 },
    { label: 'Trial Signups', count: 1200, width: 80, rate: 8 },
    { label: 'Activated Users', count: 720, width: 60, rate: 60 },
    { label: 'Paid Conversion', count: 400, width: 40, rate: 56 }
  ];

  exportData(): void {
    console.log('Export analytics data');
  }
}
