import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-reports',
  template: `
    <div class="hp-reports">
      <div class="hp-reports__header">
        <div class="hp-reports__header-left">
          <h1 class="hp-reports__title">Reports</h1>
          <p class="hp-reports__subtitle">Analytics and insights for your business</p>
        </div>
        <div class="hp-reports__header-actions">
          <select [(ngModel)]="dateRange" class="hp-reports__select">
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
          <hp-button variant="outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </hp-button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="hp-reports__kpis">
        <hp-card class="hp-reports__kpi">
          <div class="hp-reports__kpi-header">
            <span class="hp-reports__kpi-label">Revenue</span>
            <span class="hp-reports__kpi-trend hp-reports__kpi-trend--up">+12.5%</span>
          </div>
          <span class="hp-reports__kpi-value">\${{ kpis.revenue | number }}</span>
          <div class="hp-reports__kpi-chart">
            <div *ngFor="let v of revenueChart" class="hp-reports__kpi-bar" [style.height.%]="v"></div>
          </div>
        </hp-card>

        <hp-card class="hp-reports__kpi">
          <div class="hp-reports__kpi-header">
            <span class="hp-reports__kpi-label">Jobs Completed</span>
            <span class="hp-reports__kpi-trend hp-reports__kpi-trend--up">+8.2%</span>
          </div>
          <span class="hp-reports__kpi-value">{{ kpis.jobsCompleted }}</span>
          <div class="hp-reports__kpi-chart">
            <div *ngFor="let v of jobsChart" class="hp-reports__kpi-bar hp-reports__kpi-bar--secondary" [style.height.%]="v"></div>
          </div>
        </hp-card>

        <hp-card class="hp-reports__kpi">
          <div class="hp-reports__kpi-header">
            <span class="hp-reports__kpi-label">New Customers</span>
            <span class="hp-reports__kpi-trend hp-reports__kpi-trend--up">+15.3%</span>
          </div>
          <span class="hp-reports__kpi-value">{{ kpis.newCustomers }}</span>
          <div class="hp-reports__kpi-chart">
            <div *ngFor="let v of customersChart" class="hp-reports__kpi-bar hp-reports__kpi-bar--success" [style.height.%]="v"></div>
          </div>
        </hp-card>

        <hp-card class="hp-reports__kpi">
          <div class="hp-reports__kpi-header">
            <span class="hp-reports__kpi-label">Avg Job Value</span>
            <span class="hp-reports__kpi-trend hp-reports__kpi-trend--down">-2.1%</span>
          </div>
          <span class="hp-reports__kpi-value">\${{ kpis.avgJobValue }}</span>
          <div class="hp-reports__kpi-chart">
            <div *ngFor="let v of avgValueChart" class="hp-reports__kpi-bar hp-reports__kpi-bar--warning" [style.height.%]="v"></div>
          </div>
        </hp-card>
      </div>

      <div class="hp-reports__grid">
        <!-- Revenue by Service -->
        <hp-card>
          <h3 class="hp-reports__card-title">Revenue by Service Type</h3>
          <div class="hp-reports__service-list">
            <div *ngFor="let service of revenueByService" class="hp-reports__service-item">
              <div class="hp-reports__service-info">
                <span class="hp-reports__service-name">{{ service.name }}</span>
                <span class="hp-reports__service-value">\${{ service.revenue | number }}</span>
              </div>
              <div class="hp-reports__service-bar">
                <div class="hp-reports__service-bar-fill" [style.width.%]="service.percentage"></div>
              </div>
              <span class="hp-reports__service-percent">{{ service.percentage }}%</span>
            </div>
          </div>
        </hp-card>

        <!-- Top Technicians -->
        <hp-card>
          <h3 class="hp-reports__card-title">Top Technicians</h3>
          <div class="hp-reports__tech-list">
            <div *ngFor="let tech of topTechnicians; let i = index" class="hp-reports__tech-item">
              <span class="hp-reports__tech-rank">{{ i + 1 }}</span>
              <div class="hp-reports__tech-avatar">{{ getInitials(tech.name) }}</div>
              <div class="hp-reports__tech-info">
                <span class="hp-reports__tech-name">{{ tech.name }}</span>
                <span class="hp-reports__tech-jobs">{{ tech.jobs }} jobs</span>
              </div>
              <div class="hp-reports__tech-stats">
                <span class="hp-reports__tech-revenue">\${{ tech.revenue | number }}</span>
                <span class="hp-reports__tech-rating">⭐ {{ tech.rating }}</span>
              </div>
            </div>
          </div>
        </hp-card>

        <!-- Jobs by Status -->
        <hp-card>
          <h3 class="hp-reports__card-title">Jobs by Status</h3>
          <div class="hp-reports__status-grid">
            <div *ngFor="let status of jobsByStatus" class="hp-reports__status-item">
              <div class="hp-reports__status-circle" [style.border-color]="status.color">
                <span>{{ status.count }}</span>
              </div>
              <span class="hp-reports__status-label">{{ status.label }}</span>
            </div>
          </div>
        </hp-card>

        <!-- Customer Insights -->
        <hp-card>
          <h3 class="hp-reports__card-title">Customer Insights</h3>
          <div class="hp-reports__insights">
            <div class="hp-reports__insight">
              <span class="hp-reports__insight-value">{{ insights.repeatRate }}%</span>
              <span class="hp-reports__insight-label">Repeat Customer Rate</span>
            </div>
            <div class="hp-reports__insight">
              <span class="hp-reports__insight-value">\${{ insights.avgLifetimeValue | number }}</span>
              <span class="hp-reports__insight-label">Avg Lifetime Value</span>
            </div>
            <div class="hp-reports__insight">
              <span class="hp-reports__insight-value">{{ insights.satisfaction }}%</span>
              <span class="hp-reports__insight-label">Satisfaction Rate</span>
            </div>
            <div class="hp-reports__insight">
              <span class="hp-reports__insight-value">{{ insights.referralRate }}%</span>
              <span class="hp-reports__insight-label">Referral Rate</span>
            </div>
          </div>
        </hp-card>
      </div>

      <!-- Recent Activity -->
      <hp-card>
        <h3 class="hp-reports__card-title">Recent Completed Jobs</h3>
        <div class="hp-reports__activity-table">
          <table>
            <thead>
              <tr><th>Job</th><th>Customer</th><th>Technician</th><th>Completed</th><th>Amount</th><th>Rating</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let job of recentJobs">
                <td><span class="hp-reports__job-number">{{ job.number }}</span> {{ job.title }}</td>
                <td>{{ job.customer }}</td>
                <td>{{ job.technician }}</td>
                <td>{{ job.completed }}</td>
                <td>\${{ job.amount | number:'1.2-2' }}</td>
                <td><span class="hp-reports__rating">⭐ {{ job.rating }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-reports {
      &__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--hp-spacing-6); flex-wrap: wrap; gap: var(--hp-spacing-4); }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); transition: color 200ms ease-in-out; }
      &__subtitle { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); margin: 0; transition: color 200ms ease-in-out; }
      &__header-actions { display: flex; gap: var(--hp-spacing-3); }
      &__select { height: 44px; padding: 0 var(--hp-spacing-3); border: 1px solid var(--hp-input-border); border-radius: var(--hp-radius-md); background-color: var(--hp-input-bg); color: var(--hp-text-primary); font-size: var(--hp-font-size-sm); min-width: 160px; transition: background-color 200ms, border-color 200ms, color 200ms; }
      &__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); margin-bottom: var(--hp-spacing-6); @media (max-width: 991px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 575px) { grid-template-columns: 1fr; } }
      &__kpi { padding: var(--hp-spacing-4) !important; }
      &__kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--hp-spacing-2); }
      &__kpi-label { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__kpi-trend { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); &--up { color: var(--hp-color-success); } &--down { color: var(--hp-color-error); } }
      &__kpi-value { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); display: block; margin-bottom: var(--hp-spacing-3); transition: color 200ms ease-in-out; }
      &__kpi-chart { display: flex; align-items: flex-end; gap: 4px; height: 40px; }
      &__kpi-bar { flex: 1; background-color: var(--hp-color-primary); border-radius: 2px; min-height: 4px; &--secondary { background-color: var(--hp-color-secondary); } &--success { background-color: var(--hp-color-success); } &--warning { background-color: var(--hp-color-warning); } }
      &__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--hp-spacing-4); margin-bottom: var(--hp-spacing-4); @media (max-width: 991px) { grid-template-columns: 1fr; } }
      &__card-title { font-size: var(--hp-font-size-base); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-4); transition: color 200ms ease-in-out; }
      &__service-list { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__service-item { display: grid; grid-template-columns: 1fr 200px 50px; align-items: center; gap: var(--hp-spacing-3); @media (max-width: 575px) { grid-template-columns: 1fr; } }
      &__service-name { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__service-value { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__service-bar { height: 8px; background-color: var(--hp-bg-tertiary); border-radius: 4px; overflow: hidden; transition: background-color 200ms ease-in-out; }
      &__service-bar-fill { height: 100%; background-color: var(--hp-color-primary); border-radius: 4px; }
      &__service-percent { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-secondary); text-align: right; transition: color 200ms ease-in-out; }
      &__tech-list { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__tech-item { display: flex; align-items: center; gap: var(--hp-spacing-3); padding: var(--hp-spacing-2) 0; }
      &__tech-rank { width: 24px; height: 24px; border-radius: 50%; background-color: var(--hp-bg-tertiary); color: var(--hp-text-primary); font-size: var(--hp-font-size-xs); font-weight: var(--hp-font-weight-bold); display: flex; align-items: center; justify-content: center; transition: background-color 200ms, color 200ms; }
      &__tech-avatar { width: 36px; height: 36px; border-radius: 50%; background-color: var(--hp-color-primary); color: white; font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); display: flex; align-items: center; justify-content: center; }
      &__tech-info { flex: 1; }
      &__tech-name { display: block; font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__tech-jobs { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__tech-stats { text-align: right; }
      &__tech-revenue { display: block; font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__tech-rating { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); @media (max-width: 575px) { grid-template-columns: repeat(2, 1fr); } }
      &__status-item { display: flex; flex-direction: column; align-items: center; gap: var(--hp-spacing-2); }
      &__status-circle { width: 64px; height: 64px; border-radius: 50%; border: 4px solid; display: flex; align-items: center; justify-content: center; font-size: var(--hp-font-size-xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__status-label { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); transition: color 200ms ease-in-out; }
      &__insights { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--hp-spacing-4); }
      &__insight { text-align: center; padding: var(--hp-spacing-4); background-color: var(--hp-bg-tertiary); border-radius: var(--hp-radius-md); transition: background-color 200ms ease-in-out; }
      &__insight-value { display: block; font-size: var(--hp-font-size-xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin-bottom: var(--hp-spacing-1); transition: color 200ms ease-in-out; }
      &__insight-label { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__activity-table { overflow-x: auto; table { width: 100%; border-collapse: collapse; th, td { padding: var(--hp-spacing-3); text-align: left; font-size: var(--hp-font-size-sm); color: var(--hp-text-primary); transition: color 200ms, border-color 200ms; } th { font-size: var(--hp-font-size-xs); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-tertiary); text-transform: uppercase; border-bottom: 1px solid var(--hp-border-primary); } td { border-bottom: 1px solid var(--hp-border-primary); } } }
      &__job-number { font-family: var(--hp-font-family-mono); color: var(--hp-color-primary); margin-right: var(--hp-spacing-2); }
      &__rating { color: var(--hp-color-warning); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  dateRange = 'month';
  kpis = { revenue: 48250, jobsCompleted: 156, newCustomers: 32, avgJobValue: 309 };
  revenueChart = [45, 60, 75, 55, 80, 70, 90];
  jobsChart = [50, 65, 55, 70, 60, 85, 75];
  customersChart = [30, 45, 55, 40, 65, 50, 70];
  avgValueChart = [60, 55, 65, 50, 45, 55, 50];

  revenueByService = [
    { name: 'Plumbing', revenue: 24500, percentage: 51 },
    { name: 'Water Heaters', revenue: 12000, percentage: 25 },
    { name: 'Emergency Services', revenue: 6500, percentage: 13 },
    { name: 'Inspections', revenue: 3250, percentage: 7 },
    { name: 'Other', revenue: 2000, percentage: 4 }
  ];

  topTechnicians = [
    { name: 'Mike Wilson', jobs: 45, revenue: 18500, rating: 4.9 },
    { name: 'Emily Brown', jobs: 38, revenue: 14200, rating: 4.8 },
    { name: 'Alex Martinez', jobs: 35, revenue: 12800, rating: 4.7 },
    { name: 'David Lee', jobs: 28, revenue: 9500, rating: 4.9 }
  ];

  jobsByStatus = [
    { label: 'Completed', count: 142, color: '#059669' },
    { label: 'In Progress', count: 8, color: '#2563EB' },
    { label: 'Scheduled', count: 12, color: '#7C3AED' },
    { label: 'Cancelled', count: 4, color: '#DC2626' }
  ];

  insights = { repeatRate: 68, avgLifetimeValue: 2450, satisfaction: 94, referralRate: 32 };

  recentJobs = [
    { number: 'JOB-156', title: 'Water Heater Install', customer: 'John Smith', technician: 'Mike W.', completed: 'Dec 16', amount: 2850, rating: 5.0 },
    { number: 'JOB-155', title: 'Drain Cleaning', customer: 'Sarah Johnson', technician: 'Alex M.', completed: 'Dec 16', amount: 275, rating: 4.5 },
    { number: 'JOB-154', title: 'Faucet Repair', customer: 'Robert Davis', technician: 'Emily B.', completed: 'Dec 15', amount: 175, rating: 5.0 },
    { number: 'JOB-153', title: 'Pipe Repair', customer: 'Lisa Anderson', technician: 'Mike W.', completed: 'Dec 15', amount: 650, rating: 4.8 }
  ];

  getInitials(name: string): string { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
}
