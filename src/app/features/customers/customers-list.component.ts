import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'residential' | 'commercial';
  status: 'active' | 'inactive';
  totalJobs: number;
  totalSpent: number;
  lastService: string;
  createdAt: string;
  tags: string[];
}

@Component({
  selector: 'hp-customers-list',
  template: `
    <div class="hp-customers">
      <!-- Header -->
      <div class="hp-customers__header">
        <div class="hp-customers__header-left">
          <h1 class="hp-customers__title">Customers</h1>
          <p class="hp-customers__subtitle">Manage your customer database</p>
        </div>
        <div class="hp-customers__header-actions">
          <hp-button variant="outline" (click)="exportCustomers()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </hp-button>
          <hp-button variant="primary" (click)="addCustomer()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Customer
          </hp-button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="hp-customers__stats">
        <div class="hp-customers__stat">
          <span class="hp-customers__stat-value">{{ stats.total }}</span>
          <span class="hp-customers__stat-label">Total Customers</span>
        </div>
        <div class="hp-customers__stat">
          <span class="hp-customers__stat-value">{{ stats.activeThisMonth }}</span>
          <span class="hp-customers__stat-label">Active This Month</span>
        </div>
        <div class="hp-customers__stat">
          <span class="hp-customers__stat-value">{{ stats.newThisMonth }}</span>
          <span class="hp-customers__stat-label">New This Month</span>
        </div>
        <div class="hp-customers__stat">
          <span class="hp-customers__stat-value">\${{ stats.avgLifetimeValue | number }}</span>
          <span class="hp-customers__stat-label">Avg Lifetime Value</span>
        </div>
      </div>

      <!-- Filters -->
      <hp-card class="hp-customers__filters">
        <div class="hp-customers__filters-row">
          <div class="hp-customers__search">
            <hp-input
              placeholder="Search by name, email, phone..."
              [(ngModel)]="searchQuery"
              type="search"
            ></hp-input>
          </div>
          <div class="hp-customers__filter-group">
            <select [(ngModel)]="typeFilter" class="hp-customers__select">
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
            <select [(ngModel)]="statusFilter" class="hp-customers__select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </hp-card>

      <!-- Customers Grid -->
      <div class="hp-customers__grid">
        <hp-card
          *ngFor="let customer of filteredCustomers"
          class="hp-customers__card"
          (click)="viewCustomer(customer)"
        >
          <div class="hp-customers__card-header">
            <div class="hp-customers__card-avatar">
              {{ getInitials(customer.name) }}
            </div>
            <div class="hp-customers__card-info">
              <div class="hp-customers__card-name">{{ customer.name }}</div>
              <div class="hp-customers__card-badges">
                <hp-badge [variant]="customer.type === 'commercial' ? 'info' : 'neutral'" size="sm">
                  {{ customer.type | titlecase }}
                </hp-badge>
                <hp-badge [variant]="customer.status === 'active' ? 'success' : 'neutral'" size="sm">
                  {{ customer.status | titlecase }}
                </hp-badge>
              </div>
            </div>
            <button class="hp-customers__card-menu" (click)="openMenu($event, customer)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>

          <div class="hp-customers__card-contact">
            <a href="mailto:{{ customer.email }}" class="hp-customers__card-email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {{ customer.email }}
            </a>
            <a href="tel:{{ customer.phone }}" class="hp-customers__card-phone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {{ customer.phone }}
            </a>
            <div class="hp-customers__card-address">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ customer.address }}, {{ customer.city }}
            </div>
          </div>

          <div class="hp-customers__card-stats">
            <div class="hp-customers__card-stat">
              <span class="hp-customers__card-stat-value">{{ customer.totalJobs }}</span>
              <span class="hp-customers__card-stat-label">Jobs</span>
            </div>
            <div class="hp-customers__card-stat">
              <span class="hp-customers__card-stat-value">\${{ customer.totalSpent | number }}</span>
              <span class="hp-customers__card-stat-label">Total Spent</span>
            </div>
            <div class="hp-customers__card-stat">
              <span class="hp-customers__card-stat-value">{{ customer.lastService }}</span>
              <span class="hp-customers__card-stat-label">Last Service</span>
            </div>
          </div>

          <div *ngIf="customer.tags.length > 0" class="hp-customers__card-tags">
            <span *ngFor="let tag of customer.tags" class="hp-customers__card-tag">
              {{ tag }}
            </span>
          </div>
        </hp-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredCustomers.length === 0" class="hp-customers__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>No customers found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <!-- Pagination -->
      <div class="hp-customers__pagination">
        <span class="hp-customers__pagination-info">
          Showing {{ filteredCustomers.length }} of {{ customers.length }} customers
        </span>
      </div>
    </div>
  `,
  styles: [`
    .hp-customers {
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

      &__header-actions {
        display: flex;
        gap: var(--hp-spacing-3);
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
        background-color: var(--hp-surface-card);
        border-radius: var(--hp-radius-lg);
        padding: var(--hp-spacing-4);
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
        transition: background-color 200ms ease-in-out;
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
        margin-bottom: var(--hp-spacing-6);
      }

      &__filters-row {
        display: flex;
        gap: var(--hp-spacing-4);
        align-items: center;

        @media (max-width: 767px) {
          flex-direction: column;
          align-items: stretch;
        }
      }

      &__search {
        flex: 1;
        min-width: 250px;
      }

      &__filter-group {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__select {
        height: 44px;
        padding: 0 var(--hp-spacing-3);
        border: 1px solid var(--hp-input-border);
        border-radius: var(--hp-radius-md);
        background-color: var(--hp-input-bg);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
        min-width: 140px;
        cursor: pointer;
        transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out, color 200ms ease-in-out;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
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
        cursor: pointer;
        transition: box-shadow 150ms, transform 150ms;

        &:hover {
          box-shadow: var(--hp-shadow-md);
          transform: translateY(-2px);
        }
      }

      &__card-header {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-4);
      }

      &__card-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--hp-color-primary);
        color: white;
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      &__card-info {
        flex: 1;
        min-width: 0;
      }

      &__card-name {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin-bottom: var(--hp-spacing-1);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 200ms ease-in-out;
      }

      &__card-badges {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__card-menu {
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

      &__card-contact {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-4);
        padding-bottom: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-border-primary);
        transition: border-color 200ms ease-in-out;
      }

      &__card-email,
      &__card-phone,
      &__card-address {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        text-decoration: none;
        transition: color 200ms ease-in-out;

        svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: var(--hp-text-tertiary);
          transition: color 200ms ease-in-out;
        }
      }

      &__card-email:hover,
      &__card-phone:hover {
        color: var(--hp-color-primary);
      }

      &__card-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-3);
        text-align: center;
        margin-bottom: var(--hp-spacing-4);
      }

      &__card-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__card-stat-value {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        transition: color 200ms ease-in-out;
      }

      &__card-stat-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }

      &__card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--hp-spacing-1);
      }

      &__card-tag {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        background-color: var(--hp-bg-tertiary);
        padding: 2px var(--hp-spacing-2);
        border-radius: var(--hp-radius-sm);
        transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
      }

      &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--hp-spacing-12);
        text-align: center;

        svg {
          width: 64px;
          height: 64px;
          color: var(--hp-text-disabled);
          margin-bottom: var(--hp-spacing-4);
          transition: color 200ms ease-in-out;
        }

        h3 {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-text-primary);
          margin: 0 0 var(--hp-spacing-2);
          transition: color 200ms ease-in-out;
        }

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-tertiary);
          margin: 0;
          transition: color 200ms ease-in-out;
        }
      }

      &__pagination {
        display: flex;
        justify-content: center;
        padding-top: var(--hp-spacing-6);
      }

      &__pagination-info {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent {
  searchQuery = '';
  typeFilter = '';
  statusFilter = '';

  stats = {
    total: 156,
    activeThisMonth: 42,
    newThisMonth: 12,
    avgLifetimeValue: 2450
  };

  customers: Customer[] = [
    {
      id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567',
      address: '123 Oak Street, Apt 4B', city: 'Springfield', state: 'IL', zipCode: '62701',
      type: 'residential', status: 'active', totalJobs: 8, totalSpent: 4250,
      lastService: 'Dec 15', createdAt: '2023-03-15', tags: ['VIP', 'Repeat Customer']
    },
    {
      id: '2', name: 'Acme Corporation', email: 'facilities@acme.com', phone: '(555) 234-5678',
      address: '456 Business Park Dr', city: 'Springfield', state: 'IL', zipCode: '62702',
      type: 'commercial', status: 'active', totalJobs: 24, totalSpent: 18500,
      lastService: 'Dec 10', createdAt: '2022-08-20', tags: ['Contract', 'Priority']
    },
    {
      id: '3', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 345-6789',
      address: '789 Maple Avenue', city: 'Springfield', state: 'IL', zipCode: '62703',
      type: 'residential', status: 'active', totalJobs: 3, totalSpent: 875,
      lastService: 'Nov 28', createdAt: '2024-06-10', tags: []
    },
    {
      id: '4', name: 'Springfield Mall', email: 'maintenance@springfieldmall.com', phone: '(555) 456-7890',
      address: '1000 Mall Drive', city: 'Springfield', state: 'IL', zipCode: '62704',
      type: 'commercial', status: 'active', totalJobs: 45, totalSpent: 32000,
      lastService: 'Dec 12', createdAt: '2021-01-15', tags: ['Contract', 'VIP', '24/7']
    },
    {
      id: '5', name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 567-8901',
      address: '321 Pine Road', city: 'Springfield', state: 'IL', zipCode: '62705',
      type: 'residential', status: 'inactive', totalJobs: 2, totalSpent: 450,
      lastService: 'Aug 15', createdAt: '2023-07-22', tags: []
    },
    {
      id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '(555) 678-9012',
      address: '654 Cedar Lane', city: 'Springfield', state: 'IL', zipCode: '62706',
      type: 'residential', status: 'active', totalJobs: 5, totalSpent: 2100,
      lastService: 'Dec 8', createdAt: '2023-11-30', tags: ['Referral']
    },
    {
      id: '7', name: 'Downtown Office Complex', email: 'building@downtownoffice.com', phone: '(555) 789-0123',
      address: '100 Main Street', city: 'Springfield', state: 'IL', zipCode: '62701',
      type: 'commercial', status: 'active', totalJobs: 18, totalSpent: 12800,
      lastService: 'Dec 14', createdAt: '2022-04-10', tags: ['Contract']
    },
    {
      id: '8', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 890-1234',
      address: '987 Birch Drive', city: 'Springfield', state: 'IL', zipCode: '62707',
      type: 'residential', status: 'active', totalJobs: 1, totalSpent: 650,
      lastService: 'Dec 1', createdAt: '2024-11-25', tags: ['New']
    },
    {
      id: '9', name: 'Jennifer Wilson', email: 'jwilson@email.com', phone: '(555) 901-2345',
      address: '147 Walnut Court', city: 'Springfield', state: 'IL', zipCode: '62708',
      type: 'residential', status: 'active', totalJobs: 6, totalSpent: 3200,
      lastService: 'Nov 20', createdAt: '2023-02-14', tags: ['Repeat Customer']
    }
  ];

  get filteredCustomers(): Customer[] {
    return this.customers.filter(customer => {
      const matchesSearch = !this.searchQuery ||
        customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        customer.phone.includes(this.searchQuery);
      const matchesType = !this.typeFilter || customer.type === this.typeFilter;
      const matchesStatus = !this.statusFilter || customer.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  constructor(private router: Router) {}

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  addCustomer(): void {
    console.log('Add customer');
  }

  exportCustomers(): void {
    console.log('Export customers');
  }

  viewCustomer(customer: Customer): void {
    this.router.navigate(['/customers', customer.id]);
  }

  openMenu(event: Event, customer: Customer): void {
    event.stopPropagation();
    console.log('Open menu for customer', customer.id);
  }
}
