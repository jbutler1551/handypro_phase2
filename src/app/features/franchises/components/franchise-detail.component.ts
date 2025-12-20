import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Franchise {
  id: string;
  name: string;
  location: string;
  address: string;
  owner: { name: string; email: string; phone: string; };
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  metrics: {
    monthlyRevenue: number;
    revenueGrowth: number;
    technicians: number;
    jobsCompleted: number;
    avgRating: number;
    reviewCount: number;
    activeJobs: number;
    customersServed: number;
  };
  compliance: { status: string; score: number; items: ComplianceItem[]; };
  territory: { region: string; zipCodes: string[]; population: number; };
  joinedDate: string;
  technicians: Technician[];
  recentActivity: Activity[];
}

interface ComplianceItem {
  id: string;
  name: string;
  type: 'insurance' | 'license' | 'certification' | 'background';
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  expiresAt: string;
}

interface Technician {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'on_job' | 'off_duty';
  rating: number;
  jobsCompleted: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

@Component({
  selector: 'hp-franchise-detail',
  template: `
    <div class="hp-franchise-detail" *ngIf="franchise">
      <!-- Back Button & Header -->
      <div class="hp-franchise-detail__header">
        <button class="hp-franchise-detail__back" (click)="goBack()">
          <span [innerHTML]="getSafeIcon('arrow-left')"></span>
          Back to Franchises
        </button>
        <div class="hp-franchise-detail__header-content">
          <div class="hp-franchise-detail__header-info">
            <h1 class="hp-franchise-detail__title">{{ franchise.name }}</h1>
            <div class="hp-franchise-detail__location">
              <span [innerHTML]="getSafeIcon('map-pin')"></span>
              {{ franchise.address }}
            </div>
          </div>
          <div class="hp-franchise-detail__header-actions">
            <span class="hp-franchise-detail__status" [class]="'hp-franchise-detail__status--' + franchise.status">
              {{ franchise.status | titlecase }}
            </span>
            <button class="hp-franchise-detail__edit-btn">
              <span [innerHTML]="getSafeIcon('edit')"></span>
              Edit Franchise
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="hp-franchise-detail__tabs">
        <button
          *ngFor="let tab of tabs"
          [class.active]="activeTab === tab.id"
          (click)="activeTab = tab.id"
        >
          <span [innerHTML]="getSafeIcon(tab.icon)"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="hp-franchise-detail__content">
        <!-- Stats Row -->
        <div class="hp-franchise-detail__stats">
          <div class="hp-franchise-detail__stat">
            <div class="hp-franchise-detail__stat-icon hp-franchise-detail__stat-icon--primary">
              <span [innerHTML]="getSafeIcon('dollar-sign')"></span>
            </div>
            <div>
              <div class="hp-franchise-detail__stat-value">{{ franchise.metrics.monthlyRevenue | currency:'USD':'symbol':'1.0-0' }}</div>
              <div class="hp-franchise-detail__stat-label">Monthly Revenue</div>
              <div class="hp-franchise-detail__stat-change positive">+{{ franchise.metrics.revenueGrowth }}% vs last month</div>
            </div>
          </div>
          <div class="hp-franchise-detail__stat">
            <div class="hp-franchise-detail__stat-icon hp-franchise-detail__stat-icon--success">
              <span [innerHTML]="getSafeIcon('briefcase')"></span>
            </div>
            <div>
              <div class="hp-franchise-detail__stat-value">{{ franchise.metrics.jobsCompleted }}</div>
              <div class="hp-franchise-detail__stat-label">Jobs Completed (MTD)</div>
              <div class="hp-franchise-detail__stat-sub">{{ franchise.metrics.activeJobs }} active</div>
            </div>
          </div>
          <div class="hp-franchise-detail__stat">
            <div class="hp-franchise-detail__stat-icon hp-franchise-detail__stat-icon--info">
              <span [innerHTML]="getSafeIcon('users')"></span>
            </div>
            <div>
              <div class="hp-franchise-detail__stat-value">{{ franchise.metrics.technicians }}</div>
              <div class="hp-franchise-detail__stat-label">Technicians</div>
              <div class="hp-franchise-detail__stat-sub">{{ getTechsOnJob() }} on job</div>
            </div>
          </div>
          <div class="hp-franchise-detail__stat">
            <div class="hp-franchise-detail__stat-icon hp-franchise-detail__stat-icon--warning">
              <span [innerHTML]="getSafeIcon('star')"></span>
            </div>
            <div>
              <div class="hp-franchise-detail__stat-value">{{ franchise.metrics.avgRating.toFixed(1) }}</div>
              <div class="hp-franchise-detail__stat-label">Avg Rating</div>
              <div class="hp-franchise-detail__stat-sub">{{ franchise.metrics.reviewCount }} reviews</div>
            </div>
          </div>
        </div>

        <div class="hp-franchise-detail__grid">
          <!-- Owner Card -->
          <hp-card class="hp-franchise-detail__owner-card">
            <h3 class="hp-franchise-detail__section-title">Franchise Owner</h3>
            <div class="hp-franchise-detail__owner">
              <div class="hp-franchise-detail__owner-avatar">{{ getInitials(franchise.owner.name) }}</div>
              <div class="hp-franchise-detail__owner-info">
                <div class="hp-franchise-detail__owner-name">{{ franchise.owner.name }}</div>
                <div class="hp-franchise-detail__owner-detail">
                  <span [innerHTML]="getSafeIcon('mail')"></span>
                  {{ franchise.owner.email }}
                </div>
                <div class="hp-franchise-detail__owner-detail">
                  <span [innerHTML]="getSafeIcon('phone')"></span>
                  {{ franchise.owner.phone }}
                </div>
              </div>
            </div>
            <div class="hp-franchise-detail__owner-actions">
              <button class="hp-franchise-detail__action-btn">
                <span [innerHTML]="getSafeIcon('mail')"></span>
                Send Email
              </button>
              <button class="hp-franchise-detail__action-btn">
                <span [innerHTML]="getSafeIcon('phone')"></span>
                Call
              </button>
            </div>
          </hp-card>

          <!-- Compliance Summary -->
          <hp-card class="hp-franchise-detail__compliance-card">
            <div class="hp-franchise-detail__section-header">
              <h3 class="hp-franchise-detail__section-title">Compliance Status</h3>
              <button class="hp-franchise-detail__link-btn" (click)="activeTab = 'compliance'">View All</button>
            </div>
            <div class="hp-franchise-detail__compliance-score">
              <div class="hp-franchise-detail__score-circle" [class]="'hp-franchise-detail__score-circle--' + franchise.compliance.status">
                <span class="hp-franchise-detail__score-value">{{ franchise.compliance.score }}%</span>
                <span class="hp-franchise-detail__score-label">Score</span>
              </div>
              <div class="hp-franchise-detail__compliance-breakdown">
                <div class="hp-franchise-detail__compliance-item">
                  <span class="hp-franchise-detail__compliance-dot hp-franchise-detail__compliance-dot--valid"></span>
                  <span>{{ getComplianceCount('valid') }} Valid</span>
                </div>
                <div class="hp-franchise-detail__compliance-item">
                  <span class="hp-franchise-detail__compliance-dot hp-franchise-detail__compliance-dot--expiring"></span>
                  <span>{{ getComplianceCount('expiring') }} Expiring Soon</span>
                </div>
                <div class="hp-franchise-detail__compliance-item">
                  <span class="hp-franchise-detail__compliance-dot hp-franchise-detail__compliance-dot--expired"></span>
                  <span>{{ getComplianceCount('expired') }} Expired</span>
                </div>
              </div>
            </div>
          </hp-card>

          <!-- Territory Info -->
          <hp-card class="hp-franchise-detail__territory-card">
            <h3 class="hp-franchise-detail__section-title">Territory</h3>
            <div class="hp-franchise-detail__territory-map">
              <div class="hp-franchise-detail__map-placeholder">
                <span [innerHTML]="getSafeIcon('map')"></span>
                <span>Territory Map</span>
              </div>
            </div>
            <div class="hp-franchise-detail__territory-info">
              <div class="hp-franchise-detail__territory-stat">
                <span class="hp-franchise-detail__territory-label">Region</span>
                <span class="hp-franchise-detail__territory-value">{{ franchise.territory.region | titlecase }}</span>
              </div>
              <div class="hp-franchise-detail__territory-stat">
                <span class="hp-franchise-detail__territory-label">ZIP Codes</span>
                <span class="hp-franchise-detail__territory-value">{{ franchise.territory.zipCodes.length }}</span>
              </div>
              <div class="hp-franchise-detail__territory-stat">
                <span class="hp-franchise-detail__territory-label">Population</span>
                <span class="hp-franchise-detail__territory-value">{{ franchise.territory.population | number }}</span>
              </div>
            </div>
          </hp-card>

          <!-- Recent Activity -->
          <hp-card class="hp-franchise-detail__activity-card">
            <h3 class="hp-franchise-detail__section-title">Recent Activity</h3>
            <div class="hp-franchise-detail__activity-list">
              <div *ngFor="let activity of franchise.recentActivity" class="hp-franchise-detail__activity-item">
                <div class="hp-franchise-detail__activity-icon" [class]="'hp-franchise-detail__activity-icon--' + activity.type">
                  <span [innerHTML]="getSafeIcon(getActivityIcon(activity.type))"></span>
                </div>
                <div class="hp-franchise-detail__activity-content">
                  <div class="hp-franchise-detail__activity-desc">{{ activity.description }}</div>
                  <div class="hp-franchise-detail__activity-time">{{ activity.timestamp }}</div>
                </div>
              </div>
            </div>
          </hp-card>
        </div>
      </div>

      <!-- Technicians Tab -->
      <div *ngIf="activeTab === 'technicians'" class="hp-franchise-detail__content">
        <hp-card>
          <div class="hp-franchise-detail__section-header">
            <h3 class="hp-franchise-detail__section-title">Team Members</h3>
            <button class="hp-franchise-detail__add-btn">
              <span [innerHTML]="getSafeIcon('plus')"></span>
              Add Technician
            </button>
          </div>
          <div class="hp-franchise-detail__technicians">
            <div *ngFor="let tech of franchise.technicians" class="hp-franchise-detail__tech-card">
              <div class="hp-franchise-detail__tech-avatar">{{ getInitials(tech.name) }}</div>
              <div class="hp-franchise-detail__tech-info">
                <div class="hp-franchise-detail__tech-name">{{ tech.name }}</div>
                <div class="hp-franchise-detail__tech-role">{{ tech.role }}</div>
              </div>
              <div class="hp-franchise-detail__tech-stats">
                <div class="hp-franchise-detail__tech-rating">
                  <span [innerHTML]="getSafeIcon('star')"></span>
                  {{ tech.rating.toFixed(1) }}
                </div>
                <div class="hp-franchise-detail__tech-jobs">{{ tech.jobsCompleted }} jobs</div>
              </div>
              <span class="hp-franchise-detail__tech-status" [class]="'hp-franchise-detail__tech-status--' + tech.status">
                {{ tech.status.replace('_', ' ') | titlecase }}
              </span>
            </div>
          </div>
        </hp-card>
      </div>

      <!-- Compliance Tab -->
      <div *ngIf="activeTab === 'compliance'" class="hp-franchise-detail__content">
        <hp-card>
          <div class="hp-franchise-detail__section-header">
            <h3 class="hp-franchise-detail__section-title">Compliance Items</h3>
            <button class="hp-franchise-detail__add-btn">
              <span [innerHTML]="getSafeIcon('plus')"></span>
              Add Item
            </button>
          </div>
          <div class="hp-franchise-detail__compliance-table">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Expiration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of franchise.compliance.items">
                  <td class="hp-franchise-detail__compliance-name">{{ item.name }}</td>
                  <td><span class="hp-franchise-detail__compliance-type">{{ item.type | titlecase }}</span></td>
                  <td>
                    <span class="hp-franchise-detail__compliance-status" [class]="'hp-franchise-detail__compliance-status--' + item.status">
                      {{ item.status | titlecase }}
                    </span>
                  </td>
                  <td>{{ item.expiresAt }}</td>
                  <td>
                    <button class="hp-franchise-detail__table-action">
                      <span [innerHTML]="getSafeIcon('eye')"></span>
                    </button>
                    <button class="hp-franchise-detail__table-action">
                      <span [innerHTML]="getSafeIcon('upload')"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </hp-card>
      </div>

      <!-- Documents Tab -->
      <div *ngIf="activeTab === 'documents'" class="hp-franchise-detail__content">
        <hp-card>
          <div class="hp-franchise-detail__section-header">
            <h3 class="hp-franchise-detail__section-title">Franchise Documents</h3>
            <button class="hp-franchise-detail__add-btn">
              <span [innerHTML]="getSafeIcon('upload')"></span>
              Upload Document
            </button>
          </div>
          <div class="hp-franchise-detail__documents-empty">
            <span [innerHTML]="getSafeIcon('folder')"></span>
            <h4>No documents yet</h4>
            <p>Upload franchise agreements, contracts, and other documents here.</p>
          </div>
        </hp-card>
      </div>

      <!-- Billing Tab -->
      <div *ngIf="activeTab === 'billing'" class="hp-franchise-detail__content">
        <hp-card>
          <div class="hp-franchise-detail__section-header">
            <h3 class="hp-franchise-detail__section-title">Billing & Revenue</h3>
            <button class="hp-franchise-detail__link-btn">Download Statement</button>
          </div>
          <div class="hp-franchise-detail__billing-stats">
            <div class="hp-franchise-detail__billing-stat">
              <div class="hp-franchise-detail__billing-label">Total Revenue (YTD)</div>
              <div class="hp-franchise-detail__billing-value">$1,245,000</div>
            </div>
            <div class="hp-franchise-detail__billing-stat">
              <div class="hp-franchise-detail__billing-label">Royalty Fees Paid</div>
              <div class="hp-franchise-detail__billing-value">$62,250</div>
            </div>
            <div class="hp-franchise-detail__billing-stat">
              <div class="hp-franchise-detail__billing-label">Outstanding Balance</div>
              <div class="hp-franchise-detail__billing-value hp-franchise-detail__billing-value--success">$0</div>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-franchise-detail {
      padding: var(--hp-spacing-6);
      max-width: 1400px;
      margin: 0 auto;

      &__header {
        margin-bottom: var(--hp-spacing-6);
      }

      &__back {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) 0;
        background: none;
        border: none;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        cursor: pointer;
        margin-bottom: var(--hp-spacing-4);

        &:hover { color: var(--hp-color-primary); }

        :host ::ng-deep svg { width: 18px; height: 18px; }
      }

      &__header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__location {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);

        :host ::ng-deep svg { width: 16px; height: 16px; }
      }

      &__header-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__status {
        padding: var(--hp-spacing-1) var(--hp-spacing-3);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);

        &--active { background: rgba(16, 185, 129, 0.1); color: #059669; }
        &--pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        &--suspended { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
      }

      &__edit-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background: var(--hp-color-primary);
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-0);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        cursor: pointer;

        &:hover { background: var(--hp-color-primary-dark); }

        :host ::ng-deep svg { width: 16px; height: 16px; }
      }

      &__tabs {
        display: flex;
        gap: var(--hp-spacing-1);
        border-bottom: 1px solid var(--hp-color-neutral-200);
        margin-bottom: var(--hp-spacing-6);
        overflow-x: auto;

        button {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          padding: var(--hp-spacing-3) var(--hp-spacing-4);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-600);
          cursor: pointer;
          white-space: nowrap;
          transition: all 150ms;

          &:hover { color: var(--hp-color-neutral-900); }

          &.active {
            color: var(--hp-color-primary);
            border-bottom-color: var(--hp-color-primary);
          }

          :host ::ng-deep svg { width: 18px; height: 18px; }
        }
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);

        @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 575px) { grid-template-columns: 1fr; }
      }

      &__stat {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-5);
        background: var(--hp-color-neutral-0);
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-lg);

        &-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--hp-radius-lg);
          flex-shrink: 0;

          :host ::ng-deep svg { width: 24px; height: 24px; }

          &--primary { background: rgba(27, 58, 100, 0.1); color: var(--hp-color-primary); }
          &--success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
          &--info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
          &--warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        }

        &-value {
          font-size: var(--hp-font-size-2xl);
          font-weight: var(--hp-font-weight-bold);
          color: var(--hp-color-neutral-900);
        }

        &-label {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
        }

        &-change {
          font-size: var(--hp-font-size-xs);
          margin-top: var(--hp-spacing-1);

          &.positive { color: #10b981; }
        }

        &-sub {
          font-size: var(--hp-font-size-xs);
          color: var(--hp-color-neutral-500);
          margin-top: var(--hp-spacing-1);
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-5);

        @media (max-width: 1024px) { grid-template-columns: 1fr; }
      }

      &__section-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-4);

        .hp-franchise-detail__section-title { margin-bottom: 0; }
      }

      &__link-btn {
        background: none;
        border: none;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-primary);
        cursor: pointer;

        &:hover { text-decoration: underline; }
      }

      &__add-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-color-primary);
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-0);
        font-size: var(--hp-font-size-sm);
        cursor: pointer;

        :host ::ng-deep svg { width: 16px; height: 16px; }
      }

      &__owner {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);

        &-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--hp-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--hp-color-neutral-0);
          font-size: var(--hp-font-size-xl);
          font-weight: var(--hp-font-weight-semibold);
        }

        &-name {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
          margin-bottom: var(--hp-spacing-2);
        }

        &-detail {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-600);
          margin-bottom: var(--hp-spacing-1);

          :host ::ng-deep svg { width: 14px; height: 14px; color: var(--hp-color-neutral-400); }
        }
      }

      &__owner-actions {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__action-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background: var(--hp-color-neutral-100);
        border: none;
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
        cursor: pointer;

        &:hover { background: var(--hp-color-neutral-200); }

        :host ::ng-deep svg { width: 16px; height: 16px; }
      }

      &__compliance-score {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-6);
      }

      &__score-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 6px solid;

        &--compliant { border-color: #10b981; }
        &--at_risk { border-color: #f59e0b; }
        &--non_compliant { border-color: #ef4444; }
      }

      &__score-value {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
      }

      &__score-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__compliance-breakdown {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__compliance-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
      }

      &__compliance-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &--valid { background: #10b981; }
        &--expiring { background: #f59e0b; }
        &--expired { background: #ef4444; }
      }

      &__territory-map {
        height: 150px;
        background: var(--hp-color-neutral-100);
        border-radius: var(--hp-radius-md);
        margin-bottom: var(--hp-spacing-4);
      }

      &__map-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--hp-color-neutral-400);
        gap: var(--hp-spacing-2);

        :host ::ng-deep svg { width: 32px; height: 32px; }
      }

      &__territory-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);
      }

      &__territory-stat {
        text-align: center;
      }

      &__territory-label {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-bottom: var(--hp-spacing-1);
      }

      &__territory-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
      }

      &__activity-list {
        display: flex;
        flex-direction: column;
      }

      &__activity-item {
        display: flex;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) 0;
        border-bottom: 1px solid var(--hp-color-neutral-100);

        &:last-child { border-bottom: none; }
      }

      &__activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :host ::ng-deep svg { width: 16px; height: 16px; }

        &--job { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        &--payment { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        &--compliance { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        &--user { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
      }

      &__activity-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-900);
      }

      &__activity-time {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: var(--hp-spacing-1);
      }

      &__technicians {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--hp-spacing-4);
      }

      &__tech-card {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-4);
        background: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);
      }

      &__tech-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--hp-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--hp-color-neutral-0);
        font-weight: var(--hp-font-weight-semibold);
        flex-shrink: 0;
      }

      &__tech-info { flex: 1; }

      &__tech-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__tech-role {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__tech-stats {
        text-align: right;
      }

      &__tech-rating {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);

        :host ::ng-deep svg { width: 14px; height: 14px; color: #fbbf24; fill: #fbbf24; }
      }

      &__tech-jobs {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__tech-status {
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);

        &--active { background: rgba(16, 185, 129, 0.1); color: #059669; }
        &--on_job { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        &--off_duty { background: var(--hp-color-neutral-100); color: var(--hp-color-neutral-600); }
      }

      &__compliance-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: var(--hp-spacing-3) var(--hp-spacing-4);
          text-align: left;
          border-bottom: 1px solid var(--hp-color-neutral-100);
        }

        th {
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-500);
          text-transform: uppercase;
        }

        td {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-700);
        }
      }

      &__compliance-name {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900) !important;
      }

      &__compliance-type {
        padding: 2px 8px;
        background: var(--hp-color-neutral-100);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-xs);
      }

      &__compliance-status {
        padding: 2px 8px;
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);

        &--valid { background: rgba(16, 185, 129, 0.1); color: #059669; }
        &--expiring { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        &--expired { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        &--pending { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
      }

      &__table-action {
        background: none;
        border: none;
        padding: var(--hp-spacing-1);
        color: var(--hp-color-neutral-400);
        cursor: pointer;

        &:hover { color: var(--hp-color-neutral-700); }

        :host ::ng-deep svg { width: 16px; height: 16px; }
      }

      &__documents-empty {
        text-align: center;
        padding: var(--hp-spacing-12);
        color: var(--hp-color-neutral-400);

        :host ::ng-deep svg { width: 48px; height: 48px; margin-bottom: var(--hp-spacing-4); }

        h4 { font-size: var(--hp-font-size-lg); color: var(--hp-color-neutral-700); margin: 0 0 var(--hp-spacing-2); }
        p { margin: 0; font-size: var(--hp-font-size-sm); }
      }

      &__billing-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-6);

        @media (max-width: 767px) { grid-template-columns: 1fr; }
      }

      &__billing-stat {
        text-align: center;
        padding: var(--hp-spacing-6);
        background: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-lg);
      }

      &__billing-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        margin-bottom: var(--hp-spacing-2);
      }

      &__billing-value {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);

        &--success { color: #10b981; }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FranchiseDetailComponent implements OnInit {
  franchiseId: string = '';
  activeTab = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'technicians', label: 'Technicians', icon: 'users' },
    { id: 'compliance', label: 'Compliance', icon: 'shield' },
    { id: 'documents', label: 'Documents', icon: 'folder' },
    { id: 'billing', label: 'Billing', icon: 'dollar-sign' }
  ];

  franchise: Franchise = {
    id: '1',
    name: 'HandyPro Atlanta',
    location: 'Atlanta, GA',
    address: '123 Peachtree St NE, Atlanta, GA 30303',
    owner: { name: 'John Mitchell', email: 'john@handypro-atlanta.com', phone: '(404) 555-0101' },
    status: 'active',
    metrics: {
      monthlyRevenue: 125000,
      revenueGrowth: 12.5,
      technicians: 18,
      jobsCompleted: 342,
      avgRating: 4.8,
      reviewCount: 156,
      activeJobs: 24,
      customersServed: 1250
    },
    compliance: {
      status: 'compliant',
      score: 98,
      items: [
        { id: '1', name: 'General Liability Insurance', type: 'insurance', status: 'valid', expiresAt: 'Mar 15, 2025' },
        { id: '2', name: 'Workers Compensation', type: 'insurance', status: 'valid', expiresAt: 'Mar 15, 2025' },
        { id: '3', name: 'Business License', type: 'license', status: 'valid', expiresAt: 'Dec 31, 2024' },
        { id: '4', name: 'Contractor License', type: 'license', status: 'expiring', expiresAt: 'Feb 28, 2024' },
        { id: '5', name: 'EPA Certification', type: 'certification', status: 'valid', expiresAt: 'Jun 30, 2025' },
        { id: '6', name: 'Background Check - John Mitchell', type: 'background', status: 'valid', expiresAt: 'Jan 15, 2025' }
      ]
    },
    territory: { region: 'southeast', zipCodes: ['30301', '30302', '30303', '30304', '30305'], population: 498044 },
    joinedDate: '2021-03-15',
    technicians: [
      { id: '1', name: 'Marcus Johnson', role: 'Lead Technician', status: 'on_job', rating: 4.9, jobsCompleted: 456 },
      { id: '2', name: 'Sarah Williams', role: 'Senior Technician', status: 'active', rating: 4.8, jobsCompleted: 389 },
      { id: '3', name: 'David Chen', role: 'Technician', status: 'on_job', rating: 4.7, jobsCompleted: 234 },
      { id: '4', name: 'Emily Brown', role: 'Technician', status: 'active', rating: 4.6, jobsCompleted: 198 },
      { id: '5', name: 'Mike Torres', role: 'Apprentice', status: 'off_duty', rating: 4.5, jobsCompleted: 67 }
    ],
    recentActivity: [
      { id: '1', type: 'job', description: 'New job completed: Kitchen Faucet Repair', timestamp: '2 hours ago' },
      { id: '2', type: 'payment', description: 'Payment received: $450.00', timestamp: '4 hours ago' },
      { id: '3', type: 'user', description: 'New technician added: Mike Torres', timestamp: 'Yesterday' },
      { id: '4', type: 'compliance', description: 'Insurance document uploaded', timestamp: '2 days ago' },
      { id: '5', type: 'job', description: 'New job completed: Water Heater Installation', timestamp: '2 days ago' }
    ]
  };

  private icons: Record<string, string> = {
    'arrow-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'edit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    'dollar-sign': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'briefcase': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'star': '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'folder': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    'map': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'eye': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    'upload': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.franchiseId = this.route.snapshot.paramMap.get('id') || '1';
  }

  getSafeIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icons[name] || '');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getTechsOnJob(): number {
    return this.franchise.technicians.filter(t => t.status === 'on_job').length;
  }

  getComplianceCount(status: string): number {
    return this.franchise.compliance.items.filter(i => i.status === status).length;
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'job': 'briefcase',
      'payment': 'dollar-sign',
      'compliance': 'shield',
      'user': 'users'
    };
    return icons[type] || 'check-circle';
  }

  goBack(): void {
    this.router.navigate(['/franchises']);
  }
}
