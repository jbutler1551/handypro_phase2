import { Component, ChangeDetectionStrategy } from '@angular/core';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetTenants: string[];
  targetPlans: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface FlagChange {
  id: string;
  flagKey: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

@Component({
  selector: 'hp-admin-feature-flags',
  template: `
    <div class="hp-feature-flags">
      <!-- Header -->
      <div class="hp-feature-flags__header">
        <div class="hp-feature-flags__title-section">
          <h1 class="hp-feature-flags__title">Feature Flags</h1>
          <p class="hp-feature-flags__subtitle">Control feature rollouts and A/B testing across the platform</p>
        </div>
        <div class="hp-feature-flags__actions">
          <hp-button variant="outline" (click)="viewChangeLog()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Change Log
          </hp-button>
          <hp-button variant="primary" (click)="createFlag()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Flag
          </hp-button>
        </div>
      </div>

      <!-- Stats -->
      <div class="hp-feature-flags__stats">
        <div class="hp-feature-flags__stat">
          <span class="hp-feature-flags__stat-value">{{ flags.length }}</span>
          <span class="hp-feature-flags__stat-label">Total Flags</span>
        </div>
        <div class="hp-feature-flags__stat">
          <span class="hp-feature-flags__stat-value">{{ enabledFlags }}</span>
          <span class="hp-feature-flags__stat-label">Enabled</span>
        </div>
        <div class="hp-feature-flags__stat">
          <span class="hp-feature-flags__stat-value">{{ partialRollouts }}</span>
          <span class="hp-feature-flags__stat-label">Partial Rollout</span>
        </div>
        <div class="hp-feature-flags__stat">
          <span class="hp-feature-flags__stat-value">{{ recentChanges.length }}</span>
          <span class="hp-feature-flags__stat-label">Changes Today</span>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="hp-feature-flags__filters">
        <div class="hp-feature-flags__search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search flags..." [(ngModel)]="searchQuery" />
        </div>
        <div class="hp-feature-flags__filter-group">
          <select [(ngModel)]="statusFilter" class="hp-feature-flags__select">
            <option value="">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="partial">Partial Rollout</option>
          </select>
        </div>
      </div>

      <!-- Flags List -->
      <div class="hp-feature-flags__list">
        <div *ngFor="let flag of filteredFlags" class="hp-feature-flags__card">
          <div class="hp-feature-flags__card-header">
            <div class="hp-feature-flags__flag-info">
              <div class="hp-feature-flags__flag-status" [class.enabled]="flag.enabled" [class.partial]="flag.rolloutPercentage < 100 && flag.rolloutPercentage > 0"></div>
              <div class="hp-feature-flags__flag-details">
                <span class="hp-feature-flags__flag-name">{{ flag.name }}</span>
                <code class="hp-feature-flags__flag-key">{{ flag.key }}</code>
              </div>
            </div>
            <div class="hp-feature-flags__flag-toggle">
              <label class="hp-feature-flags__toggle">
                <input type="checkbox" [checked]="flag.enabled" (change)="toggleFlag(flag)" />
                <span class="hp-feature-flags__toggle-slider"></span>
              </label>
            </div>
          </div>

          <p class="hp-feature-flags__flag-description">{{ flag.description }}</p>

          <div class="hp-feature-flags__flag-config">
            <div class="hp-feature-flags__config-item">
              <span class="hp-feature-flags__config-label">Rollout</span>
              <div class="hp-feature-flags__rollout">
                <div class="hp-feature-flags__rollout-bar">
                  <div class="hp-feature-flags__rollout-fill" [style.width.%]="flag.rolloutPercentage"></div>
                </div>
                <span class="hp-feature-flags__rollout-value">{{ flag.rolloutPercentage }}%</span>
              </div>
            </div>

            <div class="hp-feature-flags__config-item" *ngIf="flag.targetPlans.length > 0">
              <span class="hp-feature-flags__config-label">Target Plans</span>
              <div class="hp-feature-flags__tags">
                <span *ngFor="let plan of flag.targetPlans" class="hp-feature-flags__tag">{{ plan }}</span>
              </div>
            </div>

            <div class="hp-feature-flags__config-item" *ngIf="flag.targetTenants.length > 0">
              <span class="hp-feature-flags__config-label">Target Tenants</span>
              <span class="hp-feature-flags__target-count">{{ flag.targetTenants.length }} tenants</span>
            </div>
          </div>

          <div class="hp-feature-flags__flag-footer">
            <span class="hp-feature-flags__flag-meta">
              Created by {{ flag.createdBy }} • Updated {{ flag.updatedAt }}
            </span>
            <div class="hp-feature-flags__flag-actions">
              <button class="hp-feature-flags__action-btn" (click)="editFlag(flag)" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="hp-feature-flags__action-btn" (click)="duplicateFlag(flag)" title="Duplicate">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button class="hp-feature-flags__action-btn hp-feature-flags__action-btn--danger" (click)="deleteFlag(flag)" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Changes Sidebar -->
      <div class="hp-feature-flags__sidebar" [class.open]="showChangeLog">
        <div class="hp-feature-flags__sidebar-header">
          <h3 class="hp-feature-flags__sidebar-title">Change Log</h3>
          <button class="hp-feature-flags__sidebar-close" (click)="showChangeLog = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="hp-feature-flags__changes">
          <div *ngFor="let change of recentChanges" class="hp-feature-flags__change">
            <div class="hp-feature-flags__change-icon" [class]="'hp-feature-flags__change-icon--' + getChangeType(change.action)">
              <svg *ngIf="change.action.includes('enabled')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg *ngIf="change.action.includes('disabled')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <svg *ngIf="change.action.includes('created')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <svg *ngIf="change.action.includes('updated')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div class="hp-feature-flags__change-content">
              <code class="hp-feature-flags__change-key">{{ change.flagKey }}</code>
              <span class="hp-feature-flags__change-action">{{ change.action }}</span>
              <span class="hp-feature-flags__change-meta">{{ change.user }} • {{ change.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal Backdrop -->
      <div *ngIf="showModal" class="hp-feature-flags__modal-backdrop" (click)="closeModal()"></div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="hp-feature-flags__modal">
        <div class="hp-feature-flags__modal-header">
          <h2 class="hp-feature-flags__modal-title">{{ editingFlag ? 'Edit Flag' : 'Create New Flag' }}</h2>
          <button class="hp-feature-flags__modal-close" (click)="closeModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="hp-feature-flags__modal-body">
          <div class="hp-feature-flags__form-group">
            <label>Flag Name</label>
            <input type="text" [(ngModel)]="modalFlag.name" placeholder="e.g., Dark Mode" />
          </div>
          <div class="hp-feature-flags__form-group">
            <label>Flag Key</label>
            <input type="text" [(ngModel)]="modalFlag.key" placeholder="e.g., dark_mode" />
            <span class="hp-feature-flags__form-hint">Unique identifier used in code</span>
          </div>
          <div class="hp-feature-flags__form-group">
            <label>Description</label>
            <textarea [(ngModel)]="modalFlag.description" placeholder="Describe what this flag controls..."></textarea>
          </div>
          <div class="hp-feature-flags__form-group">
            <label>Rollout Percentage</label>
            <div class="hp-feature-flags__slider-group">
              <input type="range" min="0" max="100" [(ngModel)]="modalFlag.rolloutPercentage" />
              <span class="hp-feature-flags__slider-value">{{ modalFlag.rolloutPercentage }}%</span>
            </div>
          </div>
          <div class="hp-feature-flags__form-group">
            <label>Target Plans</label>
            <div class="hp-feature-flags__checkbox-group">
              <label><input type="checkbox" [checked]="modalFlag.targetPlans.includes('starter')" (change)="togglePlan('starter')" /> Starter</label>
              <label><input type="checkbox" [checked]="modalFlag.targetPlans.includes('professional')" (change)="togglePlan('professional')" /> Professional</label>
              <label><input type="checkbox" [checked]="modalFlag.targetPlans.includes('enterprise')" (change)="togglePlan('enterprise')" /> Enterprise</label>
            </div>
          </div>
        </div>
        <div class="hp-feature-flags__modal-footer">
          <hp-button variant="outline" (click)="closeModal()">Cancel</hp-button>
          <hp-button variant="primary" (click)="saveFlag()">{{ editingFlag ? 'Save Changes' : 'Create Flag' }}</hp-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-feature-flags {
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
        color: var(--hp-color-neutral-0);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__subtitle {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin: 0;
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-2);
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
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
        text-align: center;
      }

      &__stat-value {
        display: block;
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__stat-label {
        display: block;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin-top: var(--hp-spacing-1);
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
      }

      &__list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      &__card {
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-3);
      }

      &__flag-info {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-3);
      }

      &__flag-status {
        width: 10px;
        height: 10px;
        margin-top: 6px;
        border-radius: 50%;
        background-color: var(--hp-color-neutral-600);
        flex-shrink: 0;

        &.enabled {
          background-color: #22c55e;
        }

        &.partial {
          background-color: var(--hp-color-warning);
        }
      }

      &__flag-details {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__flag-name {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
      }

      &__flag-key {
        font-size: var(--hp-font-size-xs);
        font-family: var(--hp-font-family-mono);
        color: var(--hp-color-neutral-500);
        background-color: var(--hp-color-neutral-750);
        padding: 2px 6px;
        border-radius: var(--hp-radius-sm);
      }

      &__toggle {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;

        input {
          opacity: 0;
          width: 0;
          height: 0;

          &:checked + .hp-feature-flags__toggle-slider {
            background-color: var(--hp-color-primary);

            &:before {
              transform: translateX(20px);
            }
          }
        }
      }

      &__toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--hp-color-neutral-600);
        transition: 0.3s;
        border-radius: 24px;

        &:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
      }

      &__flag-description {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin: 0 0 var(--hp-spacing-4);
        line-height: 1.5;
      }

      &__flag-config {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background-color: var(--hp-color-neutral-750);
        border-radius: var(--hp-radius-md);
        margin-bottom: var(--hp-spacing-4);
      }

      &__config-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__config-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__rollout {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
      }

      &__rollout-bar {
        width: 100px;
        height: 6px;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-full);
        overflow: hidden;
      }

      &__rollout-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-full);
      }

      &__rollout-value {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-200);
        min-width: 36px;
        text-align: right;
      }

      &__tags {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__tag {
        padding: 2px 8px;
        background-color: var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-sm);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-300);
        text-transform: capitalize;
      }

      &__target-count {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-300);
      }

      &__flag-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__flag-meta {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__flag-actions {
        display: flex;
        gap: var(--hp-spacing-1);
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
        transition: all 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-700);
          color: var(--hp-color-neutral-0);
        }

        &--danger:hover {
          background-color: rgba(239, 68, 68, 0.2);
          color: var(--hp-color-error);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__sidebar {
        position: fixed;
        right: -400px;
        top: 64px;
        width: 400px;
        height: calc(100vh - 64px);
        background-color: var(--hp-color-neutral-800);
        border-left: 1px solid var(--hp-color-neutral-700);
        z-index: 200;
        transition: right 300ms ease;
        overflow-y: auto;

        &.open {
          right: 0;
        }
      }

      &__sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4) var(--hp-spacing-5);
        border-bottom: 1px solid var(--hp-color-neutral-700);
        position: sticky;
        top: 0;
        background-color: var(--hp-color-neutral-800);
      }

      &__sidebar-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0;
      }

      &__sidebar-close {
        padding: var(--hp-spacing-2);
        background: none;
        border: none;
        color: var(--hp-color-neutral-400);
        cursor: pointer;
        border-radius: var(--hp-radius-md);

        &:hover {
          background-color: var(--hp-color-neutral-700);
          color: var(--hp-color-neutral-0);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__changes {
        padding: var(--hp-spacing-4);
      }

      &__change {
        display: flex;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        border-bottom: 1px solid var(--hp-color-neutral-700);

        &:last-child {
          border-bottom: none;
        }
      }

      &__change-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--hp-radius-md);
        flex-shrink: 0;

        svg {
          width: 14px;
          height: 14px;
        }

        &--enabled {
          background-color: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        &--disabled {
          background-color: rgba(239, 68, 68, 0.2);
          color: var(--hp-color-error);
        }

        &--created {
          background-color: rgba(59, 130, 246, 0.2);
          color: var(--hp-color-info);
        }

        &--updated {
          background-color: rgba(245, 158, 11, 0.2);
          color: var(--hp-color-warning);
        }
      }

      &__change-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__change-key {
        font-size: var(--hp-font-size-xs);
        font-family: var(--hp-font-family-mono);
        color: var(--hp-color-neutral-200);
        background-color: var(--hp-color-neutral-750);
        padding: 1px 4px;
        border-radius: 2px;
        align-self: flex-start;
      }

      &__change-action {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__change-meta {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 300;
      }

      &__modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 500px;
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
        z-index: 301;
      }

      &__modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-5);
        border-bottom: 1px solid var(--hp-color-neutral-700);
      }

      &__modal-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0;
      }

      &__modal-close {
        padding: var(--hp-spacing-2);
        background: none;
        border: none;
        color: var(--hp-color-neutral-400);
        cursor: pointer;
        border-radius: var(--hp-radius-md);

        &:hover {
          background-color: var(--hp-color-neutral-700);
          color: var(--hp-color-neutral-0);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__modal-body {
        padding: var(--hp-spacing-5);
      }

      &__form-group {
        margin-bottom: var(--hp-spacing-4);

        label {
          display: block;
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-200);
          margin-bottom: var(--hp-spacing-2);
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: var(--hp-spacing-3);
          background-color: var(--hp-color-neutral-750);
          border: 1px solid var(--hp-color-neutral-700);
          border-radius: var(--hp-radius-md);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-0);

          &:focus {
            outline: none;
            border-color: var(--hp-color-primary);
          }

          &::placeholder {
            color: var(--hp-color-neutral-500);
          }
        }

        textarea {
          min-height: 80px;
          resize: vertical;
        }
      }

      &__form-hint {
        display: block;
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin-top: var(--hp-spacing-1);
      }

      &__slider-group {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);

        input[type="range"] {
          flex: 1;
          height: 6px;
          -webkit-appearance: none;
          background: var(--hp-color-neutral-700);
          border-radius: var(--hp-radius-full);

          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: var(--hp-color-primary);
            border-radius: 50%;
            cursor: pointer;
          }
        }
      }

      &__slider-value {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        min-width: 40px;
        text-align: right;
      }

      &__checkbox-group {
        display: flex;
        gap: var(--hp-spacing-4);

        label {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          font-weight: var(--hp-font-weight-normal);
          cursor: pointer;

          input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: var(--hp-color-primary);
          }
        }
      }

      &__modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-4) var(--hp-spacing-5);
        border-top: 1px solid var(--hp-color-neutral-700);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureFlagsComponent {
  searchQuery = '';
  statusFilter = '';
  showChangeLog = false;
  showModal = false;
  editingFlag: FeatureFlag | null = null;

  modalFlag = {
    name: '',
    key: '',
    description: '',
    rolloutPercentage: 100,
    targetPlans: [] as string[]
  };

  flags: FeatureFlag[] = [
    {
      id: '1',
      key: 'dark_mode',
      name: 'Dark Mode',
      description: 'Enable dark mode theme option for all users in the dashboard.',
      enabled: true,
      rolloutPercentage: 100,
      targetTenants: [],
      targetPlans: ['professional', 'enterprise'],
      createdAt: '2024-01-01',
      updatedAt: '2 days ago',
      createdBy: 'Admin'
    },
    {
      id: '2',
      key: 'new_scheduler_v2',
      name: 'New Scheduler V2',
      description: 'Redesigned job scheduler with drag-and-drop support and improved calendar view.',
      enabled: true,
      rolloutPercentage: 50,
      targetTenants: ['tenant_123', 'tenant_456'],
      targetPlans: [],
      createdAt: '2024-01-10',
      updatedAt: '1 week ago',
      createdBy: 'Admin'
    },
    {
      id: '3',
      key: 'ai_job_suggestions',
      name: 'AI Job Suggestions',
      description: 'AI-powered suggestions for optimal job scheduling and resource allocation.',
      enabled: false,
      rolloutPercentage: 0,
      targetTenants: [],
      targetPlans: ['enterprise'],
      createdAt: '2024-01-15',
      updatedAt: '3 days ago',
      createdBy: 'Admin'
    },
    {
      id: '4',
      key: 'advanced_reporting',
      name: 'Advanced Reporting',
      description: 'Enhanced reporting with custom metrics, scheduled exports, and data visualization.',
      enabled: true,
      rolloutPercentage: 100,
      targetTenants: [],
      targetPlans: ['professional', 'enterprise'],
      createdAt: '2023-12-01',
      updatedAt: '1 month ago',
      createdBy: 'Admin'
    },
    {
      id: '5',
      key: 'customer_portal_v2',
      name: 'Customer Portal V2',
      description: 'Redesigned customer-facing portal with improved UX and self-service features.',
      enabled: true,
      rolloutPercentage: 25,
      targetTenants: [],
      targetPlans: [],
      createdAt: '2024-01-05',
      updatedAt: '5 days ago',
      createdBy: 'Admin'
    },
    {
      id: '6',
      key: 'webhooks_v2',
      name: 'Webhooks V2',
      description: 'New webhook system with retry logic, event filtering, and delivery logs.',
      enabled: false,
      rolloutPercentage: 0,
      targetTenants: [],
      targetPlans: [],
      createdAt: '2024-01-12',
      updatedAt: 'Today',
      createdBy: 'Admin'
    }
  ];

  recentChanges: FlagChange[] = [
    { id: '1', flagKey: 'webhooks_v2', action: 'created', user: 'Admin', timestamp: '2 hours ago' },
    { id: '2', flagKey: 'customer_portal_v2', action: 'updated rollout to 25%', user: 'Admin', timestamp: '5 hours ago' },
    { id: '3', flagKey: 'ai_job_suggestions', action: 'disabled', user: 'Admin', timestamp: '1 day ago' },
    { id: '4', flagKey: 'dark_mode', action: 'enabled for all', user: 'Admin', timestamp: '2 days ago' },
    { id: '5', flagKey: 'new_scheduler_v2', action: 'updated rollout to 50%', user: 'Admin', timestamp: '1 week ago' }
  ];

  get filteredFlags(): FeatureFlag[] {
    return this.flags.filter(flag => {
      const matchesSearch = !this.searchQuery ||
        flag.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        flag.key.toLowerCase().includes(this.searchQuery.toLowerCase());

      let matchesStatus = true;
      if (this.statusFilter === 'enabled') {
        matchesStatus = flag.enabled && flag.rolloutPercentage === 100;
      } else if (this.statusFilter === 'disabled') {
        matchesStatus = !flag.enabled;
      } else if (this.statusFilter === 'partial') {
        matchesStatus = flag.enabled && flag.rolloutPercentage < 100 && flag.rolloutPercentage > 0;
      }

      return matchesSearch && matchesStatus;
    });
  }

  get enabledFlags(): number {
    return this.flags.filter(f => f.enabled).length;
  }

  get partialRollouts(): number {
    return this.flags.filter(f => f.enabled && f.rolloutPercentage < 100 && f.rolloutPercentage > 0).length;
  }

  getChangeType(action: string): string {
    if (action.includes('enabled')) return 'enabled';
    if (action.includes('disabled')) return 'disabled';
    if (action.includes('created')) return 'created';
    return 'updated';
  }

  toggleFlag(flag: FeatureFlag): void {
    flag.enabled = !flag.enabled;
    console.log('Toggle flag:', flag.key, flag.enabled);
  }

  createFlag(): void {
    this.editingFlag = null;
    this.modalFlag = {
      name: '',
      key: '',
      description: '',
      rolloutPercentage: 100,
      targetPlans: []
    };
    this.showModal = true;
  }

  editFlag(flag: FeatureFlag): void {
    this.editingFlag = flag;
    this.modalFlag = {
      name: flag.name,
      key: flag.key,
      description: flag.description,
      rolloutPercentage: flag.rolloutPercentage,
      targetPlans: [...flag.targetPlans]
    };
    this.showModal = true;
  }

  duplicateFlag(flag: FeatureFlag): void {
    console.log('Duplicate flag:', flag.key);
  }

  deleteFlag(flag: FeatureFlag): void {
    console.log('Delete flag:', flag.key);
  }

  viewChangeLog(): void {
    this.showChangeLog = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingFlag = null;
  }

  saveFlag(): void {
    console.log('Save flag:', this.modalFlag);
    this.closeModal();
  }

  togglePlan(plan: string): void {
    const index = this.modalFlag.targetPlans.indexOf(plan);
    if (index > -1) {
      this.modalFlag.targetPlans.splice(index, 1);
    } else {
      this.modalFlag.targetPlans.push(plan);
    }
  }
}
