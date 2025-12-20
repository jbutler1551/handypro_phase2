import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  category: 'payments' | 'accounting';
  lastSync?: string;
  status?: 'healthy' | 'warning' | 'error';
}

interface Transaction {
  id: string;
  franchise: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  date: string;
  customer: string;
}

interface SyncLog {
  id: string;
  integration: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  timestamp: string;
}

@Component({
  selector: 'hp-integrations-settings',
  template: `
    <div class="hp-integrations-settings">
      <!-- Tabs -->
      <div class="hp-integrations-settings__tabs">
        <button *ngFor="let tab of tabs" [class.active]="activeTab === tab.id" (click)="activeTab = tab.id">
          <span [innerHTML]="getSafeIcon(tab.icon)"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Overview Tab -->
      <div *ngIf="activeTab === 'overview'" class="hp-integrations-settings__content">
        <!-- Integration Cards -->
        <div class="hp-integrations-settings__integration-grid">
          <div *ngFor="let integration of integrations" class="hp-integrations-settings__integration-card" [class.connected]="integration.connected">
            <div class="hp-integrations-settings__integration-header">
              <div class="hp-integrations-settings__integration-icon" [innerHTML]="getSafeIcon(integration.icon)"></div>
              <div class="hp-integrations-settings__integration-info">
                <h3>{{ integration.name }}</h3>
                <p>{{ integration.description }}</p>
              </div>
              <div class="hp-integrations-settings__integration-status" *ngIf="integration.connected">
                <span class="hp-integrations-settings__status-dot" [class]="'hp-integrations-settings__status-dot--' + integration.status"></span>
                {{ integration.status | titlecase }}
              </div>
            </div>
            <div *ngIf="integration.connected" class="hp-integrations-settings__integration-details">
              <div class="hp-integrations-settings__detail">
                <span class="hp-integrations-settings__detail-label">Last Sync</span>
                <span class="hp-integrations-settings__detail-value">{{ integration.lastSync }}</span>
              </div>
              <div class="hp-integrations-settings__integration-actions">
                <button class="hp-integrations-settings__action-btn" (click)="syncNow(integration)">
                  <span [innerHTML]="getSafeIcon('refresh')"></span>
                  Sync Now
                </button>
                <button class="hp-integrations-settings__action-btn" (click)="configureIntegration(integration)">
                  <span [innerHTML]="getSafeIcon('settings')"></span>
                  Configure
                </button>
              </div>
            </div>
            <div *ngIf="!integration.connected" class="hp-integrations-settings__integration-connect">
              <hp-button variant="primary" (click)="connectIntegration(integration)">Connect {{ integration.name }}</hp-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stripe Tab -->
      <div *ngIf="activeTab === 'stripe'" class="hp-integrations-settings__content">
        <div class="hp-integrations-settings__stripe-grid">
          <!-- Revenue Stats -->
          <hp-card class="hp-integrations-settings__stripe-stats">
            <h3 class="hp-integrations-settings__card-title">Payment Overview</h3>
            <div class="hp-integrations-settings__stats-grid">
              <div class="hp-integrations-settings__stat">
                <div class="hp-integrations-settings__stat-value">$847,500</div>
                <div class="hp-integrations-settings__stat-label">Total Volume (MTD)</div>
                <div class="hp-integrations-settings__stat-change positive">+12.5% vs last month</div>
              </div>
              <div class="hp-integrations-settings__stat">
                <div class="hp-integrations-settings__stat-value">1,245</div>
                <div class="hp-integrations-settings__stat-label">Transactions</div>
              </div>
              <div class="hp-integrations-settings__stat">
                <div class="hp-integrations-settings__stat-value">$680.32</div>
                <div class="hp-integrations-settings__stat-label">Avg Transaction</div>
              </div>
              <div class="hp-integrations-settings__stat">
                <div class="hp-integrations-settings__stat-value">0.8%</div>
                <div class="hp-integrations-settings__stat-label">Failure Rate</div>
                <div class="hp-integrations-settings__stat-change positive">-0.3% vs last month</div>
              </div>
            </div>
          </hp-card>

          <!-- Recent Transactions -->
          <hp-card class="hp-integrations-settings__stripe-transactions">
            <div class="hp-integrations-settings__card-header">
              <h3 class="hp-integrations-settings__card-title">Recent Transactions</h3>
              <button class="hp-integrations-settings__view-all">View All in Stripe</button>
            </div>
            <div class="hp-integrations-settings__transactions-list">
              <div *ngFor="let tx of recentTransactions" class="hp-integrations-settings__transaction">
                <div class="hp-integrations-settings__transaction-info">
                  <div class="hp-integrations-settings__transaction-customer">{{ tx.customer }}</div>
                  <div class="hp-integrations-settings__transaction-franchise">{{ tx.franchise }}</div>
                </div>
                <div class="hp-integrations-settings__transaction-amount">{{ tx.amount | currency }}</div>
                <span class="hp-integrations-settings__transaction-status" [class]="'hp-integrations-settings__transaction-status--' + tx.status">
                  {{ tx.status | titlecase }}
                </span>
                <div class="hp-integrations-settings__transaction-date">{{ tx.date }}</div>
              </div>
            </div>
          </hp-card>

          <!-- Stripe Settings -->
          <hp-card class="hp-integrations-settings__stripe-settings">
            <h3 class="hp-integrations-settings__card-title">Stripe Settings</h3>
            <div class="hp-integrations-settings__settings-list">
              <div class="hp-integrations-settings__setting-item">
                <div class="hp-integrations-settings__setting-info">
                  <div class="hp-integrations-settings__setting-label">Automatic Payouts</div>
                  <div class="hp-integrations-settings__setting-desc">Automatically transfer funds to franchise bank accounts</div>
                </div>
                <label class="hp-integrations-settings__switch">
                  <input type="checkbox" [(ngModel)]="autoPayouts">
                  <span class="hp-integrations-settings__switch-slider"></span>
                </label>
              </div>
              <div class="hp-integrations-settings__setting-item">
                <div class="hp-integrations-settings__setting-info">
                  <div class="hp-integrations-settings__setting-label">Payment Receipts</div>
                  <div class="hp-integrations-settings__setting-desc">Send email receipts to customers after payment</div>
                </div>
                <label class="hp-integrations-settings__switch">
                  <input type="checkbox" [(ngModel)]="paymentReceipts">
                  <span class="hp-integrations-settings__switch-slider"></span>
                </label>
              </div>
              <div class="hp-integrations-settings__setting-item">
                <div class="hp-integrations-settings__setting-info">
                  <div class="hp-integrations-settings__setting-label">Failed Payment Retries</div>
                  <div class="hp-integrations-settings__setting-desc">Automatically retry failed payments</div>
                </div>
                <label class="hp-integrations-settings__switch">
                  <input type="checkbox" [(ngModel)]="autoRetry">
                  <span class="hp-integrations-settings__switch-slider"></span>
                </label>
              </div>
            </div>
          </hp-card>
        </div>
      </div>

      <!-- QuickBooks Tab -->
      <div *ngIf="activeTab === 'quickbooks'" class="hp-integrations-settings__content">
        <div class="hp-integrations-settings__qb-grid">
          <!-- Sync Status -->
          <hp-card class="hp-integrations-settings__qb-status">
            <h3 class="hp-integrations-settings__card-title">Sync Status</h3>
            <div class="hp-integrations-settings__sync-status">
              <div class="hp-integrations-settings__sync-icon healthy">
                <span [innerHTML]="getSafeIcon('check-circle')"></span>
              </div>
              <div class="hp-integrations-settings__sync-info">
                <div class="hp-integrations-settings__sync-title">All Synced</div>
                <div class="hp-integrations-settings__sync-time">Last sync: 5 minutes ago</div>
              </div>
              <button class="hp-integrations-settings__sync-btn" (click)="syncQuickBooks()">
                <span [innerHTML]="getSafeIcon('refresh')"></span>
                Sync Now
              </button>
            </div>
            <div class="hp-integrations-settings__sync-counts">
              <div class="hp-integrations-settings__sync-count">
                <span class="hp-integrations-settings__sync-count-value">1,245</span>
                <span class="hp-integrations-settings__sync-count-label">Invoices Synced</span>
              </div>
              <div class="hp-integrations-settings__sync-count">
                <span class="hp-integrations-settings__sync-count-value">892</span>
                <span class="hp-integrations-settings__sync-count-label">Payments Recorded</span>
              </div>
              <div class="hp-integrations-settings__sync-count">
                <span class="hp-integrations-settings__sync-count-value">456</span>
                <span class="hp-integrations-settings__sync-count-label">Expenses Logged</span>
              </div>
            </div>
          </hp-card>

          <!-- Account Mapping -->
          <hp-card class="hp-integrations-settings__qb-mapping">
            <div class="hp-integrations-settings__card-header">
              <h3 class="hp-integrations-settings__card-title">Account Mapping</h3>
              <button class="hp-integrations-settings__edit-btn">Edit Mapping</button>
            </div>
            <div class="hp-integrations-settings__mapping-list">
              <div class="hp-integrations-settings__mapping-item">
                <span class="hp-integrations-settings__mapping-source">Service Revenue</span>
                <span [innerHTML]="getSafeIcon('arrow-right')"></span>
                <span class="hp-integrations-settings__mapping-target">4000 - Service Income</span>
              </div>
              <div class="hp-integrations-settings__mapping-item">
                <span class="hp-integrations-settings__mapping-source">Parts & Materials</span>
                <span [innerHTML]="getSafeIcon('arrow-right')"></span>
                <span class="hp-integrations-settings__mapping-target">5000 - Cost of Goods Sold</span>
              </div>
              <div class="hp-integrations-settings__mapping-item">
                <span class="hp-integrations-settings__mapping-source">Labor Costs</span>
                <span [innerHTML]="getSafeIcon('arrow-right')"></span>
                <span class="hp-integrations-settings__mapping-target">6000 - Payroll Expenses</span>
              </div>
              <div class="hp-integrations-settings__mapping-item">
                <span class="hp-integrations-settings__mapping-source">Royalty Fees</span>
                <span [innerHTML]="getSafeIcon('arrow-right')"></span>
                <span class="hp-integrations-settings__mapping-target">6500 - Franchise Fees</span>
              </div>
            </div>
          </hp-card>

          <!-- Sync Settings -->
          <hp-card class="hp-integrations-settings__qb-settings">
            <h3 class="hp-integrations-settings__card-title">Sync Settings</h3>
            <div class="hp-integrations-settings__settings-list">
              <div class="hp-integrations-settings__setting-item">
                <div class="hp-integrations-settings__setting-info">
                  <div class="hp-integrations-settings__setting-label">Auto-sync Invoices</div>
                  <div class="hp-integrations-settings__setting-desc">Automatically sync new invoices to QuickBooks</div>
                </div>
                <label class="hp-integrations-settings__switch">
                  <input type="checkbox" [(ngModel)]="autoSyncInvoices">
                  <span class="hp-integrations-settings__switch-slider"></span>
                </label>
              </div>
              <div class="hp-integrations-settings__setting-item">
                <div class="hp-integrations-settings__setting-info">
                  <div class="hp-integrations-settings__setting-label">Auto-sync Payments</div>
                  <div class="hp-integrations-settings__setting-desc">Automatically record payments in QuickBooks</div>
                </div>
                <label class="hp-integrations-settings__switch">
                  <input type="checkbox" [(ngModel)]="autoSyncPayments">
                  <span class="hp-integrations-settings__switch-slider"></span>
                </label>
              </div>
              <div class="hp-integrations-settings__setting-item">
                <div class="hp-integrations-settings__setting-info">
                  <div class="hp-integrations-settings__setting-label">Sync Frequency</div>
                  <div class="hp-integrations-settings__setting-desc">How often to sync data with QuickBooks</div>
                </div>
                <select [(ngModel)]="syncFrequency" class="hp-integrations-settings__select">
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
          </hp-card>
        </div>
      </div>

      <!-- Logs Tab -->
      <div *ngIf="activeTab === 'logs'" class="hp-integrations-settings__content">
        <hp-card>
          <div class="hp-integrations-settings__card-header">
            <h3 class="hp-integrations-settings__card-title">Integration Activity Log</h3>
            <div class="hp-integrations-settings__log-filters">
              <select [(ngModel)]="logFilter" class="hp-integrations-settings__select">
                <option value="">All Integrations</option>
                <option value="stripe">Stripe</option>
                <option value="quickbooks">QuickBooks</option>
              </select>
              <select [(ngModel)]="statusFilter" class="hp-integrations-settings__select">
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <div class="hp-integrations-settings__log-list">
            <div *ngFor="let log of filteredLogs" class="hp-integrations-settings__log-item">
              <div class="hp-integrations-settings__log-icon" [class]="'hp-integrations-settings__log-icon--' + log.status">
                <span [innerHTML]="getSafeIcon(getLogIcon(log.status))"></span>
              </div>
              <div class="hp-integrations-settings__log-content">
                <div class="hp-integrations-settings__log-action">
                  <span class="hp-integrations-settings__log-integration">{{ log.integration }}</span>
                  {{ log.action }}
                </div>
                <div class="hp-integrations-settings__log-details">{{ log.details }}</div>
              </div>
              <div class="hp-integrations-settings__log-time">{{ log.timestamp }}</div>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-integrations-settings {
      display: flex;
      flex-direction: column;
      gap: var(--hp-spacing-6);

      &__tabs {
        display: flex;
        gap: var(--hp-spacing-1);
        border-bottom: 1px solid var(--hp-color-neutral-200);
        margin-bottom: var(--hp-spacing-2);
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
          &:hover { color: var(--hp-color-neutral-900); }
          &.active { color: var(--hp-color-primary); border-bottom-color: var(--hp-color-primary); }
          :host ::ng-deep svg { width: 18px; height: 18px; }
        }
      }

      &__integration-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-5);
        @media (max-width: 767px) { grid-template-columns: 1fr; }
      }

      &__integration-card {
        background: var(--hp-color-neutral-0);
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-lg);
        padding: var(--hp-spacing-5);
        &.connected { border-color: rgba(16, 185, 129, 0.3); }
      }

      &__integration-header {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
      }

      &__integration-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--hp-color-neutral-100);
        border-radius: var(--hp-radius-md);
        flex-shrink: 0;
        :host ::ng-deep svg { width: 28px; height: 28px; }
      }

      &__integration-info {
        flex: 1;
        h3 { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-neutral-900); margin: 0 0 var(--hp-spacing-1); }
        p { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); margin: 0; }
      }

      &__integration-status {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
      }

      &__status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        &--healthy { background: #10b981; }
        &--warning { background: #f59e0b; }
        &--error { background: #ef4444; }
      }

      &__integration-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-100);
      }

      &__detail-label { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); }
      &__detail-value { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-color-neutral-900); }

      &__integration-actions { display: flex; gap: var(--hp-spacing-2); }

      &__action-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-color-neutral-100);
        border: none;
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-700);
        cursor: pointer;
        &:hover { background: var(--hp-color-neutral-200); }
        :host ::ng-deep svg { width: 16px; height: 16px; }
      }

      &__integration-connect { padding-top: var(--hp-spacing-4); border-top: 1px solid var(--hp-color-neutral-100); }

      &__card-title { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-neutral-900); margin: 0 0 var(--hp-spacing-4); }

      &__card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--hp-spacing-4); .hp-integrations-settings__card-title { margin-bottom: 0; } }

      &__stripe-grid, &__qb-grid { display: flex; flex-direction: column; gap: var(--hp-spacing-5); }

      &__stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); @media (max-width: 767px) { grid-template-columns: repeat(2, 1fr); } }

      &__stat { text-align: center; padding: var(--hp-spacing-4); background: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); }
      &__stat-value { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-color-neutral-900); }
      &__stat-label { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); margin-top: var(--hp-spacing-1); }
      &__stat-change { font-size: var(--hp-font-size-xs); margin-top: var(--hp-spacing-1); &.positive { color: #10b981; } }

      &__view-all, &__edit-btn { background: none; border: none; font-size: var(--hp-font-size-sm); color: var(--hp-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }

      &__transactions-list { display: flex; flex-direction: column; }

      &__transaction {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-3) 0;
        border-bottom: 1px solid var(--hp-color-neutral-100);
        &:last-child { border-bottom: none; }
      }

      &__transaction-info { flex: 1; }
      &__transaction-customer { font-weight: var(--hp-font-weight-medium); color: var(--hp-color-neutral-900); }
      &__transaction-franchise { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); }
      &__transaction-amount { font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-neutral-900); }
      &__transaction-status {
        padding: 2px 8px;
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        &--succeeded { background: rgba(16, 185, 129, 0.1); color: #059669; }
        &--pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        &--failed { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
      }
      &__transaction-date { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); min-width: 80px; text-align: right; }

      &__settings-list { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }

      &__setting-item { display: flex; justify-content: space-between; align-items: center; padding: var(--hp-spacing-4); background: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); }
      &__setting-label { font-weight: var(--hp-font-weight-medium); color: var(--hp-color-neutral-900); }
      &__setting-desc { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); }

      &__switch {
        position: relative;
        width: 48px;
        height: 28px;
        input {
          opacity: 0;
          width: 0;
          height: 0;
          &:checked + .hp-integrations-settings__switch-slider { background: var(--hp-color-primary); &::before { transform: translateX(20px); } }
        }
        &-slider {
          position: absolute;
          inset: 0;
          background: var(--hp-color-neutral-300);
          border-radius: 14px;
          cursor: pointer;
          transition: all 200ms;
          &::before { content: ''; position: absolute; width: 22px; height: 22px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: transform 200ms; box-shadow: 0 2px 4px rgba(0,0,0,0.15); }
        }
      }

      &__select {
        height: 36px;
        padding: 0 var(--hp-spacing-8) 0 var(--hp-spacing-3);
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        background: var(--hp-color-neutral-0);
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
      }

      &__sync-status { display: flex; align-items: center; gap: var(--hp-spacing-4); padding: var(--hp-spacing-4); background: rgba(16, 185, 129, 0.05); border-radius: var(--hp-radius-lg); border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: var(--hp-spacing-4); }
      &__sync-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; &.healthy { background: rgba(16, 185, 129, 0.15); color: #10b981; } :host ::ng-deep svg { width: 24px; height: 24px; } }
      &__sync-info { flex: 1; }
      &__sync-title { font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-neutral-900); }
      &__sync-time { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); }
      &__sync-btn { display: flex; align-items: center; gap: var(--hp-spacing-2); padding: var(--hp-spacing-2) var(--hp-spacing-4); background: var(--hp-color-primary); border: none; border-radius: var(--hp-radius-md); color: white; font-size: var(--hp-font-size-sm); cursor: pointer; &:hover { background: var(--hp-color-primary-dark); } :host ::ng-deep svg { width: 16px; height: 16px; } }
      &__sync-counts { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--hp-spacing-4); }
      &__sync-count { text-align: center; padding: var(--hp-spacing-3); background: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); }
      &__sync-count-value { font-size: var(--hp-font-size-xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-color-neutral-900); }
      &__sync-count-label { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); }

      &__mapping-list { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__mapping-item { display: flex; align-items: center; gap: var(--hp-spacing-3); padding: var(--hp-spacing-3); background: var(--hp-color-neutral-50); border-radius: var(--hp-radius-md); :host ::ng-deep svg { width: 16px; height: 16px; color: var(--hp-color-neutral-400); } }
      &__mapping-source { font-weight: var(--hp-font-weight-medium); color: var(--hp-color-neutral-900); min-width: 150px; }
      &__mapping-target { color: var(--hp-color-neutral-600); }

      &__log-filters { display: flex; gap: var(--hp-spacing-3); }
      &__log-list { display: flex; flex-direction: column; }
      &__log-item { display: flex; align-items: flex-start; gap: var(--hp-spacing-3); padding: var(--hp-spacing-4); border-bottom: 1px solid var(--hp-color-neutral-100); &:last-child { border-bottom: none; } }
      &__log-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        :host ::ng-deep svg { width: 16px; height: 16px; }
        &--success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        &--warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        &--error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      }
      &__log-content { flex: 1; }
      &__log-action { font-weight: var(--hp-font-weight-medium); color: var(--hp-color-neutral-900); }
      &__log-integration { color: var(--hp-color-primary); margin-right: var(--hp-spacing-1); }
      &__log-details { font-size: var(--hp-font-size-sm); color: var(--hp-color-neutral-500); margin-top: var(--hp-spacing-1); }
      &__log-time { font-size: var(--hp-font-size-xs); color: var(--hp-color-neutral-500); white-space: nowrap; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationsSettingsComponent {
  activeTab = 'overview';
  autoPayouts = true;
  paymentReceipts = true;
  autoRetry = true;
  autoSyncInvoices = true;
  autoSyncPayments = true;
  syncFrequency = 'realtime';
  logFilter = '';
  statusFilter = '';

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'stripe', label: 'Stripe', icon: 'credit-card' },
    { id: 'quickbooks', label: 'QuickBooks', icon: 'book' },
    { id: 'logs', label: 'Activity Logs', icon: 'activity' }
  ];

  integrations: Integration[] = [
    { id: '1', name: 'Stripe', description: 'Accept payments and manage subscriptions', icon: 'credit-card', connected: true, category: 'payments', lastSync: '5 minutes ago', status: 'healthy' },
    { id: '2', name: 'QuickBooks', description: 'Sync invoices and expenses with accounting', icon: 'book', connected: true, category: 'accounting', lastSync: '5 minutes ago', status: 'healthy' }
  ];

  recentTransactions: Transaction[] = [
    { id: '1', franchise: 'HandyPro Atlanta', amount: 450.00, status: 'succeeded', date: 'Today 2:30 PM', customer: 'John Smith' },
    { id: '2', franchise: 'HandyPro Denver', amount: 285.00, status: 'succeeded', date: 'Today 1:15 PM', customer: 'Sarah Johnson' },
    { id: '3', franchise: 'HandyPro Seattle', amount: 892.50, status: 'pending', date: 'Today 11:45 AM', customer: 'Mike Chen' },
    { id: '4', franchise: 'HandyPro Chicago', amount: 125.00, status: 'failed', date: 'Today 10:20 AM', customer: 'Emily Brown' },
    { id: '5', franchise: 'HandyPro Phoenix', amount: 567.00, status: 'succeeded', date: 'Yesterday', customer: 'David Lee' }
  ];

  syncLogs: SyncLog[] = [
    { id: '1', integration: 'QuickBooks', action: 'Invoice synced', status: 'success', details: 'Invoice #1245 synced to QuickBooks', timestamp: '2 min ago' },
    { id: '2', integration: 'Stripe', action: 'Payment processed', status: 'success', details: 'Payment of $450.00 received from John Smith', timestamp: '5 min ago' },
    { id: '3', integration: 'QuickBooks', action: 'Expense recorded', status: 'success', details: 'Parts expense of $125.00 logged', timestamp: '15 min ago' },
    { id: '4', integration: 'Stripe', action: 'Payment failed', status: 'error', details: 'Card declined for Emily Brown - insufficient funds', timestamp: '1 hour ago' },
    { id: '5', integration: 'QuickBooks', action: 'Sync warning', status: 'warning', details: 'Customer record mismatch - manual review needed', timestamp: '2 hours ago' },
    { id: '6', integration: 'Stripe', action: 'Payout completed', status: 'success', details: '$12,450.00 transferred to HandyPro Atlanta', timestamp: '3 hours ago' }
  ];

  private icons: Record<string, string> = {
    'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'credit-card': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'book': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'refresh': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'arrow-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'x-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
  };

  constructor(private sanitizer: DomSanitizer) {}

  getSafeIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icons[name] || '');
  }

  get filteredLogs(): SyncLog[] {
    let logs = [...this.syncLogs];
    if (this.logFilter) logs = logs.filter(l => l.integration.toLowerCase() === this.logFilter);
    if (this.statusFilter) logs = logs.filter(l => l.status === this.statusFilter);
    return logs;
  }

  getLogIcon(status: string): string {
    const icons: Record<string, string> = { 'success': 'check-circle', 'warning': 'alert-triangle', 'error': 'x-circle' };
    return icons[status] || 'check-circle';
  }

  connectIntegration(integration: Integration): void { console.log('Connect:', integration.name); }
  configureIntegration(integration: Integration): void { console.log('Configure:', integration.name); }
  syncNow(integration: Integration): void { console.log('Sync:', integration.name); }
  syncQuickBooks(): void { console.log('Sync QuickBooks'); }
}
