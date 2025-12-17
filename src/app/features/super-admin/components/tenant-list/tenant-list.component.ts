import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'canceled';
  users: number;
  mrr: number;
  createdAt: string;
  logo?: string;
}

@Component({
  selector: 'hp-tenant-list',
  template: `
    <div class="hp-tenant-list">
      <!-- Header -->
      <div class="hp-tenant-list__header">
        <div class="hp-tenant-list__title-section">
          <h1 class="hp-tenant-list__title">Tenants</h1>
          <span class="hp-tenant-list__count">{{ filteredTenants.length }} total</span>
        </div>
        <div class="hp-tenant-list__actions">
          <hp-button variant="primary" (click)="createTenant()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-right: 8px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Tenant
          </hp-button>
        </div>
      </div>

      <!-- Stats -->
      <div class="hp-tenant-list__stats">
        <div class="hp-tenant-list__stat">
          <span class="hp-tenant-list__stat-value">{{ tenants.length }}</span>
          <span class="hp-tenant-list__stat-label">Total Tenants</span>
        </div>
        <div class="hp-tenant-list__stat">
          <span class="hp-tenant-list__stat-value">{{ activeTenants }}</span>
          <span class="hp-tenant-list__stat-label">Active</span>
        </div>
        <div class="hp-tenant-list__stat">
          <span class="hp-tenant-list__stat-value">{{ trialTenants }}</span>
          <span class="hp-tenant-list__stat-label">On Trial</span>
        </div>
        <div class="hp-tenant-list__stat">
          <span class="hp-tenant-list__stat-value">\${{ totalMRR.toLocaleString() }}</span>
          <span class="hp-tenant-list__stat-label">Total MRR</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="hp-tenant-list__filters">
        <div class="hp-tenant-list__search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search tenants..."
            [(ngModel)]="searchQuery"
          />
        </div>
        <div class="hp-tenant-list__filter-group">
          <select [(ngModel)]="statusFilter" class="hp-tenant-list__select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="canceled">Canceled</option>
          </select>
          <select [(ngModel)]="planFilter" class="hp-tenant-list__select">
            <option value="">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="hp-tenant-list__table-wrapper">
        <table class="hp-tenant-list__table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Users</th>
              <th>MRR</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tenant of filteredTenants" (click)="viewTenant(tenant)">
              <td>
                <div class="hp-tenant-list__tenant-cell">
                  <div class="hp-tenant-list__tenant-logo">
                    <img *ngIf="tenant.logo" [src]="tenant.logo" [alt]="tenant.name" />
                    <span *ngIf="!tenant.logo">{{ getInitials(tenant.name) }}</span>
                  </div>
                  <div class="hp-tenant-list__tenant-info">
                    <span class="hp-tenant-list__tenant-name">{{ tenant.name }}</span>
                    <span class="hp-tenant-list__tenant-domain">{{ tenant.domain }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="hp-tenant-list__plan" [class]="'hp-tenant-list__plan--' + tenant.plan">
                  {{ tenant.plan | titlecase }}
                </span>
              </td>
              <td>
                <hp-badge [variant]="getStatusVariant(tenant.status)" size="sm">
                  {{ tenant.status | titlecase }}
                </hp-badge>
              </td>
              <td>{{ tenant.users }}</td>
              <td>\${{ tenant.mrr }}</td>
              <td>{{ formatDate(tenant.createdAt) }}</td>
              <td>
                <button class="hp-tenant-list__action-btn" (click)="openMenu($event, tenant)">
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

      <!-- Empty State -->
      <div *ngIf="filteredTenants.length === 0" class="hp-tenant-list__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <h3>No tenants found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="filteredTenants.length > 0" class="hp-tenant-list__pagination">
        <span class="hp-tenant-list__pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredTenants.length) }} of {{ filteredTenants.length }}
        </span>
        <div class="hp-tenant-list__pagination-controls">
          <button [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-tenant-list {
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-6);
      }

      &__title-section {
        display: flex;
        align-items: baseline;
        gap: var(--hp-spacing-3);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        margin: 0;
      }

      &__count {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 767px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      &__stat {
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-800);
        border-radius: var(--hp-radius-lg);
        border: 1px solid var(--hp-color-neutral-700);
      }

      &__stat-value {
        display: block;
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        margin-bottom: var(--hp-spacing-1);
      }

      &__stat-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__filters {
        display: flex;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 767px) {
          flex-direction: column;
        }
      }

      &__search {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: 0 var(--hp-spacing-3);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-md);

        svg {
          width: 20px;
          height: 20px;
          color: var(--hp-color-neutral-500);
        }

        input {
          flex: 1;
          padding: var(--hp-spacing-3) 0;
          background: none;
          border: none;
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-0);

          &::placeholder {
            color: var(--hp-color-neutral-500);
          }

          &:focus {
            outline: none;
          }
        }
      }

      &__filter-group {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__select {
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
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

        option {
          background-color: var(--hp-color-neutral-800);
        }
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
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--hp-color-neutral-700);
        }

        td {
          padding: var(--hp-spacing-4);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-200);
          border-bottom: 1px solid var(--hp-color-neutral-700);
        }

        tbody tr {
          cursor: pointer;
          transition: background-color 150ms;

          &:hover {
            background-color: var(--hp-color-neutral-750);
          }

          &:last-child td {
            border-bottom: none;
          }
        }
      }

      &__tenant-cell {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__tenant-logo {
        width: 40px;
        height: 40px;
        border-radius: var(--hp-radius-md);
        background-color: var(--hp-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        span {
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-0);
        }
      }

      &__tenant-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__tenant-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
      }

      &__tenant-domain {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__plan {
        display: inline-block;
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        border-radius: var(--hp-radius-sm);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);

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

      &__action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-400);
        cursor: pointer;
        transition: background-color 150ms, color 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-700);
          color: var(--hp-color-neutral-0);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-12);
        text-align: center;

        svg {
          width: 64px;
          height: 64px;
          color: var(--hp-color-neutral-600);
          margin-bottom: var(--hp-spacing-4);
        }

        h3 {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-300);
          margin: 0 0 var(--hp-spacing-2);
        }

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
          margin: 0;
        }
      }

      &__pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--hp-spacing-4);
        padding-top: var(--hp-spacing-4);
      }

      &__pagination-info {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__pagination-controls {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);

        span {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-300);
        }

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          background-color: var(--hp-color-neutral-800);
          border: 1px solid var(--hp-color-neutral-700);
          border-radius: var(--hp-radius-md);
          color: var(--hp-color-neutral-300);
          cursor: pointer;
          transition: all 150ms;

          &:hover:not(:disabled) {
            background-color: var(--hp-color-neutral-700);
            color: var(--hp-color-neutral-0);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantListComponent {
  Math = Math;
  searchQuery = '';
  statusFilter = '';
  planFilter = '';
  currentPage = 1;
  pageSize = 10;

  tenants: Tenant[] = [
    { id: '1', name: 'Acme Plumbing', domain: 'acme-plumbing.handypro.app', plan: 'professional', status: 'active', users: 12, mrr: 149, createdAt: '2023-01-15' },
    { id: '2', name: 'Quick Fix Services', domain: 'quickfix.handypro.app', plan: 'enterprise', status: 'active', users: 45, mrr: 399, createdAt: '2023-02-20' },
    { id: '3', name: 'HomeHelp Pro', domain: 'homehelp.handypro.app', plan: 'starter', status: 'trial', users: 3, mrr: 0, createdAt: '2024-01-05' },
    { id: '4', name: 'Elite Maintenance', domain: 'elite.handypro.app', plan: 'professional', status: 'active', users: 8, mrr: 149, createdAt: '2023-05-10' },
    { id: '5', name: 'Metro Repairs', domain: 'metro.handypro.app', plan: 'professional', status: 'suspended', users: 6, mrr: 0, createdAt: '2023-03-22' },
    { id: '6', name: 'HandyDan LLC', domain: 'handydan.handypro.app', plan: 'starter', status: 'active', users: 2, mrr: 49, createdAt: '2023-08-15' },
    { id: '7', name: 'Pro Fix Solutions', domain: 'profix.handypro.app', plan: 'enterprise', status: 'active', users: 28, mrr: 399, createdAt: '2023-04-01' },
    { id: '8', name: 'City Services Inc', domain: 'cityservices.handypro.app', plan: 'professional', status: 'canceled', users: 0, mrr: 0, createdAt: '2022-11-20' },
    { id: '9', name: 'Reliable Repairs', domain: 'reliable.handypro.app', plan: 'starter', status: 'trial', users: 1, mrr: 0, createdAt: '2024-01-10' },
    { id: '10', name: 'AllStar Home Services', domain: 'allstar.handypro.app', plan: 'professional', status: 'active', users: 15, mrr: 149, createdAt: '2023-06-30' }
  ];

  constructor(private router: Router) {}

  get filteredTenants(): Tenant[] {
    return this.tenants.filter(tenant => {
      const matchesSearch = !this.searchQuery ||
        tenant.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.statusFilter || tenant.status === this.statusFilter;
      const matchesPlan = !this.planFilter || tenant.plan === this.planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }

  get activeTenants(): number {
    return this.tenants.filter(t => t.status === 'active').length;
  }

  get trialTenants(): number {
    return this.tenants.filter(t => t.status === 'trial').length;
  }

  get totalMRR(): number {
    return this.tenants.reduce((sum, t) => sum + t.mrr, 0);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTenants.length / this.pageSize);
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

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  viewTenant(tenant: Tenant): void {
    this.router.navigate(['/admin/tenants', tenant.id]);
  }

  createTenant(): void {
    console.log('Create tenant');
  }

  openMenu(event: Event, tenant: Tenant): void {
    event.stopPropagation();
    console.log('Open menu for', tenant.name);
  }
}
