import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface Franchise {
  id: string;
  name: string;
  location: string;
  owner: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  metrics: {
    monthlyRevenue: number;
    revenueGrowth: number;
    technicians: number;
    jobsCompleted: number;
    avgRating: number;
    reviewCount: number;
  };
  compliance: {
    status: 'compliant' | 'at_risk' | 'non_compliant';
    score: number;
    expiringItems: number;
  };
  territory: {
    region: string;
    zipCodes: string[];
    population: number;
  };
  joinedDate: string;
  lastActivity: string;
}

@Component({
  selector: 'hp-franchises',
  template: `
    <div class="hp-franchises">
      <!-- Header Section -->
      <div class="hp-franchises__header">
        <div class="hp-franchises__header-content">
          <h1 class="hp-franchises__title">Franchise Directory</h1>
          <p class="hp-franchises__subtitle">Manage and monitor all franchise locations across your network</p>
        </div>
        <div class="hp-franchises__header-actions">
          <button class="hp-franchises__export-btn" (click)="exportData()">
            <span [innerHTML]="getSafeIcon('download')"></span>
            Export
          </button>
          <button class="hp-franchises__add-btn" (click)="openAddFranchise()">
            <span [innerHTML]="getSafeIcon('plus')"></span>
            Add Franchise
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="hp-franchises__stats">
        <div class="hp-franchises__stat-card">
          <div class="hp-franchises__stat-icon hp-franchises__stat-icon--primary">
            <span [innerHTML]="getSafeIcon('building')"></span>
          </div>
          <div class="hp-franchises__stat-content">
            <div class="hp-franchises__stat-value">{{ franchises.length }}</div>
            <div class="hp-franchises__stat-label">Total Franchises</div>
          </div>
        </div>
        <div class="hp-franchises__stat-card">
          <div class="hp-franchises__stat-icon hp-franchises__stat-icon--success">
            <span [innerHTML]="getSafeIcon('check-circle')"></span>
          </div>
          <div class="hp-franchises__stat-content">
            <div class="hp-franchises__stat-value">{{ getActiveFranchises() }}</div>
            <div class="hp-franchises__stat-label">Active</div>
          </div>
        </div>
        <div class="hp-franchises__stat-card">
          <div class="hp-franchises__stat-icon hp-franchises__stat-icon--warning">
            <span [innerHTML]="getSafeIcon('alert-triangle')"></span>
          </div>
          <div class="hp-franchises__stat-content">
            <div class="hp-franchises__stat-value">{{ getAtRiskCompliance() }}</div>
            <div class="hp-franchises__stat-label">Compliance At Risk</div>
          </div>
        </div>
        <div class="hp-franchises__stat-card">
          <div class="hp-franchises__stat-icon hp-franchises__stat-icon--info">
            <span [innerHTML]="getSafeIcon('dollar-sign')"></span>
          </div>
          <div class="hp-franchises__stat-content">
            <div class="hp-franchises__stat-value">{{ getTotalRevenue() | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="hp-franchises__stat-label">Network Revenue (MTD)</div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <hp-card class="hp-franchises__filters-card">
        <div class="hp-franchises__filters">
          <div class="hp-franchises__search">
            <span class="hp-franchises__search-icon" [innerHTML]="getSafeIcon('search')"></span>
            <input
              type="text"
              placeholder="Search franchises by name, location, or owner..."
              [(ngModel)]="searchQuery"
              class="hp-franchises__search-input"
            />
          </div>
          <div class="hp-franchises__filter-group">
            <select [(ngModel)]="statusFilter" class="hp-franchises__filter-select">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select [(ngModel)]="complianceFilter" class="hp-franchises__filter-select">
              <option value="">All Compliance</option>
              <option value="compliant">Compliant</option>
              <option value="at_risk">At Risk</option>
              <option value="non_compliant">Non-Compliant</option>
            </select>
            <select [(ngModel)]="regionFilter" class="hp-franchises__filter-select">
              <option value="">All Regions</option>
              <option value="northeast">Northeast</option>
              <option value="southeast">Southeast</option>
              <option value="midwest">Midwest</option>
              <option value="southwest">Southwest</option>
              <option value="west">West</option>
            </select>
          </div>
          <div class="hp-franchises__view-toggle">
            <button
              [class.active]="viewMode === 'grid'"
              (click)="viewMode = 'grid'"
              title="Grid View"
            >
              <span [innerHTML]="getSafeIcon('grid')"></span>
            </button>
            <button
              [class.active]="viewMode === 'list'"
              (click)="viewMode = 'list'"
              title="List View"
            >
              <span [innerHTML]="getSafeIcon('list')"></span>
            </button>
          </div>
        </div>
      </hp-card>

      <!-- Grid View -->
      <div *ngIf="viewMode === 'grid'" class="hp-franchises__grid">
        <div
          *ngFor="let franchise of filteredFranchises"
          class="hp-franchises__card"
          (click)="viewFranchise(franchise)"
        >
          <div class="hp-franchises__card-header">
            <div class="hp-franchises__card-title-row">
              <h3 class="hp-franchises__card-name">{{ franchise.name }}</h3>
              <span
                class="hp-franchises__card-status"
                [class]="'hp-franchises__card-status--' + franchise.status"
              >
                {{ franchise.status | titlecase }}
              </span>
            </div>
            <div class="hp-franchises__card-location">
              <span [innerHTML]="getSafeIcon('map-pin')"></span>
              {{ franchise.location }}
            </div>
          </div>

          <div class="hp-franchises__card-owner">
            <div class="hp-franchises__card-avatar">
              <img *ngIf="franchise.owner.avatar" [src]="franchise.owner.avatar" [alt]="franchise.owner.name" />
              <span *ngIf="!franchise.owner.avatar">{{ getInitials(franchise.owner.name) }}</span>
            </div>
            <div class="hp-franchises__card-owner-info">
              <div class="hp-franchises__card-owner-name">{{ franchise.owner.name }}</div>
              <div class="hp-franchises__card-owner-role">Franchise Owner</div>
            </div>
          </div>

          <div class="hp-franchises__card-metrics">
            <div class="hp-franchises__card-metric">
              <div class="hp-franchises__card-metric-value">
                {{ franchise.metrics.monthlyRevenue | currency:'USD':'symbol':'1.0-0' }}
              </div>
              <div class="hp-franchises__card-metric-label">Monthly Revenue</div>
              <div
                class="hp-franchises__card-metric-change"
                [class.positive]="franchise.metrics.revenueGrowth >= 0"
                [class.negative]="franchise.metrics.revenueGrowth < 0"
              >
                <span [innerHTML]="getSafeIcon(franchise.metrics.revenueGrowth >= 0 ? 'trending-up' : 'trending-down')"></span>
                {{ franchise.metrics.revenueGrowth >= 0 ? '+' : '' }}{{ franchise.metrics.revenueGrowth }}%
              </div>
            </div>
            <div class="hp-franchises__card-metric">
              <div class="hp-franchises__card-metric-value">{{ franchise.metrics.technicians }}</div>
              <div class="hp-franchises__card-metric-label">Technicians</div>
            </div>
            <div class="hp-franchises__card-metric">
              <div class="hp-franchises__card-metric-value">{{ franchise.metrics.jobsCompleted }}</div>
              <div class="hp-franchises__card-metric-label">Jobs (MTD)</div>
            </div>
          </div>

          <div class="hp-franchises__card-compliance">
            <div class="hp-franchises__card-compliance-header">
              <span>Compliance Score</span>
              <span
                class="hp-franchises__card-compliance-badge"
                [class]="'hp-franchises__card-compliance-badge--' + franchise.compliance.status"
              >
                {{ franchise.compliance.status.replace('_', ' ') | titlecase }}
              </span>
            </div>
            <div class="hp-franchises__card-compliance-bar">
              <div
                class="hp-franchises__card-compliance-fill"
                [style.width.%]="franchise.compliance.score"
                [class]="'hp-franchises__card-compliance-fill--' + franchise.compliance.status"
              ></div>
            </div>
            <div class="hp-franchises__card-compliance-score">{{ franchise.compliance.score }}%</div>
          </div>

          <div class="hp-franchises__card-footer">
            <div class="hp-franchises__card-rating">
              <span [innerHTML]="getSafeIcon('star')"></span>
              {{ franchise.metrics.avgRating.toFixed(1) }}
              <span class="hp-franchises__card-rating-count">({{ franchise.metrics.reviewCount }})</span>
            </div>
            <div class="hp-franchises__card-actions">
              <button
                class="hp-franchises__card-action"
                (click)="viewFranchise(franchise); $event.stopPropagation()"
                title="View Details"
              >
                <span [innerHTML]="getSafeIcon('eye')"></span>
              </button>
              <button
                class="hp-franchises__card-action"
                (click)="editFranchise(franchise); $event.stopPropagation()"
                title="Edit"
              >
                <span [innerHTML]="getSafeIcon('edit')"></span>
              </button>
              <button
                class="hp-franchises__card-action"
                (click)="openFranchiseMenu(franchise, $event)"
                title="More Actions"
              >
                <span [innerHTML]="getSafeIcon('more-vertical')"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <hp-card *ngIf="viewMode === 'list'" class="hp-franchises__list-card">
        <div class="hp-franchises__table-wrapper">
          <table class="hp-franchises__table">
            <thead>
              <tr>
                <th class="hp-franchises__th" (click)="sortBy('name')">
                  Franchise
                  <span *ngIf="sortField === 'name'" [innerHTML]="getSafeIcon(sortDirection === 'asc' ? 'chevron-up' : 'chevron-down')"></span>
                </th>
                <th class="hp-franchises__th" (click)="sortBy('location')">Location</th>
                <th class="hp-franchises__th" (click)="sortBy('owner')">Owner</th>
                <th class="hp-franchises__th" (click)="sortBy('revenue')">Revenue (MTD)</th>
                <th class="hp-franchises__th" (click)="sortBy('technicians')">Technicians</th>
                <th class="hp-franchises__th" (click)="sortBy('compliance')">Compliance</th>
                <th class="hp-franchises__th" (click)="sortBy('status')">Status</th>
                <th class="hp-franchises__th">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let franchise of filteredFranchises" (click)="viewFranchise(franchise)">
                <td class="hp-franchises__td">
                  <div class="hp-franchises__table-name">
                    <span class="hp-franchises__table-icon" [innerHTML]="getSafeIcon('building')"></span>
                    {{ franchise.name }}
                  </div>
                </td>
                <td class="hp-franchises__td">
                  <div class="hp-franchises__table-location">
                    <span [innerHTML]="getSafeIcon('map-pin')"></span>
                    {{ franchise.location }}
                  </div>
                </td>
                <td class="hp-franchises__td">
                  <div class="hp-franchises__table-owner">
                    <div class="hp-franchises__table-avatar">
                      {{ getInitials(franchise.owner.name) }}
                    </div>
                    <div>
                      <div class="hp-franchises__table-owner-name">{{ franchise.owner.name }}</div>
                      <div class="hp-franchises__table-owner-email">{{ franchise.owner.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="hp-franchises__td">
                  <div class="hp-franchises__table-revenue">
                    {{ franchise.metrics.monthlyRevenue | currency:'USD':'symbol':'1.0-0' }}
                    <span
                      class="hp-franchises__table-growth"
                      [class.positive]="franchise.metrics.revenueGrowth >= 0"
                      [class.negative]="franchise.metrics.revenueGrowth < 0"
                    >
                      {{ franchise.metrics.revenueGrowth >= 0 ? '+' : '' }}{{ franchise.metrics.revenueGrowth }}%
                    </span>
                  </div>
                </td>
                <td class="hp-franchises__td">{{ franchise.metrics.technicians }}</td>
                <td class="hp-franchises__td">
                  <div class="hp-franchises__table-compliance">
                    <div
                      class="hp-franchises__table-compliance-bar"
                      [class]="'hp-franchises__table-compliance-bar--' + franchise.compliance.status"
                    >
                      <div [style.width.%]="franchise.compliance.score"></div>
                    </div>
                    <span>{{ franchise.compliance.score }}%</span>
                  </div>
                </td>
                <td class="hp-franchises__td">
                  <span
                    class="hp-franchises__table-status"
                    [class]="'hp-franchises__table-status--' + franchise.status"
                  >
                    {{ franchise.status | titlecase }}
                  </span>
                </td>
                <td class="hp-franchises__td">
                  <div class="hp-franchises__table-actions">
                    <button (click)="viewFranchise(franchise); $event.stopPropagation()" title="View">
                      <span [innerHTML]="getSafeIcon('eye')"></span>
                    </button>
                    <button (click)="editFranchise(franchise); $event.stopPropagation()" title="Edit">
                      <span [innerHTML]="getSafeIcon('edit')"></span>
                    </button>
                    <button (click)="openFranchiseMenu(franchise, $event)" title="More">
                      <span [innerHTML]="getSafeIcon('more-vertical')"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="filteredFranchises.length === 0" class="hp-franchises__empty">
          <span [innerHTML]="getSafeIcon('building')"></span>
          <h3>No franchises found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </hp-card>

      <!-- Pagination -->
      <div class="hp-franchises__pagination">
        <div class="hp-franchises__pagination-info">
          Showing {{ filteredFranchises.length }} of {{ franchises.length }} franchises
        </div>
        <div class="hp-franchises__pagination-controls">
          <button class="hp-franchises__pagination-btn" [disabled]="currentPage === 1">
            <span [innerHTML]="getSafeIcon('chevron-left')"></span>
          </button>
          <span class="hp-franchises__pagination-page">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="hp-franchises__pagination-btn" [disabled]="currentPage === totalPages">
            <span [innerHTML]="getSafeIcon('chevron-right')"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-franchises {
      padding: var(--hp-spacing-6);
      max-width: 1400px;
      margin: 0 auto;

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
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__subtitle {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        margin: 0;
      }

      &__header-actions {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__export-btn, &__add-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        cursor: pointer;
        transition: all 150ms;

        span {
          display: flex;
          width: 18px;
          height: 18px;
        }

        :host ::ng-deep svg {
          width: 100%;
          height: 100%;
        }
      }

      &__export-btn {
        background: var(--hp-color-neutral-0);
        border: 1px solid var(--hp-color-neutral-300);
        color: var(--hp-color-neutral-700);

        &:hover {
          background: var(--hp-color-neutral-50);
          border-color: var(--hp-color-neutral-400);
        }
      }

      &__add-btn {
        background: var(--hp-color-primary);
        border: none;
        color: var(--hp-color-neutral-0);

        &:hover {
          background: var(--hp-color-primary-dark);
        }
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__stat-card {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5);
        background: var(--hp-color-neutral-0);
        border-radius: var(--hp-radius-lg);
        border: 1px solid var(--hp-color-neutral-200);
        box-shadow: var(--hp-shadow-sm);
      }

      &__stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--hp-radius-lg);

        :host ::ng-deep svg {
          width: 24px;
          height: 24px;
        }

        &--primary {
          background: rgba(27, 58, 100, 0.1);
          color: var(--hp-color-primary);
        }

        &--success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        &--warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        &--info {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
      }

      &__stat-value {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
      }

      &__stat-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
      }

      &__filters-card {
        margin-bottom: var(--hp-spacing-6);
      }

      &__filters {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__search {
        flex: 1;
        min-width: 280px;
        position: relative;

        &-icon {
          position: absolute;
          left: var(--hp-spacing-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--hp-color-neutral-400);
          width: 18px;
          height: 18px;
          display: flex;

          :host ::ng-deep svg {
            width: 100%;
            height: 100%;
          }
        }

        &-input {
          width: 100%;
          height: 44px;
          padding: 0 var(--hp-spacing-3) 0 var(--hp-spacing-10);
          border: 1px solid var(--hp-color-neutral-300);
          border-radius: var(--hp-radius-md);
          font-size: var(--hp-font-size-sm);
          background: var(--hp-color-neutral-0);

          &:focus {
            outline: none;
            border-color: var(--hp-color-primary);
            box-shadow: 0 0 0 3px rgba(27, 58, 100, 0.1);
          }

          &::placeholder {
            color: var(--hp-color-neutral-400);
          }
        }
      }

      &__filter-group {
        display: flex;
        gap: var(--hp-spacing-3);
        flex-wrap: wrap;
      }

      &__filter-select {
        height: 44px;
        padding: 0 var(--hp-spacing-8) 0 var(--hp-spacing-3);
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        background: var(--hp-color-neutral-0);
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
        }
      }

      &__view-toggle {
        display: flex;
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        overflow: hidden;

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 42px;
          background: var(--hp-color-neutral-0);
          border: none;
          cursor: pointer;
          color: var(--hp-color-neutral-500);
          transition: all 150ms;

          &:not(:last-child) {
            border-right: 1px solid var(--hp-color-neutral-300);
          }

          &:hover {
            background: var(--hp-color-neutral-50);
          }

          &.active {
            background: var(--hp-color-primary);
            color: var(--hp-color-neutral-0);
          }

          :host ::ng-deep svg {
            width: 18px;
            height: 18px;
          }
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-5);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 1200px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__card {
        background: var(--hp-color-neutral-0);
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-lg);
        padding: var(--hp-spacing-5);
        cursor: pointer;
        transition: all 200ms;

        &:hover {
          border-color: var(--hp-color-primary);
          box-shadow: var(--hp-shadow-md);
          transform: translateY(-2px);
        }

        &-header {
          margin-bottom: var(--hp-spacing-4);
        }

        &-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--hp-spacing-2);
        }

        &-name {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
          margin: 0;
        }

        &-status {
          display: inline-block;
          padding: var(--hp-spacing-1) var(--hp-spacing-2);
          border-radius: var(--hp-radius-full);
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-medium);

          &--active {
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
          }

          &--pending {
            background: rgba(245, 158, 11, 0.1);
            color: #d97706;
          }

          &--suspended {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
          }

          &--inactive {
            background: var(--hp-color-neutral-100);
            color: var(--hp-color-neutral-600);
          }
        }

        &-location {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-1);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);

          :host ::ng-deep svg {
            width: 14px;
            height: 14px;
          }
        }

        &-owner {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-3);
          padding: var(--hp-spacing-3);
          background: var(--hp-color-neutral-50);
          border-radius: var(--hp-radius-md);
          margin-bottom: var(--hp-spacing-4);
        }

        &-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--hp-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--hp-color-neutral-0);
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-semibold);
          flex-shrink: 0;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        &-owner-name {
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-900);
        }

        &-owner-role {
          font-size: var(--hp-font-size-xs);
          color: var(--hp-color-neutral-500);
        }

        &-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--hp-spacing-3);
          margin-bottom: var(--hp-spacing-4);
          padding-bottom: var(--hp-spacing-4);
          border-bottom: 1px solid var(--hp-color-neutral-100);
        }

        &-metric {
          text-align: center;

          &-value {
            font-size: var(--hp-font-size-lg);
            font-weight: var(--hp-font-weight-bold);
            color: var(--hp-color-neutral-900);
          }

          &-label {
            font-size: var(--hp-font-size-xs);
            color: var(--hp-color-neutral-500);
            margin-top: var(--hp-spacing-1);
          }

          &-change {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: var(--hp-font-size-xs);
            margin-top: var(--hp-spacing-1);

            &.positive {
              color: #10b981;
            }

            &.negative {
              color: #ef4444;
            }

            :host ::ng-deep svg {
              width: 12px;
              height: 12px;
            }
          }
        }

        &-compliance {
          margin-bottom: var(--hp-spacing-4);

          &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--hp-spacing-2);
            font-size: var(--hp-font-size-xs);
            color: var(--hp-color-neutral-600);
          }

          &-badge {
            padding: 2px 8px;
            border-radius: var(--hp-radius-full);
            font-size: 10px;
            font-weight: var(--hp-font-weight-medium);
            text-transform: uppercase;

            &--compliant {
              background: rgba(16, 185, 129, 0.1);
              color: #059669;
            }

            &--at_risk {
              background: rgba(245, 158, 11, 0.1);
              color: #d97706;
            }

            &--non_compliant {
              background: rgba(239, 68, 68, 0.1);
              color: #dc2626;
            }
          }

          &-bar {
            height: 6px;
            background: var(--hp-color-neutral-200);
            border-radius: var(--hp-radius-full);
            overflow: hidden;
            margin-bottom: var(--hp-spacing-1);
          }

          &-fill {
            height: 100%;
            border-radius: var(--hp-radius-full);
            transition: width 300ms;

            &--compliant {
              background: #10b981;
            }

            &--at_risk {
              background: #f59e0b;
            }

            &--non_compliant {
              background: #ef4444;
            }
          }

          &-score {
            font-size: var(--hp-font-size-xs);
            color: var(--hp-color-neutral-500);
            text-align: right;
          }
        }

        &-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        &-rating {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-1);
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-900);

          :host ::ng-deep svg {
            width: 16px;
            height: 16px;
            color: #fbbf24;
            fill: #fbbf24;
          }

          &-count {
            color: var(--hp-color-neutral-500);
            font-weight: var(--hp-font-weight-normal);
          }
        }

        &-actions {
          display: flex;
          gap: var(--hp-spacing-1);
        }

        &-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: var(--hp-radius-md);
          color: var(--hp-color-neutral-400);
          cursor: pointer;
          transition: all 150ms;

          &:hover {
            background: var(--hp-color-neutral-100);
            color: var(--hp-color-neutral-700);
          }

          :host ::ng-deep svg {
            width: 16px;
            height: 16px;
          }
        }
      }

      &__list-card {
        margin-bottom: var(--hp-spacing-6);
      }

      &__table-wrapper {
        overflow-x: auto;
      }

      &__table {
        width: 100%;
        border-collapse: collapse;
      }

      &__th {
        text-align: left;
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--hp-color-neutral-200);
        cursor: pointer;
        white-space: nowrap;

        &:hover {
          color: var(--hp-color-neutral-700);
        }

        :host ::ng-deep svg {
          width: 12px;
          height: 12px;
          vertical-align: middle;
          margin-left: var(--hp-spacing-1);
        }
      }

      &__td {
        padding: var(--hp-spacing-4);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
        border-bottom: 1px solid var(--hp-color-neutral-100);
        vertical-align: middle;
      }

      &__table tbody tr {
        cursor: pointer;
        transition: background-color 150ms;

        &:hover {
          background: var(--hp-color-neutral-50);
        }
      }

      &__table-name {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__table-icon {
        display: flex;
        color: var(--hp-color-primary);

        :host ::ng-deep svg {
          width: 18px;
          height: 18px;
        }
      }

      &__table-location {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        color: var(--hp-color-neutral-600);

        :host ::ng-deep svg {
          width: 14px;
          height: 14px;
          color: var(--hp-color-neutral-400);
        }
      }

      &__table-owner {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__table-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--hp-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--hp-color-neutral-0);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        flex-shrink: 0;
      }

      &__table-owner-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__table-owner-email {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__table-revenue {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__table-growth {
        display: inline-block;
        font-size: var(--hp-font-size-xs);
        margin-left: var(--hp-spacing-2);

        &.positive {
          color: #10b981;
        }

        &.negative {
          color: #ef4444;
        }
      }

      &__table-compliance {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);

        &-bar {
          width: 60px;
          height: 6px;
          background: var(--hp-color-neutral-200);
          border-radius: var(--hp-radius-full);
          overflow: hidden;

          div {
            height: 100%;
            border-radius: var(--hp-radius-full);
          }

          &--compliant div {
            background: #10b981;
          }

          &--at_risk div {
            background: #f59e0b;
          }

          &--non_compliant div {
            background: #ef4444;
          }
        }
      }

      &__table-status {
        display: inline-block;
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);

        &--active {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        &--pending {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        &--suspended {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        &--inactive {
          background: var(--hp-color-neutral-100);
          color: var(--hp-color-neutral-600);
        }
      }

      &__table-actions {
        display: flex;
        gap: var(--hp-spacing-1);

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: var(--hp-radius-md);
          color: var(--hp-color-neutral-400);
          cursor: pointer;
          transition: all 150ms;

          &:hover {
            background: var(--hp-color-neutral-100);
            color: var(--hp-color-neutral-700);
          }

          :host ::ng-deep svg {
            width: 16px;
            height: 16px;
          }
        }
      }

      &__empty {
        text-align: center;
        padding: var(--hp-spacing-12);
        color: var(--hp-color-neutral-400);

        :host ::ng-deep svg {
          width: 64px;
          height: 64px;
          margin-bottom: var(--hp-spacing-4);
        }

        h3 {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-700);
          margin: 0 0 var(--hp-spacing-2);
        }

        p {
          font-size: var(--hp-font-size-sm);
          margin: 0;
        }
      }

      &__pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__pagination-info {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
      }

      &__pagination-controls {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__pagination-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid var(--hp-color-neutral-300);
        background: var(--hp-color-neutral-0);
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-600);
        cursor: pointer;
        transition: all 150ms;

        &:hover:not(:disabled) {
          background: var(--hp-color-neutral-50);
          border-color: var(--hp-color-neutral-400);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        :host ::ng-deep svg {
          width: 18px;
          height: 18px;
        }
      }

      &__pagination-page {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FranchisesComponent {
  searchQuery = '';
  statusFilter = '';
  complianceFilter = '';
  regionFilter = '';
  viewMode: 'grid' | 'list' = 'grid';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 12;

  franchises: Franchise[] = [
    {
      id: '1',
      name: 'HandyPro Atlanta',
      location: 'Atlanta, GA',
      owner: { name: 'John Mitchell', email: 'john@handypro-atlanta.com', phone: '(404) 555-0101' },
      status: 'active',
      metrics: { monthlyRevenue: 125000, revenueGrowth: 12.5, technicians: 18, jobsCompleted: 342, avgRating: 4.8, reviewCount: 156 },
      compliance: { status: 'compliant', score: 98, expiringItems: 0 },
      territory: { region: 'southeast', zipCodes: ['30301', '30302', '30303'], population: 498044 },
      joinedDate: '2021-03-15',
      lastActivity: '2024-01-19T10:30:00'
    },
    {
      id: '2',
      name: 'HandyPro Denver',
      location: 'Denver, CO',
      owner: { name: 'Sarah Johnson', email: 'sarah@handypro-denver.com', phone: '(303) 555-0202' },
      status: 'active',
      metrics: { monthlyRevenue: 98000, revenueGrowth: 8.2, technicians: 14, jobsCompleted: 278, avgRating: 4.7, reviewCount: 123 },
      compliance: { status: 'at_risk', score: 75, expiringItems: 3 },
      territory: { region: 'west', zipCodes: ['80201', '80202', '80203'], population: 715522 },
      joinedDate: '2021-06-22',
      lastActivity: '2024-01-19T09:15:00'
    },
    {
      id: '3',
      name: 'HandyPro Seattle',
      location: 'Seattle, WA',
      owner: { name: 'Mike Chen', email: 'mike@handypro-seattle.com', phone: '(206) 555-0303' },
      status: 'active',
      metrics: { monthlyRevenue: 145000, revenueGrowth: 15.8, technicians: 22, jobsCompleted: 412, avgRating: 4.9, reviewCount: 198 },
      compliance: { status: 'compliant', score: 100, expiringItems: 0 },
      territory: { region: 'west', zipCodes: ['98101', '98102', '98103'], population: 737015 },
      joinedDate: '2020-11-08',
      lastActivity: '2024-01-19T11:45:00'
    },
    {
      id: '4',
      name: 'HandyPro Phoenix',
      location: 'Phoenix, AZ',
      owner: { name: 'Emily Rodriguez', email: 'emily@handypro-phoenix.com', phone: '(602) 555-0404' },
      status: 'active',
      metrics: { monthlyRevenue: 87000, revenueGrowth: -2.3, technicians: 12, jobsCompleted: 198, avgRating: 4.5, reviewCount: 89 },
      compliance: { status: 'compliant', score: 92, expiringItems: 1 },
      territory: { region: 'southwest', zipCodes: ['85001', '85002', '85003'], population: 1608139 },
      joinedDate: '2022-02-14',
      lastActivity: '2024-01-18T16:20:00'
    },
    {
      id: '5',
      name: 'HandyPro Miami',
      location: 'Miami, FL',
      owner: { name: 'Alex Martinez', email: 'alex@handypro-miami.com', phone: '(305) 555-0505' },
      status: 'pending',
      metrics: { monthlyRevenue: 0, revenueGrowth: 0, technicians: 0, jobsCompleted: 0, avgRating: 0, reviewCount: 0 },
      compliance: { status: 'non_compliant', score: 45, expiringItems: 8 },
      territory: { region: 'southeast', zipCodes: ['33101', '33102', '33103'], population: 442241 },
      joinedDate: '2024-01-08',
      lastActivity: '2024-01-17T14:00:00'
    },
    {
      id: '6',
      name: 'HandyPro Chicago',
      location: 'Chicago, IL',
      owner: { name: 'David Kim', email: 'david@handypro-chicago.com', phone: '(312) 555-0606' },
      status: 'active',
      metrics: { monthlyRevenue: 156000, revenueGrowth: 18.4, technicians: 25, jobsCompleted: 456, avgRating: 4.8, reviewCount: 234 },
      compliance: { status: 'compliant', score: 96, expiringItems: 0 },
      territory: { region: 'midwest', zipCodes: ['60601', '60602', '60603'], population: 2693976 },
      joinedDate: '2020-08-20',
      lastActivity: '2024-01-19T08:30:00'
    },
    {
      id: '7',
      name: 'HandyPro Boston',
      location: 'Boston, MA',
      owner: { name: 'Jennifer O\'Brien', email: 'jennifer@handypro-boston.com', phone: '(617) 555-0707' },
      status: 'active',
      metrics: { monthlyRevenue: 112000, revenueGrowth: 9.7, technicians: 16, jobsCompleted: 289, avgRating: 4.6, reviewCount: 145 },
      compliance: { status: 'at_risk', score: 78, expiringItems: 2 },
      territory: { region: 'northeast', zipCodes: ['02101', '02102', '02103'], population: 675647 },
      joinedDate: '2021-09-05',
      lastActivity: '2024-01-19T10:00:00'
    },
    {
      id: '8',
      name: 'HandyPro Dallas',
      location: 'Dallas, TX',
      owner: { name: 'Robert Taylor', email: 'robert@handypro-dallas.com', phone: '(214) 555-0808' },
      status: 'suspended',
      metrics: { monthlyRevenue: 45000, revenueGrowth: -15.2, technicians: 8, jobsCompleted: 95, avgRating: 3.9, reviewCount: 67 },
      compliance: { status: 'non_compliant', score: 52, expiringItems: 5 },
      territory: { region: 'southwest', zipCodes: ['75201', '75202', '75203'], population: 1304379 },
      joinedDate: '2022-05-18',
      lastActivity: '2024-01-10T12:00:00'
    },
    {
      id: '9',
      name: 'HandyPro Portland',
      location: 'Portland, OR',
      owner: { name: 'Lisa Anderson', email: 'lisa@handypro-portland.com', phone: '(503) 555-0909' },
      status: 'active',
      metrics: { monthlyRevenue: 78000, revenueGrowth: 5.6, technicians: 11, jobsCompleted: 167, avgRating: 4.7, reviewCount: 98 },
      compliance: { status: 'compliant', score: 94, expiringItems: 0 },
      territory: { region: 'west', zipCodes: ['97201', '97202', '97203'], population: 652503 },
      joinedDate: '2022-11-30',
      lastActivity: '2024-01-18T15:45:00'
    }
  ];

  private icons: Record<string, string> = {
    'building': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'dollar-sign': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'list': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'trending-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
    'star': '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'eye': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    'edit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    'more-vertical': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
    'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'chevron-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>',
    'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
  };

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  getSafeIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icons[name] || '');
  }

  get filteredFranchises(): Franchise[] {
    let result = [...this.franchises];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.location.toLowerCase().includes(query) ||
        f.owner.name.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter) {
      result = result.filter(f => f.status === this.statusFilter);
    }

    if (this.complianceFilter) {
      result = result.filter(f => f.compliance.status === this.complianceFilter);
    }

    if (this.regionFilter) {
      result = result.filter(f => f.territory.region === this.regionFilter);
    }

    return result;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFranchises.length / this.itemsPerPage);
  }

  getActiveFranchises(): number {
    return this.franchises.filter(f => f.status === 'active').length;
  }

  getAtRiskCompliance(): number {
    return this.franchises.filter(f => f.compliance.status === 'at_risk' || f.compliance.status === 'non_compliant').length;
  }

  getTotalRevenue(): number {
    return this.franchises.reduce((sum, f) => sum + f.metrics.monthlyRevenue, 0);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  viewFranchise(franchise: Franchise): void {
    this.router.navigate(['/franchises', franchise.id]);
  }

  editFranchise(franchise: Franchise): void {
    this.router.navigate(['/franchises', franchise.id, 'edit']);
  }

  openFranchiseMenu(franchise: Franchise, event: Event): void {
    event.stopPropagation();
    console.log('Opening menu for:', franchise.name);
  }

  openAddFranchise(): void {
    console.log('Opening add franchise modal');
  }

  exportData(): void {
    console.log('Exporting franchise data');
  }
}
