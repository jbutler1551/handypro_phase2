import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

interface Job {
  id: string;
  jobNumber: string;
  title: string;
  description: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  amount: number;
  serviceType: string;
  createdAt: string;
}

@Component({
  selector: 'hp-jobs-list',
  template: `
    <div class="hp-jobs">
      <!-- Header -->
      <div class="hp-jobs__header">
        <div class="hp-jobs__header-left">
          <h1 class="hp-jobs__title">Jobs</h1>
          <p class="hp-jobs__subtitle">Manage and track all your service jobs</p>
        </div>
        <hp-button variant="primary" (click)="createJob()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Job
        </hp-button>
      </div>

      <!-- Stats Row -->
      <div class="hp-jobs__stats">
        <div class="hp-jobs__stat">
          <span class="hp-jobs__stat-value">{{ stats.scheduled }}</span>
          <span class="hp-jobs__stat-label">Scheduled</span>
        </div>
        <div class="hp-jobs__stat">
          <span class="hp-jobs__stat-value">{{ stats.inProgress }}</span>
          <span class="hp-jobs__stat-label">In Progress</span>
        </div>
        <div class="hp-jobs__stat">
          <span class="hp-jobs__stat-value">{{ stats.completedToday }}</span>
          <span class="hp-jobs__stat-label">Completed Today</span>
        </div>
        <div class="hp-jobs__stat">
          <span class="hp-jobs__stat-value">\${{ stats.revenue | number }}</span>
          <span class="hp-jobs__stat-label">This Week</span>
        </div>
      </div>

      <!-- Filters -->
      <hp-card class="hp-jobs__filters">
        <div class="hp-jobs__filters-row">
          <div class="hp-jobs__search">
            <hp-input
              placeholder="Search jobs, customers..."
              [(ngModel)]="searchQuery"
              type="search"
            ></hp-input>
          </div>
          <div class="hp-jobs__filter-group">
            <select [(ngModel)]="statusFilter" class="hp-jobs__select">
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select [(ngModel)]="priorityFilter" class="hp-jobs__select">
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select [(ngModel)]="dateFilter" class="hp-jobs__select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </hp-card>

      <!-- Jobs Table -->
      <hp-card class="hp-jobs__table-card">
        <div class="hp-jobs__table-wrapper">
          <table class="hp-jobs__table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Scheduled</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let job of filteredJobs" (click)="viewJob(job)" class="hp-jobs__row">
                <td>
                  <span class="hp-jobs__job-number">{{ job.jobNumber }}</span>
                </td>
                <td>
                  <div class="hp-jobs__customer">
                    <span class="hp-jobs__customer-name">{{ job.customer.name }}</span>
                    <span class="hp-jobs__customer-address">{{ job.customer.address }}</span>
                  </div>
                </td>
                <td>
                  <span class="hp-jobs__service">{{ job.serviceType }}</span>
                </td>
                <td>
                  <div class="hp-jobs__schedule">
                    <span class="hp-jobs__schedule-date">{{ job.scheduledDate }}</span>
                    <span class="hp-jobs__schedule-time">{{ job.scheduledTime }}</span>
                  </div>
                </td>
                <td>
                  <div class="hp-jobs__assigned">
                    <div class="hp-jobs__avatars">
                      <div
                        *ngFor="let tech of job.assignedTo; let i = index"
                        class="hp-jobs__avatar"
                        [style.z-index]="job.assignedTo.length - i"
                        [title]="tech.name"
                      >
                        {{ getInitials(tech.name) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <hp-badge [variant]="getStatusVariant(job.status)">
                    {{ formatStatus(job.status) }}
                  </hp-badge>
                </td>
                <td>
                  <hp-badge [variant]="getPriorityVariant(job.priority)" size="sm">
                    {{ job.priority | titlecase }}
                  </hp-badge>
                </td>
                <td>
                  <span class="hp-jobs__amount">\${{ job.amount | number:'1.2-2' }}</span>
                </td>
                <td>
                  <button class="hp-jobs__menu-btn" (click)="openMenu($event, job)">
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

        <!-- Pagination -->
        <div class="hp-jobs__pagination">
          <span class="hp-jobs__pagination-info">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalJobs) }} of {{ totalJobs }} jobs
          </span>
          <div class="hp-jobs__pagination-controls">
            <button
              [disabled]="currentPage === 1"
              (click)="currentPage = currentPage - 1"
              class="hp-jobs__pagination-btn"
            >
              Previous
            </button>
            <button
              *ngFor="let page of getPages()"
              [class.hp-jobs__pagination-btn--active]="page === currentPage"
              (click)="currentPage = page"
              class="hp-jobs__pagination-btn"
            >
              {{ page }}
            </button>
            <button
              [disabled]="currentPage === totalPages"
              (click)="currentPage = currentPage + 1"
              class="hp-jobs__pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-jobs {
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 575px) {
          flex-direction: column;
          gap: var(--hp-spacing-4);
        }
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
        transition: color 200ms ease-in-out;
      }

      &__subtitle {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        margin: 0;
        transition: color 200ms ease-in-out;
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 767px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__stat {
        background-color: var(--hp-surface-card);
        border-radius: var(--hp-radius-modern-sm);
        padding: var(--hp-spacing-4) var(--hp-spacing-5);
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
        border: 1px solid var(--hp-glass-border);
        transition: background-color 200ms ease-in-out,
                    border-color 200ms ease-in-out,
                    transform var(--hp-micro-fast) ease-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-sm));
          -webkit-backdrop-filter: blur(var(--hp-blur-sm));
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--hp-shadow-lg);
        }
      }

      &__stat-value {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        transition: color 200ms ease-in-out;
      }

      &__stat-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }

      &__filters {
        margin-bottom: var(--hp-spacing-4);
      }

      &__filters-row {
        display: flex;
        gap: var(--hp-spacing-4);
        align-items: center;

        @media (max-width: 991px) {
          flex-direction: column;
          align-items: stretch;
        }
      }

      &__search {
        flex: 1;
        min-width: 200px;
      }

      &__filter-group {
        display: flex;
        gap: var(--hp-spacing-3);

        @media (max-width: 575px) {
          flex-direction: column;
        }
      }

      &__select {
        height: 44px;
        padding: 0 var(--hp-spacing-4);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        background-color: var(--hp-input-bg);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
        min-width: 140px;
        cursor: pointer;
        transition: background-color 200ms ease-in-out,
                    border-color var(--hp-micro-normal) ease-in-out,
                    color 200ms ease-in-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-subtle);
          backdrop-filter: blur(var(--hp-blur-xs));
          -webkit-backdrop-filter: blur(var(--hp-blur-xs));
        }

        &:hover {
          border-color: var(--hp-color-primary-300);
        }

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 3px var(--hp-color-primary-100),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__table-card {
        overflow: hidden;
      }

      &__table-wrapper {
        overflow-x: auto;
      }

      &__table {
        width: 100%;
        border-collapse: collapse;

        th, td {
          padding: var(--hp-spacing-3) var(--hp-spacing-4);
          text-align: left;
          white-space: nowrap;
          transition: background-color 200ms ease-in-out, color 200ms ease-in-out, border-color 200ms ease-in-out;
        }

        th {
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-text-tertiary);
          text-transform: uppercase;
          letter-spacing: var(--hp-letter-spacing-wide);
          background-color: var(--hp-glass-bg-subtle);
          border-bottom: 1px solid var(--hp-glass-border);

          @supports (backdrop-filter: blur(1px)) {
            backdrop-filter: blur(var(--hp-blur-xs));
            -webkit-backdrop-filter: blur(var(--hp-blur-xs));
          }
        }

        td {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-primary);
          border-bottom: 1px solid var(--hp-border-primary);
        }
      }

      &__row {
        cursor: pointer;
        transition: background-color 150ms;

        &:hover {
          background-color: var(--hp-bg-tertiary);
        }
      }

      &__job-number {
        font-family: var(--hp-font-family-mono);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-primary);
      }

      &__customer {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__customer-name {
        font-weight: var(--hp-font-weight-medium);
      }

      &__customer-address {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }

      &__service {
        color: var(--hp-text-secondary);
        transition: color 200ms ease-in-out;
      }

      &__schedule {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__schedule-date {
        font-weight: var(--hp-font-weight-medium);
      }

      &__schedule-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }

      &__assigned {
        display: flex;
        align-items: center;
      }

      &__avatars {
        display: flex;
      }

      &__avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: var(--hp-color-primary);
        color: white;
        font-size: 10px;
        font-weight: var(--hp-font-weight-semibold);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--hp-surface-card);
        margin-left: -8px;
        transition: border-color 200ms ease-in-out;

        &:first-child {
          margin-left: 0;
        }
      }

      &__amount {
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        transition: color 200ms ease-in-out;
      }

      &__menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-text-tertiary);
        cursor: pointer;
        transition: background-color 150ms ease-in-out, color 150ms ease-in-out;

        &:hover {
          background-color: var(--hp-bg-tertiary);
          color: var(--hp-text-secondary);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-border-primary);
        transition: border-color 200ms ease-in-out;

        @media (max-width: 575px) {
          flex-direction: column;
          gap: var(--hp-spacing-3);
        }
      }

      &__pagination-info {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }

      &__pagination-controls {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__pagination-btn {
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        background-color: var(--hp-input-bg);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    border-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-subtle);
          backdrop-filter: blur(var(--hp-blur-xs));
          -webkit-backdrop-filter: blur(var(--hp-blur-xs));
        }

        &:hover:not(:disabled) {
          background-color: var(--hp-glass-bg);
          border-color: var(--hp-color-primary-300);
          color: var(--hp-text-primary);
          transform: translateY(-1px);
        }

        &:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &--active {
          background: var(--hp-gradient-primary);
          border-color: transparent;
          color: white;
          box-shadow: var(--hp-shadow-primary);

          &:hover {
            box-shadow: var(--hp-shadow-primary), var(--hp-glow-primary-subtle);
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsListComponent {
  Math = Math;
  searchQuery = '';
  statusFilter = '';
  priorityFilter = '';
  dateFilter = 'all';
  currentPage = 1;
  pageSize = 10;

  stats = {
    scheduled: 12,
    inProgress: 5,
    completedToday: 8,
    revenue: 24850
  };

  jobs: Job[] = [
    {
      id: '1', jobNumber: 'JOB-001', title: 'Water Heater Replacement',
      description: 'Replace old water heater with new tankless unit',
      customer: { id: 'c1', name: 'John Smith', phone: '(555) 123-4567', address: '123 Oak Street, Apt 4B' },
      status: 'in_progress', priority: 'high',
      assignedTo: [{ id: 't1', name: 'Mike Wilson' }, { id: 't2', name: 'Emily Brown' }],
      scheduledDate: 'Dec 17, 2024', scheduledTime: '9:00 AM - 12:00 PM',
      estimatedDuration: 3, amount: 2850.00, serviceType: 'Plumbing',
      createdAt: '2024-12-15'
    },
    {
      id: '2', jobNumber: 'JOB-002', title: 'Kitchen Faucet Installation',
      description: 'Install new kitchen faucet and garbage disposal',
      customer: { id: 'c2', name: 'Sarah Johnson', phone: '(555) 234-5678', address: '456 Maple Ave' },
      status: 'scheduled', priority: 'medium',
      assignedTo: [{ id: 't1', name: 'Mike Wilson' }],
      scheduledDate: 'Dec 17, 2024', scheduledTime: '2:00 PM - 4:00 PM',
      estimatedDuration: 2, amount: 650.00, serviceType: 'Plumbing',
      createdAt: '2024-12-16'
    },
    {
      id: '3', jobNumber: 'JOB-003', title: 'Drain Cleaning',
      description: 'Main line drain cleaning and inspection',
      customer: { id: 'c3', name: 'Robert Davis', phone: '(555) 345-6789', address: '789 Pine Road' },
      status: 'completed', priority: 'low',
      assignedTo: [{ id: 't3', name: 'Alex Martinez' }],
      scheduledDate: 'Dec 16, 2024', scheduledTime: '10:00 AM - 11:30 AM',
      estimatedDuration: 1.5, amount: 275.00, serviceType: 'Plumbing',
      createdAt: '2024-12-14'
    },
    {
      id: '4', jobNumber: 'JOB-004', title: 'Emergency Pipe Repair',
      description: 'Burst pipe in basement causing flooding',
      customer: { id: 'c4', name: 'Lisa Anderson', phone: '(555) 456-7890', address: '321 Elm Street' },
      status: 'in_progress', priority: 'urgent',
      assignedTo: [{ id: 't1', name: 'Mike Wilson' }, { id: 't3', name: 'Alex Martinez' }],
      scheduledDate: 'Dec 17, 2024', scheduledTime: '7:00 AM - 9:00 AM',
      estimatedDuration: 2, amount: 1200.00, serviceType: 'Emergency',
      createdAt: '2024-12-17'
    },
    {
      id: '5', jobNumber: 'JOB-005', title: 'Bathroom Renovation',
      description: 'Complete bathroom plumbing for renovation project',
      customer: { id: 'c5', name: 'Michael Brown', phone: '(555) 567-8901', address: '654 Cedar Lane' },
      status: 'scheduled', priority: 'medium',
      assignedTo: [{ id: 't2', name: 'Emily Brown' }],
      scheduledDate: 'Dec 18, 2024', scheduledTime: '8:00 AM - 5:00 PM',
      estimatedDuration: 8, amount: 4500.00, serviceType: 'Plumbing',
      createdAt: '2024-12-10'
    },
    {
      id: '6', jobNumber: 'JOB-006', title: 'Toilet Installation',
      description: 'Replace two toilets with water-efficient models',
      customer: { id: 'c6', name: 'Jennifer Wilson', phone: '(555) 678-9012', address: '987 Birch Drive' },
      status: 'pending', priority: 'low',
      assignedTo: [],
      scheduledDate: 'Dec 19, 2024', scheduledTime: 'TBD',
      estimatedDuration: 2, amount: 850.00, serviceType: 'Plumbing',
      createdAt: '2024-12-15'
    },
    {
      id: '7', jobNumber: 'JOB-007', title: 'Sewer Line Inspection',
      description: 'Camera inspection of main sewer line',
      customer: { id: 'c7', name: 'David Lee', phone: '(555) 789-0123', address: '147 Walnut Court' },
      status: 'completed', priority: 'medium',
      assignedTo: [{ id: 't3', name: 'Alex Martinez' }],
      scheduledDate: 'Dec 16, 2024', scheduledTime: '2:00 PM - 3:30 PM',
      estimatedDuration: 1.5, amount: 350.00, serviceType: 'Inspection',
      createdAt: '2024-12-13'
    },
    {
      id: '8', jobNumber: 'JOB-008', title: 'Gas Line Installation',
      description: 'Run new gas line for outdoor grill',
      customer: { id: 'c8', name: 'Amanda Taylor', phone: '(555) 890-1234', address: '258 Spruce Way' },
      status: 'scheduled', priority: 'high',
      assignedTo: [{ id: 't1', name: 'Mike Wilson' }],
      scheduledDate: 'Dec 18, 2024', scheduledTime: '10:00 AM - 2:00 PM',
      estimatedDuration: 4, amount: 1800.00, serviceType: 'Gas',
      createdAt: '2024-12-12'
    },
    {
      id: '9', jobNumber: 'JOB-009', title: 'Water Softener Installation',
      description: 'Install whole-house water softener system',
      customer: { id: 'c9', name: 'Chris Martinez', phone: '(555) 901-2345', address: '369 Ash Boulevard' },
      status: 'scheduled', priority: 'medium',
      assignedTo: [{ id: 't2', name: 'Emily Brown' }, { id: 't3', name: 'Alex Martinez' }],
      scheduledDate: 'Dec 19, 2024', scheduledTime: '9:00 AM - 1:00 PM',
      estimatedDuration: 4, amount: 2200.00, serviceType: 'Plumbing',
      createdAt: '2024-12-11'
    },
    {
      id: '10', jobNumber: 'JOB-010', title: 'Leak Detection',
      description: 'Locate hidden water leak in walls',
      customer: { id: 'c10', name: 'Karen White', phone: '(555) 012-3456', address: '741 Cherry Street' },
      status: 'cancelled', priority: 'medium',
      assignedTo: [{ id: 't1', name: 'Mike Wilson' }],
      scheduledDate: 'Dec 15, 2024', scheduledTime: '11:00 AM - 1:00 PM',
      estimatedDuration: 2, amount: 450.00, serviceType: 'Inspection',
      createdAt: '2024-12-13'
    }
  ];

  get filteredJobs(): Job[] {
    return this.jobs.filter(job => {
      const matchesSearch = !this.searchQuery ||
        job.jobNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.serviceType.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || job.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || job.priority === this.priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  get totalJobs(): number {
    return this.filteredJobs.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalJobs / this.pageSize);
  }

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  getStatusVariant(status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      scheduled: 'info',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
      pending: 'neutral'
    };
    return variants[status] || 'neutral';
  }

  getPriorityVariant(priority: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'neutral'
    };
    return variants[priority] || 'neutral';
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  createJob(): void {
    console.log('Create new job');
  }

  viewJob(job: Job): void {
    this.router.navigate(['/jobs', job.id]);
  }

  openMenu(event: Event, job: Job): void {
    event.stopPropagation();
    console.log('Open menu for job', job.id);
  }
}
