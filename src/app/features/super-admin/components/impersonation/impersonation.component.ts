import { Component, ChangeDetectionStrategy } from '@angular/core';

interface ImpersonationSession {
  id: string;
  tenantName: string;
  tenantId: string;
  adminUser: string;
  startedAt: string;
  endedAt?: string;
  duration: string;
  status: 'active' | 'ended';
  actions: number;
}

@Component({
  selector: 'hp-admin-impersonation',
  template: `
    <div class="hp-impersonation">
      <div class="hp-impersonation__header">
        <div class="hp-impersonation__title-section">
          <h1 class="hp-impersonation__title">Impersonation</h1>
          <p class="hp-impersonation__subtitle">Access tenant accounts for support and troubleshooting</p>
        </div>
      </div>

      <!-- Quick Impersonate -->
      <div class="hp-impersonation__quick">
        <h2 class="hp-impersonation__section-title">Quick Impersonate</h2>
        <div class="hp-impersonation__search-card">
          <div class="hp-impersonation__search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Search tenant by name or ID..." [(ngModel)]="searchQuery" />
          </div>
          <div *ngIf="searchResults.length > 0" class="hp-impersonation__search-results">
            <div *ngFor="let tenant of searchResults" class="hp-impersonation__search-result" (click)="impersonate(tenant)">
              <div class="hp-impersonation__tenant-avatar">{{ tenant.initials }}</div>
              <div class="hp-impersonation__tenant-info">
                <span class="hp-impersonation__tenant-name">{{ tenant.name }}</span>
                <span class="hp-impersonation__tenant-domain">{{ tenant.domain }}</span>
              </div>
              <hp-button variant="primary" size="sm">Impersonate</hp-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Sessions -->
      <div *ngIf="activeSessions.length > 0" class="hp-impersonation__active">
        <h2 class="hp-impersonation__section-title">
          Active Sessions
          <hp-badge variant="error" size="sm">{{ activeSessions.length }}</hp-badge>
        </h2>
        <div class="hp-impersonation__active-list">
          <div *ngFor="let session of activeSessions" class="hp-impersonation__session-card hp-impersonation__session-card--active">
            <div class="hp-impersonation__session-header">
              <div class="hp-impersonation__session-tenant">
                <span class="hp-impersonation__session-name">{{ session.tenantName }}</span>
                <code class="hp-impersonation__session-id">{{ session.tenantId }}</code>
              </div>
              <hp-badge variant="warning" size="sm">Active</hp-badge>
            </div>
            <div class="hp-impersonation__session-details">
              <span>Started: {{ session.startedAt }}</span>
              <span>Duration: {{ session.duration }}</span>
              <span>Actions: {{ session.actions }}</span>
            </div>
            <div class="hp-impersonation__session-actions">
              <hp-button variant="outline" size="sm" (click)="resumeSession(session)">Resume</hp-button>
              <hp-button variant="danger" size="sm" (click)="endSession(session)">End Session</hp-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Session History -->
      <div class="hp-impersonation__history">
        <div class="hp-impersonation__history-header">
          <h2 class="hp-impersonation__section-title">Session History</h2>
          <hp-button variant="ghost" size="sm" (click)="exportHistory()">Export</hp-button>
        </div>
        <div class="hp-impersonation__table-wrapper">
          <table class="hp-impersonation__table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Admin</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Actions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let session of sessionHistory">
                <td>
                  <div class="hp-impersonation__cell-tenant">
                    <span class="hp-impersonation__cell-name">{{ session.tenantName }}</span>
                    <code class="hp-impersonation__cell-id">{{ session.tenantId }}</code>
                  </div>
                </td>
                <td>{{ session.adminUser }}</td>
                <td>{{ session.startedAt }}</td>
                <td>{{ session.duration }}</td>
                <td>{{ session.actions }}</td>
                <td>
                  <hp-badge [variant]="session.status === 'active' ? 'warning' : 'secondary'" size="sm">
                    {{ session.status | titlecase }}
                  </hp-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-impersonation {
      &__header {
        margin-bottom: var(--hp-spacing-6);
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

      &__section-title {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__quick, &__active, &__history {
        margin-bottom: var(--hp-spacing-8);
      }

      &__search-card {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__search-input {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-750);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-md);

        svg {
          width: 20px;
          height: 20px;
          color: var(--hp-color-neutral-500);
        }

        input {
          flex: 1;
          background: none;
          border: none;
          font-size: var(--hp-font-size-base);
          color: var(--hp-color-neutral-0);

          &::placeholder {
            color: var(--hp-color-neutral-500);
          }

          &:focus {
            outline: none;
          }
        }
      }

      &__search-results {
        margin-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-700);
        padding-top: var(--hp-spacing-4);
      }

      &__search-result {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        border-radius: var(--hp-radius-md);
        cursor: pointer;
        transition: background-color 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-750);
        }
      }

      &__tenant-avatar {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-bold);
        color: white;
      }

      &__tenant-info {
        flex: 1;
      }

      &__tenant-name {
        display: block;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
      }

      &__tenant-domain {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__active-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--hp-spacing-4);
      }

      &__session-card {
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);

        &--active {
          border-color: var(--hp-color-warning);
        }
      }

      &__session-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-3);
      }

      &__session-name {
        display: block;
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
      }

      &__session-id {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__session-details {
        display: flex;
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__session-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);
      }

      &__table-wrapper {
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
        overflow: hidden;
      }

      &__table {
        width: 100%;
        border-collapse: collapse;

        th {
          padding: var(--hp-spacing-4);
          text-align: left;
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-400);
          text-transform: uppercase;
          background-color: var(--hp-color-neutral-750);
          border-bottom: 1px solid var(--hp-color-neutral-700);
        }

        td {
          padding: var(--hp-spacing-4);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-200);
          border-bottom: 1px solid var(--hp-color-neutral-700);
        }

        tbody tr:last-child td {
          border-bottom: none;
        }
      }

      &__cell-tenant {
        display: flex;
        flex-direction: column;
      }

      &__cell-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
      }

      &__cell-id {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImpersonationComponent {
  searchQuery = '';

  searchResults = [
    { id: '1', name: 'Acme Plumbing', domain: 'acme-plumbing.handypro.app', initials: 'AP' },
    { id: '2', name: 'Quick Fix Services', domain: 'quickfix.handypro.app', initials: 'QF' }
  ];

  activeSessions: ImpersonationSession[] = [
    { id: '1', tenantName: 'Elite Maintenance', tenantId: 'tn_abc123', adminUser: 'Admin', startedAt: '10 min ago', duration: '10 min', status: 'active', actions: 5 }
  ];

  sessionHistory: ImpersonationSession[] = [
    { id: '1', tenantName: 'Elite Maintenance', tenantId: 'tn_abc123', adminUser: 'Admin', startedAt: 'Today, 2:30 PM', duration: '15 min', status: 'active', actions: 5 },
    { id: '2', tenantName: 'Acme Plumbing', tenantId: 'tn_def456', adminUser: 'Admin', startedAt: 'Today, 11:00 AM', endedAt: 'Today, 11:25 AM', duration: '25 min', status: 'ended', actions: 12 },
    { id: '3', tenantName: 'Pro Fix Solutions', tenantId: 'tn_ghi789', adminUser: 'Admin', startedAt: 'Yesterday, 4:00 PM', endedAt: 'Yesterday, 4:30 PM', duration: '30 min', status: 'ended', actions: 8 },
    { id: '4', tenantName: 'Quick Fix Services', tenantId: 'tn_jkl012', adminUser: 'Admin', startedAt: 'Dec 15, 3:00 PM', endedAt: 'Dec 15, 3:15 PM', duration: '15 min', status: 'ended', actions: 3 }
  ];

  impersonate(tenant: any): void {
    console.log('Impersonate:', tenant.name);
  }

  resumeSession(session: ImpersonationSession): void {
    console.log('Resume session:', session.tenantName);
  }

  endSession(session: ImpersonationSession): void {
    console.log('End session:', session.tenantName);
  }

  exportHistory(): void {
    console.log('Export history');
  }
}
