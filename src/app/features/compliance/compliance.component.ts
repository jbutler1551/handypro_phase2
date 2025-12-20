import { Component, ChangeDetectionStrategy } from '@angular/core';

interface ComplianceItem {
  id: string;
  franchiseName: string;
  franchiseLocation: string;
  type: 'insurance' | 'license' | 'certification' | 'background';
  name: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  expirationDate: Date | null;
  documentUrl?: string;
}

interface ComplianceStats {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
  pending: number;
}

@Component({
  selector: 'hp-compliance',
  template: `
    <div class="hp-compliance">
      <div class="hp-compliance__header">
        <div>
          <h1 class="hp-compliance__title">Compliance Management</h1>
          <p class="hp-compliance__subtitle">Track insurance, licenses, certifications, and background checks across all franchises.</p>
        </div>
        <div class="hp-compliance__header-actions">
          <hp-button variant="outline" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-compliance__btn-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Report
          </hp-button>
          <hp-button variant="primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-compliance__btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Document
          </hp-button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="hp-compliance__stats">
        <div class="hp-compliance__stat-card hp-compliance__stat-card--total">
          <span class="hp-compliance__stat-value">{{ stats.total }}</span>
          <span class="hp-compliance__stat-label">Total Items</span>
        </div>
        <div class="hp-compliance__stat-card hp-compliance__stat-card--valid">
          <span class="hp-compliance__stat-value">{{ stats.valid }}</span>
          <span class="hp-compliance__stat-label">Valid</span>
        </div>
        <div class="hp-compliance__stat-card hp-compliance__stat-card--expiring">
          <span class="hp-compliance__stat-value">{{ stats.expiring }}</span>
          <span class="hp-compliance__stat-label">Expiring Soon</span>
        </div>
        <div class="hp-compliance__stat-card hp-compliance__stat-card--expired">
          <span class="hp-compliance__stat-value">{{ stats.expired }}</span>
          <span class="hp-compliance__stat-label">Expired</span>
        </div>
        <div class="hp-compliance__stat-card hp-compliance__stat-card--pending">
          <span class="hp-compliance__stat-value">{{ stats.pending }}</span>
          <span class="hp-compliance__stat-label">Pending</span>
        </div>
      </div>

      <!-- Filters -->
      <hp-card class="hp-compliance__filters">
        <div class="hp-compliance__filter-row">
          <div class="hp-compliance__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" placeholder="Search by franchise or document..." [(ngModel)]="searchTerm" (input)="filterItems()" />
          </div>
          <div class="hp-compliance__filter-group">
            <select [(ngModel)]="typeFilter" (change)="filterItems()" class="hp-compliance__select">
              <option value="">All Types</option>
              <option value="insurance">Insurance</option>
              <option value="license">License</option>
              <option value="certification">Certification</option>
              <option value="background">Background Check</option>
            </select>
            <select [(ngModel)]="statusFilter" (change)="filterItems()" class="hp-compliance__select">
              <option value="">All Statuses</option>
              <option value="valid">Valid</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </hp-card>

      <!-- Items List -->
      <hp-card class="hp-compliance__list">
        <div class="hp-compliance__table">
          <div class="hp-compliance__table-header">
            <span>Franchise</span>
            <span>Document Type</span>
            <span>Name</span>
            <span>Expiration</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div *ngFor="let item of filteredItems" class="hp-compliance__table-row">
            <div class="hp-compliance__franchise">
              <span class="hp-compliance__franchise-name">{{ item.franchiseName }}</span>
              <span class="hp-compliance__franchise-location">{{ item.franchiseLocation }}</span>
            </div>
            <span class="hp-compliance__type">
              <hp-badge [variant]="getTypeBadgeVariant(item.type)" size="sm">{{ getTypeLabel(item.type) }}</hp-badge>
            </span>
            <span class="hp-compliance__name">{{ item.name }}</span>
            <span class="hp-compliance__expiration">{{ item.expirationDate ? (item.expirationDate | date:'MMM d, yyyy') : 'N/A' }}</span>
            <span class="hp-compliance__status">
              <hp-badge [variant]="getStatusBadgeVariant(item.status)" size="sm">{{ getStatusLabel(item.status) }}</hp-badge>
            </span>
            <div class="hp-compliance__actions">
              <button class="hp-compliance__action-btn" title="View Document">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="hp-compliance__action-btn" title="Download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button class="hp-compliance__action-btn" title="Request Update">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-compliance {
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

      &__header-actions {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__btn-icon {
        width: 16px;
        height: 16px;
        margin-right: var(--hp-spacing-2);
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 1024px) {
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      &__stat-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-5);
        background: var(--hp-glass-bg-prominent);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
        text-align: center;

        &--valid { border-left: 4px solid var(--hp-color-success); }
        &--expiring { border-left: 4px solid var(--hp-color-warning); }
        &--expired { border-left: 4px solid var(--hp-color-error); }
        &--pending { border-left: 4px solid var(--hp-color-primary); }
        &--total { border-left: 4px solid var(--hp-text-secondary); }
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

      &__filter-row {
        display: flex;
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__search {
        flex: 1;
        min-width: 200px;
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);

        svg {
          width: 18px;
          height: 18px;
          color: var(--hp-text-tertiary);
          flex-shrink: 0;
        }

        input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-primary);
          outline: none;

          &::placeholder {
            color: var(--hp-text-tertiary);
          }
        }
      }

      &__filter-group {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__select {
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
        cursor: pointer;
      }

      &__table {
        display: flex;
        flex-direction: column;
      }

      &__table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr 1fr 1fr 100px;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr 1fr 1fr 100px;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-glass-border);
        align-items: center;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: var(--hp-glass-bg-subtle);
        }
      }

      &__franchise {
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

      &__name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
      }

      &__expiration {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__action-btn {
        width: 28px;
        height: 28px;
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
          width: 14px;
          height: 14px;
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
export class ComplianceComponent {
  searchTerm = '';
  typeFilter = '';
  statusFilter = '';

  stats: ComplianceStats = {
    total: 45,
    valid: 38,
    expiring: 4,
    expired: 2,
    pending: 1
  };

  items: ComplianceItem[] = [
    { id: '1', franchiseName: 'HandyPro Denver', franchiseLocation: 'Denver, CO', type: 'insurance', name: 'General Liability Insurance', status: 'valid', expirationDate: new Date('2025-06-15') },
    { id: '2', franchiseName: 'HandyPro Denver', franchiseLocation: 'Denver, CO', type: 'license', name: 'Contractor License #12345', status: 'valid', expirationDate: new Date('2025-12-31') },
    { id: '3', franchiseName: 'HandyPro Austin', franchiseLocation: 'Austin, TX', type: 'insurance', name: 'General Liability Insurance', status: 'expiring', expirationDate: new Date('2025-01-15') },
    { id: '4', franchiseName: 'HandyPro Austin', franchiseLocation: 'Austin, TX', type: 'certification', name: 'EPA Lead-Safe Certification', status: 'valid', expirationDate: new Date('2026-03-20') },
    { id: '5', franchiseName: 'HandyPro Phoenix', franchiseLocation: 'Phoenix, AZ', type: 'insurance', name: 'Workers Compensation', status: 'expired', expirationDate: new Date('2024-11-30') },
    { id: '6', franchiseName: 'HandyPro Phoenix', franchiseLocation: 'Phoenix, AZ', type: 'background', name: 'Background Check - John Smith', status: 'pending', expirationDate: null },
    { id: '7', franchiseName: 'HandyPro Seattle', franchiseLocation: 'Seattle, WA', type: 'license', name: 'Electrical Contractor License', status: 'valid', expirationDate: new Date('2025-09-01') },
    { id: '8', franchiseName: 'HandyPro Seattle', franchiseLocation: 'Seattle, WA', type: 'insurance', name: 'Professional Liability Insurance', status: 'expiring', expirationDate: new Date('2025-01-20') }
  ];

  filteredItems = [...this.items];

  filterItems(): void {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.franchiseName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.typeFilter || item.type === this.typeFilter;
      const matchesStatus = !this.statusFilter || item.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  getTypeBadgeVariant(type: string): 'primary' | 'secondary' | 'info' | 'warning' {
    switch (type) {
      case 'insurance': return 'primary';
      case 'license': return 'info';
      case 'certification': return 'secondary';
      case 'background': return 'warning';
      default: return 'secondary';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'insurance': return 'Insurance';
      case 'license': return 'License';
      case 'certification': return 'Certification';
      case 'background': return 'Background';
      default: return type;
    }
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'valid': return 'success';
      case 'expiring': return 'warning';
      case 'expired': return 'error';
      case 'pending': return 'info';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expiring': return 'Expiring Soon';
      case 'expired': return 'Expired';
      case 'pending': return 'Pending';
      default: return status;
    }
  }
}
