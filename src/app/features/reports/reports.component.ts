import { Component, ChangeDetectionStrategy } from '@angular/core';

interface ReportCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  lastGenerated: Date | null;
  type: 'franchise' | 'billing' | 'compliance' | 'usage';
}

@Component({
  selector: 'hp-reports',
  template: `
    <div class="hp-reports">
      <div class="hp-reports__header">
        <div>
          <h1 class="hp-reports__title">Reports & Analytics</h1>
          <p class="hp-reports__subtitle">Generate insights and export data across your franchise network.</p>
        </div>
        <div class="hp-reports__header-actions">
          <hp-button variant="outline" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-reports__btn-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Schedule Report
          </hp-button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="hp-reports__quick-stats">
        <div class="hp-reports__stat">
          <span class="hp-reports__stat-value">$45,890</span>
          <span class="hp-reports__stat-label">Monthly Revenue</span>
          <span class="hp-reports__stat-change positive">+15% vs last month</span>
        </div>
        <div class="hp-reports__stat">
          <span class="hp-reports__stat-value">15</span>
          <span class="hp-reports__stat-label">Active Franchises</span>
          <span class="hp-reports__stat-change positive">+2 this quarter</span>
        </div>
        <div class="hp-reports__stat">
          <span class="hp-reports__stat-value">94%</span>
          <span class="hp-reports__stat-label">Compliance Rate</span>
          <span class="hp-reports__stat-change positive">+3% vs last month</span>
        </div>
        <div class="hp-reports__stat">
          <span class="hp-reports__stat-value">48</span>
          <span class="hp-reports__stat-label">Active Technicians</span>
          <span class="hp-reports__stat-change positive">+5 this month</span>
        </div>
      </div>

      <!-- Report Categories -->
      <div class="hp-reports__categories">
        <button
          *ngFor="let cat of categories"
          class="hp-reports__category"
          [class.hp-reports__category--active]="selectedCategory === cat.id"
          (click)="selectedCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Reports Grid -->
      <div class="hp-reports__grid">
        <hp-card *ngFor="let report of filteredReports" class="hp-reports__card">
          <div class="hp-reports__card-header">
            <div class="hp-reports__card-icon" [innerHTML]="report.icon"></div>
            <hp-badge [variant]="getTypeBadge(report.type)" size="sm">{{ getTypeLabel(report.type) }}</hp-badge>
          </div>
          <h3 class="hp-reports__card-title">{{ report.name }}</h3>
          <p class="hp-reports__card-description">{{ report.description }}</p>
          <div class="hp-reports__card-footer">
            <span class="hp-reports__card-last">
              {{ report.lastGenerated ? 'Last generated: ' + (report.lastGenerated | date:'MMM d, yyyy') : 'Never generated' }}
            </span>
            <div class="hp-reports__card-actions">
              <hp-button variant="outline" size="sm">Preview</hp-button>
              <hp-button variant="primary" size="sm">Generate</hp-button>
            </div>
          </div>
        </hp-card>
      </div>

      <!-- Recent Reports -->
      <hp-card class="hp-reports__recent">
        <div class="hp-reports__section-header">
          <h2 class="hp-reports__section-title">Recently Generated</h2>
          <hp-button variant="ghost" size="sm">View All</hp-button>
        </div>
        <div class="hp-reports__recent-list">
          <div *ngFor="let item of recentReports" class="hp-reports__recent-item">
            <div class="hp-reports__recent-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="hp-reports__recent-info">
              <span class="hp-reports__recent-name">{{ item.name }}</span>
              <span class="hp-reports__recent-date">{{ item.date | date:'MMM d, yyyy h:mm a' }}</span>
            </div>
            <div class="hp-reports__recent-actions">
              <button class="hp-reports__action-btn" title="Download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button class="hp-reports__action-btn" title="Share">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-reports {
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

      &__quick-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }
      }

      &__stat {
        display: flex;
        flex-direction: column;
        padding: var(--hp-spacing-5);
        background: var(--hp-glass-bg-prominent);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
      }

      &__stat-value {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__stat-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin-top: var(--hp-spacing-1);
      }

      &__stat-change {
        font-size: var(--hp-font-size-xs);
        margin-top: var(--hp-spacing-2);

        &.positive { color: var(--hp-color-success); }
        &.negative { color: var(--hp-color-error); }
      }

      &__categories {
        display: flex;
        gap: var(--hp-spacing-2);
        flex-wrap: wrap;
      }

      &__category {
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        &:hover {
          background: var(--hp-glass-bg);
          color: var(--hp-text-primary);
        }

        &--active {
          background: var(--hp-gradient-primary);
          border-color: transparent;
          color: white;
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }
      }

      &__card {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      &__card-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
        color: var(--hp-color-primary);

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__card-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0;
      }

      &__card-description {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0;
        line-height: 1.5;
      }

      &__card-footer {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        margin-top: auto;
        padding-top: var(--hp-spacing-3);
        border-top: 1px solid var(--hp-glass-border);
      }

      &__card-last {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__card-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);
      }

      &__section-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0;
      }

      &__recent-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__recent-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__recent-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--hp-glass-bg);
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-color-primary);

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__recent-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__recent-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__recent-date {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__recent-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__action-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          background: var(--hp-glass-bg);
          color: var(--hp-color-primary);
          border-color: var(--hp-color-primary);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: 'All Reports' },
    { id: 'franchise', name: 'Franchise' },
    { id: 'billing', name: 'Billing' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'usage', name: 'Usage' }
  ];

  reports: ReportCard[] = [
    {
      id: '1',
      name: 'Franchise Performance',
      description: 'Comprehensive overview of all franchise locations including revenue, jobs completed, and customer ratings.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      lastGenerated: new Date('2024-12-15'),
      type: 'franchise'
    },
    {
      id: '2',
      name: 'Monthly Revenue',
      description: 'Detailed breakdown of revenue by franchise, plan type, and payment method.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      lastGenerated: new Date('2024-12-18'),
      type: 'billing'
    },
    {
      id: '3',
      name: 'Compliance Summary',
      description: 'Status of insurance, licenses, and certifications across all franchises.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      lastGenerated: new Date('2024-12-10'),
      type: 'compliance'
    },
    {
      id: '4',
      name: 'Platform Usage',
      description: 'User activity, feature adoption, and engagement metrics.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      lastGenerated: null,
      type: 'usage'
    },
    {
      id: '5',
      name: 'Technician Report',
      description: 'Performance metrics and certifications for all technicians by franchise.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      lastGenerated: new Date('2024-12-05'),
      type: 'franchise'
    },
    {
      id: '6',
      name: 'Invoice History',
      description: 'Complete history of all invoices with payment status and aging.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
      lastGenerated: new Date('2024-12-01'),
      type: 'billing'
    }
  ];

  recentReports = [
    { name: 'Monthly Revenue Report - December 2024', date: new Date('2024-12-18T14:30:00') },
    { name: 'Franchise Performance Q4 2024', date: new Date('2024-12-15T09:15:00') },
    { name: 'Compliance Summary - All Franchises', date: new Date('2024-12-10T16:45:00') },
    { name: 'Technician Certification Report', date: new Date('2024-12-05T11:00:00') }
  ];

  get filteredReports(): ReportCard[] {
    if (this.selectedCategory === 'all') return this.reports;
    return this.reports.filter(r => r.type === this.selectedCategory);
  }

  getTypeBadge(type: string): 'primary' | 'success' | 'warning' | 'info' {
    switch (type) {
      case 'franchise': return 'primary';
      case 'billing': return 'success';
      case 'compliance': return 'warning';
      case 'usage': return 'info';
      default: return 'primary';
    }
  }

  getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
