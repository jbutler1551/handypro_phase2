import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-admin-system',
  template: `
    <div class="hp-system">
      <div class="hp-system__header">
        <h1 class="hp-system__title">System Settings</h1>
        <p class="hp-system__subtitle">Platform configuration and maintenance</p>
      </div>

      <div class="hp-system__grid">
        <!-- Platform Status -->
        <div class="hp-system__card">
          <h2 class="hp-system__card-title">Platform Status</h2>
          <div class="hp-system__status-list">
            <div class="hp-system__status-item">
              <span class="hp-system__status-dot hp-system__status-dot--success"></span>
              <span class="hp-system__status-label">API</span>
              <span class="hp-system__status-value">Operational</span>
            </div>
            <div class="hp-system__status-item">
              <span class="hp-system__status-dot hp-system__status-dot--success"></span>
              <span class="hp-system__status-label">Database</span>
              <span class="hp-system__status-value">Healthy</span>
            </div>
            <div class="hp-system__status-item">
              <span class="hp-system__status-dot hp-system__status-dot--success"></span>
              <span class="hp-system__status-label">Storage</span>
              <span class="hp-system__status-value">847 GB / 2 TB</span>
            </div>
            <div class="hp-system__status-item">
              <span class="hp-system__status-dot hp-system__status-dot--warning"></span>
              <span class="hp-system__status-label">Background Jobs</span>
              <span class="hp-system__status-value">12 pending</span>
            </div>
          </div>
        </div>

        <!-- Maintenance Mode -->
        <div class="hp-system__card">
          <h2 class="hp-system__card-title">Maintenance Mode</h2>
          <p class="hp-system__card-desc">Enable to restrict access during updates</p>
          <label class="hp-system__toggle">
            <input type="checkbox" [(ngModel)]="maintenanceMode" />
            <span class="hp-system__toggle-slider"></span>
            <span class="hp-system__toggle-label">{{ maintenanceMode ? 'Enabled' : 'Disabled' }}</span>
          </label>
        </div>

        <!-- Email Configuration -->
        <div class="hp-system__card">
          <h2 class="hp-system__card-title">Email Settings</h2>
          <div class="hp-system__config-list">
            <div class="hp-system__config-item">
              <span class="hp-system__config-label">SMTP Host</span>
              <span class="hp-system__config-value">smtp.sendgrid.net</span>
            </div>
            <div class="hp-system__config-item">
              <span class="hp-system__config-label">From Email</span>
              <span class="hp-system__config-value">noreply@truztpro.com</span>
            </div>
            <div class="hp-system__config-item">
              <span class="hp-system__config-label">Status</span>
              <hp-badge variant="success" size="sm">Connected</hp-badge>
            </div>
          </div>
          <hp-button variant="outline" size="sm">Configure</hp-button>
        </div>

        <!-- Cache Management -->
        <div class="hp-system__card">
          <h2 class="hp-system__card-title">Cache Management</h2>
          <div class="hp-system__cache-stats">
            <div class="hp-system__cache-stat">
              <span class="hp-system__cache-value">2.4 GB</span>
              <span class="hp-system__cache-label">Cache Size</span>
            </div>
            <div class="hp-system__cache-stat">
              <span class="hp-system__cache-value">94%</span>
              <span class="hp-system__cache-label">Hit Rate</span>
            </div>
          </div>
          <hp-button variant="outline" size="sm" (click)="clearCache()">Clear Cache</hp-button>
        </div>

        <!-- Security -->
        <div class="hp-system__card hp-system__card--wide">
          <h2 class="hp-system__card-title">Security Settings</h2>
          <div class="hp-system__security-grid">
            <div class="hp-system__security-item">
              <div class="hp-system__security-header">
                <span class="hp-system__security-name">Two-Factor Authentication</span>
                <label class="hp-system__mini-toggle">
                  <input type="checkbox" checked />
                  <span class="hp-system__mini-toggle-slider"></span>
                </label>
              </div>
              <span class="hp-system__security-desc">Require 2FA for all admin users</span>
            </div>
            <div class="hp-system__security-item">
              <div class="hp-system__security-header">
                <span class="hp-system__security-name">Session Timeout</span>
                <select class="hp-system__mini-select">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option selected>4 hours</option>
                  <option>8 hours</option>
                </select>
              </div>
              <span class="hp-system__security-desc">Auto-logout after inactivity</span>
            </div>
            <div class="hp-system__security-item">
              <div class="hp-system__security-header">
                <span class="hp-system__security-name">IP Allowlist</span>
                <label class="hp-system__mini-toggle">
                  <input type="checkbox" />
                  <span class="hp-system__mini-toggle-slider"></span>
                </label>
              </div>
              <span class="hp-system__security-desc">Restrict admin access by IP</span>
            </div>
            <div class="hp-system__security-item">
              <div class="hp-system__security-header">
                <span class="hp-system__security-name">Audit Logging</span>
                <label class="hp-system__mini-toggle">
                  <input type="checkbox" checked />
                  <span class="hp-system__mini-toggle-slider"></span>
                </label>
              </div>
              <span class="hp-system__security-desc">Log all admin actions</span>
            </div>
          </div>
        </div>

        <!-- Backup & Recovery -->
        <div class="hp-system__card">
          <h2 class="hp-system__card-title">Backup & Recovery</h2>
          <div class="hp-system__backup-info">
            <div class="hp-system__backup-stat">
              <span class="hp-system__backup-label">Last Backup</span>
              <span class="hp-system__backup-value">Today, 3:00 AM</span>
            </div>
            <div class="hp-system__backup-stat">
              <span class="hp-system__backup-label">Next Scheduled</span>
              <span class="hp-system__backup-value">Tomorrow, 3:00 AM</span>
            </div>
            <div class="hp-system__backup-stat">
              <span class="hp-system__backup-label">Retention</span>
              <span class="hp-system__backup-value">30 days</span>
            </div>
          </div>
          <div class="hp-system__backup-actions">
            <hp-button variant="outline" size="sm">Backup Now</hp-button>
            <hp-button variant="ghost" size="sm">View History</hp-button>
          </div>
        </div>

        <!-- API Rate Limits -->
        <div class="hp-system__card">
          <h2 class="hp-system__card-title">API Rate Limits</h2>
          <div class="hp-system__rate-limits">
            <div class="hp-system__rate-limit">
              <span class="hp-system__rate-label">Starter</span>
              <input type="number" class="hp-system__rate-input" value="1000" />
              <span class="hp-system__rate-unit">req/min</span>
            </div>
            <div class="hp-system__rate-limit">
              <span class="hp-system__rate-label">Professional</span>
              <input type="number" class="hp-system__rate-input" value="5000" />
              <span class="hp-system__rate-unit">req/min</span>
            </div>
            <div class="hp-system__rate-limit">
              <span class="hp-system__rate-label">Enterprise</span>
              <input type="number" class="hp-system__rate-input" value="20000" />
              <span class="hp-system__rate-unit">req/min</span>
            </div>
          </div>
          <hp-button variant="primary" size="sm">Save Changes</hp-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-system {
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
        padding: var(--hp-spacing-5);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);

        &--wide {
          grid-column: span 2;

          @media (max-width: 767px) {
            grid-column: span 1;
          }
        }
      }

      &__card-title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__card-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__status-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__status-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &--success {
          background-color: #22c55e;
        }

        &--warning {
          background-color: var(--hp-color-warning);
        }

        &--error {
          background-color: var(--hp-color-error);
        }
      }

      &__status-label {
        flex: 1;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__status-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-0);
      }

      &__toggle {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        cursor: pointer;

        input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;

          &:checked + .hp-system__toggle-slider {
            background-color: var(--hp-color-primary);

            &:before {
              transform: translateX(20px);
            }
          }
        }
      }

      &__toggle-slider {
        position: relative;
        width: 44px;
        height: 24px;
        background-color: var(--hp-color-neutral-600);
        border-radius: 24px;
        transition: background-color 0.3s;

        &:before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
      }

      &__toggle-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__config-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-4);
      }

      &__config-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__config-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__config-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-0);
      }

      &__cache-stats {
        display: flex;
        gap: var(--hp-spacing-6);
        margin-bottom: var(--hp-spacing-4);
      }

      &__cache-stat {
        text-align: center;
      }

      &__cache-value {
        display: block;
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__cache-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-400);
      }

      &__security-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);
      }

      &__security-item {
        padding: var(--hp-spacing-3);
        background-color: var(--hp-color-neutral-750);
        border-radius: var(--hp-radius-md);
      }

      &__security-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-1);
      }

      &__security-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
      }

      &__security-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__mini-toggle {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;

        input {
          opacity: 0;
          width: 0;
          height: 0;

          &:checked + .hp-system__mini-toggle-slider {
            background-color: var(--hp-color-primary);

            &:before {
              transform: translateX(14px);
            }
          }
        }
      }

      &__mini-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--hp-color-neutral-600);
        border-radius: 18px;
        transition: 0.3s;

        &:before {
          position: absolute;
          content: "";
          height: 12px;
          width: 12px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
        }
      }

      &__mini-select {
        padding: 4px 8px;
        background-color: var(--hp-color-neutral-700);
        border: 1px solid var(--hp-color-neutral-600);
        border-radius: var(--hp-radius-sm);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-0);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
        }
      }

      &__backup-info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-4);
      }

      &__backup-stat {
        display: flex;
        justify-content: space-between;
      }

      &__backup-label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-400);
      }

      &__backup-value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-0);
      }

      &__backup-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__rate-limits {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
        margin-bottom: var(--hp-spacing-4);
      }

      &__rate-limit {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__rate-label {
        width: 100px;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__rate-input {
        width: 100px;
        padding: var(--hp-spacing-2);
        background-color: var(--hp-color-neutral-750);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-sm);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-0);
        text-align: right;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
        }
      }

      &__rate-unit {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemComponent {
  maintenanceMode = false;

  clearCache(): void {
    console.log('Clear cache');
  }
}
