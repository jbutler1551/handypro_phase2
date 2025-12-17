import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface JobNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'note' | 'status_change' | 'photo';
}

@Component({
  selector: 'hp-job-detail',
  template: `
    <div class="hp-job-detail">
      <!-- Header -->
      <div class="hp-job-detail__header">
        <div class="hp-job-detail__header-left">
          <button class="hp-job-detail__back" (click)="goBack()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Jobs
          </button>
          <div class="hp-job-detail__title-row">
            <h1 class="hp-job-detail__title">{{ job.title }}</h1>
            <span class="hp-job-detail__job-number">{{ job.jobNumber }}</span>
          </div>
        </div>
        <div class="hp-job-detail__header-actions">
          <hp-button variant="outline" (click)="editJob()">Edit Job</hp-button>
          <hp-button variant="primary" (click)="updateStatus()">Update Status</hp-button>
        </div>
      </div>

      <div class="hp-job-detail__content">
        <!-- Left Column -->
        <div class="hp-job-detail__main">
          <!-- Status & Priority -->
          <hp-card class="hp-job-detail__status-card">
            <div class="hp-job-detail__status-row">
              <div class="hp-job-detail__status-item">
                <span class="hp-job-detail__status-label">Status</span>
                <hp-badge [variant]="getStatusVariant(job.status)" size="lg">
                  {{ formatStatus(job.status) }}
                </hp-badge>
              </div>
              <div class="hp-job-detail__status-item">
                <span class="hp-job-detail__status-label">Priority</span>
                <hp-badge [variant]="getPriorityVariant(job.priority)" size="lg">
                  {{ job.priority | titlecase }}
                </hp-badge>
              </div>
              <div class="hp-job-detail__status-item">
                <span class="hp-job-detail__status-label">Service Type</span>
                <span class="hp-job-detail__status-value">{{ job.serviceType }}</span>
              </div>
              <div class="hp-job-detail__status-item">
                <span class="hp-job-detail__status-label">Amount</span>
                <span class="hp-job-detail__status-value hp-job-detail__status-value--amount">
                  \${{ job.amount | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </hp-card>

          <!-- Job Details -->
          <hp-card>
            <h2 class="hp-job-detail__section-title">Job Details</h2>
            <div class="hp-job-detail__details">
              <div class="hp-job-detail__detail-row">
                <span class="hp-job-detail__detail-label">Description</span>
                <p class="hp-job-detail__detail-value">{{ job.description }}</p>
              </div>
              <div class="hp-job-detail__detail-grid">
                <div class="hp-job-detail__detail-item">
                  <span class="hp-job-detail__detail-label">Scheduled Date</span>
                  <span class="hp-job-detail__detail-value">{{ job.scheduledDate }}</span>
                </div>
                <div class="hp-job-detail__detail-item">
                  <span class="hp-job-detail__detail-label">Scheduled Time</span>
                  <span class="hp-job-detail__detail-value">{{ job.scheduledTime }}</span>
                </div>
                <div class="hp-job-detail__detail-item">
                  <span class="hp-job-detail__detail-label">Estimated Duration</span>
                  <span class="hp-job-detail__detail-value">{{ job.estimatedDuration }} hours</span>
                </div>
                <div class="hp-job-detail__detail-item">
                  <span class="hp-job-detail__detail-label">Created</span>
                  <span class="hp-job-detail__detail-value">{{ job.createdAt }}</span>
                </div>
              </div>
            </div>
          </hp-card>

          <!-- Activity Timeline -->
          <hp-card>
            <div class="hp-job-detail__activity-header">
              <h2 class="hp-job-detail__section-title">Activity</h2>
              <hp-button variant="outline" size="sm" (click)="addNote()">Add Note</hp-button>
            </div>
            <div class="hp-job-detail__timeline">
              <div *ngFor="let note of notes" class="hp-job-detail__timeline-item">
                <div class="hp-job-detail__timeline-marker"
                     [class.hp-job-detail__timeline-marker--status]="note.type === 'status_change'"
                     [class.hp-job-detail__timeline-marker--photo]="note.type === 'photo'">
                </div>
                <div class="hp-job-detail__timeline-content">
                  <div class="hp-job-detail__timeline-header">
                    <span class="hp-job-detail__timeline-author">{{ note.author }}</span>
                    <span class="hp-job-detail__timeline-time">{{ note.timestamp }}</span>
                  </div>
                  <p class="hp-job-detail__timeline-text">{{ note.content }}</p>
                </div>
              </div>
            </div>
          </hp-card>
        </div>

        <!-- Right Sidebar -->
        <div class="hp-job-detail__sidebar">
          <!-- Customer Info -->
          <hp-card>
            <h3 class="hp-job-detail__card-title">Customer</h3>
            <div class="hp-job-detail__customer">
              <div class="hp-job-detail__customer-avatar">
                {{ getInitials(job.customer.name) }}
              </div>
              <div class="hp-job-detail__customer-info">
                <span class="hp-job-detail__customer-name">{{ job.customer.name }}</span>
                <a href="tel:{{ job.customer.phone }}" class="hp-job-detail__customer-phone">
                  {{ job.customer.phone }}
                </a>
              </div>
            </div>
            <div class="hp-job-detail__customer-address">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ job.customer.address }}</span>
            </div>
            <div class="hp-job-detail__customer-actions">
              <hp-button variant="outline" size="sm" [fullWidth]="true">View Customer</hp-button>
            </div>
          </hp-card>

          <!-- Assigned Team -->
          <hp-card>
            <h3 class="hp-job-detail__card-title">Assigned Team</h3>
            <div class="hp-job-detail__team">
              <div *ngFor="let tech of job.assignedTo" class="hp-job-detail__team-member">
                <div class="hp-job-detail__team-avatar">{{ getInitials(tech.name) }}</div>
                <div class="hp-job-detail__team-info">
                  <span class="hp-job-detail__team-name">{{ tech.name }}</span>
                  <span class="hp-job-detail__team-role">{{ tech.role }}</span>
                </div>
              </div>
              <div *ngIf="job.assignedTo.length === 0" class="hp-job-detail__team-empty">
                No team members assigned
              </div>
            </div>
            <hp-button variant="outline" size="sm" [fullWidth]="true" (click)="assignTeam()">
              Manage Team
            </hp-button>
          </hp-card>

          <!-- Line Items -->
          <hp-card>
            <h3 class="hp-job-detail__card-title">Line Items</h3>
            <div class="hp-job-detail__line-items">
              <div *ngFor="let item of lineItems" class="hp-job-detail__line-item">
                <div class="hp-job-detail__line-item-info">
                  <span class="hp-job-detail__line-item-name">{{ item.name }}</span>
                  <span class="hp-job-detail__line-item-qty">x{{ item.quantity }}</span>
                </div>
                <span class="hp-job-detail__line-item-price">\${{ item.total | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="hp-job-detail__line-items-total">
              <span>Total</span>
              <span>\${{ job.amount | number:'1.2-2' }}</span>
            </div>
          </hp-card>

          <!-- Quick Actions -->
          <hp-card>
            <h3 class="hp-job-detail__card-title">Quick Actions</h3>
            <div class="hp-job-detail__actions-list">
              <button class="hp-job-detail__action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Create Invoice
              </button>
              <button class="hp-job-detail__action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Reschedule
              </button>
              <button class="hp-job-detail__action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Send to Customer
              </button>
              <button class="hp-job-detail__action-btn hp-job-detail__action-btn--danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Cancel Job
              </button>
            </div>
          </hp-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-job-detail {
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 767px) {
          flex-direction: column;
          gap: var(--hp-spacing-4);
        }
      }

      &__back {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        padding: 0;
        background: none;
        border: none;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        cursor: pointer;
        margin-bottom: var(--hp-spacing-2);

        &:hover {
          color: var(--hp-color-primary);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__title-row {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        flex-wrap: wrap;
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
        margin: 0;
      }

      &__job-number {
        font-family: var(--hp-font-family-mono);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        background-color: var(--hp-color-neutral-100);
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        border-radius: var(--hp-radius-sm);
      }

      &__header-actions {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__content {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: var(--hp-spacing-6);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      &__main {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__status-card {
        padding: var(--hp-spacing-4) !important;
      }

      &__status-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 767px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      &__status-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__status-label {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__status-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);

        &--amount {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-bold);
        }
      }

      &__section-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__card-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__details {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__detail-row {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__detail-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__detail-label {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-500);
      }

      &__detail-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-900);
        margin: 0;
      }

      &__activity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);

        .hp-job-detail__section-title {
          margin-bottom: 0;
        }
      }

      &__timeline {
        display: flex;
        flex-direction: column;
      }

      &__timeline-item {
        display: flex;
        gap: var(--hp-spacing-3);
        padding-bottom: var(--hp-spacing-4);
        position: relative;

        &:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 20px;
          bottom: 0;
          width: 2px;
          background-color: var(--hp-color-neutral-200);
        }
      }

      &__timeline-marker {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: var(--hp-color-neutral-300);
        flex-shrink: 0;
        margin-top: 2px;

        &--status {
          background-color: var(--hp-color-primary);
        }

        &--photo {
          background-color: var(--hp-color-success);
        }
      }

      &__timeline-content {
        flex: 1;
      }

      &__timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-1);
      }

      &__timeline-author {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__timeline-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-400);
      }

      &__timeline-text {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        margin: 0;
        line-height: 1.5;
      }

      &__customer {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-3);
      }

      &__customer-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--hp-color-primary);
        color: white;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__customer-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__customer-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__customer-phone {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      &__customer-address {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        margin-bottom: var(--hp-spacing-4);

        svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }
      }

      &__team {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-4);
      }

      &__team-member {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__team-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: var(--hp-color-secondary);
        color: white;
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__team-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__team-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__team-role {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__team-empty {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        text-align: center;
        padding: var(--hp-spacing-4);
      }

      &__line-items {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-3);
      }

      &__line-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-2) 0;
        border-bottom: 1px solid var(--hp-color-neutral-100);
      }

      &__line-item-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
      }

      &__line-item-name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
      }

      &__line-item-qty {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-400);
      }

      &__line-item-price {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__line-items-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
      }

      &__actions-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__action-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: none;
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
        cursor: pointer;
        transition: all 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-50);
          border-color: var(--hp-color-neutral-300);
        }

        svg {
          width: 16px;
          height: 16px;
        }

        &--danger {
          color: var(--hp-color-error);
          border-color: var(--hp-color-error-100);

          &:hover {
            background-color: var(--hp-color-error-50);
            border-color: var(--hp-color-error-200);
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobDetailComponent {
  job = {
    id: '1',
    jobNumber: 'JOB-001',
    title: 'Water Heater Replacement',
    description: 'Replace the existing 40-gallon tank water heater with a new Rheem tankless water heater. Includes removal of old unit, installation of new unit, and updating gas connections as needed. Customer has requested testing of all hot water fixtures after installation.',
    customer: {
      id: 'c1',
      name: 'John Smith',
      phone: '(555) 123-4567',
      address: '123 Oak Street, Apt 4B, Springfield, IL 62701'
    },
    status: 'in_progress' as const,
    priority: 'high' as const,
    assignedTo: [
      { id: 't1', name: 'Mike Wilson', role: 'Lead Technician' },
      { id: 't2', name: 'Emily Brown', role: 'Assistant' }
    ],
    scheduledDate: 'December 17, 2024',
    scheduledTime: '9:00 AM - 12:00 PM',
    estimatedDuration: 3,
    amount: 2850.00,
    serviceType: 'Plumbing',
    createdAt: 'December 15, 2024'
  };

  lineItems = [
    { name: 'Rheem Tankless Water Heater', quantity: 1, total: 1800.00 },
    { name: 'Gas Line Fittings', quantity: 1, total: 150.00 },
    { name: 'Venting Kit', quantity: 1, total: 200.00 },
    { name: 'Labor (3 hours)', quantity: 3, total: 600.00 },
    { name: 'Disposal Fee', quantity: 1, total: 100.00 }
  ];

  notes: JobNote[] = [
    {
      id: '1',
      author: 'Mike Wilson',
      content: 'Arrived on site. Customer showed us the old water heater location. Starting removal process.',
      timestamp: '9:15 AM',
      type: 'note'
    },
    {
      id: '2',
      author: 'System',
      content: 'Job status changed from Scheduled to In Progress',
      timestamp: '9:10 AM',
      type: 'status_change'
    },
    {
      id: '3',
      author: 'Emily Brown',
      content: 'Old water heater has been disconnected and removed. Gas line capped temporarily.',
      timestamp: '10:30 AM',
      type: 'note'
    },
    {
      id: '4',
      author: 'Mike Wilson',
      content: 'New tankless unit mounted on wall. Beginning gas and water connections.',
      timestamp: '11:00 AM',
      type: 'photo'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

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

  editJob(): void {
    console.log('Edit job');
  }

  updateStatus(): void {
    console.log('Update status');
  }

  addNote(): void {
    console.log('Add note');
  }

  assignTeam(): void {
    console.log('Assign team');
  }
}
