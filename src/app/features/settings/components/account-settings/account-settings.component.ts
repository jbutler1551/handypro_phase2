import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  ip: string;
  device: string;
  timestamp: string;
  type: 'security' | 'profile' | 'billing' | 'api';
}

@Component({
  selector: 'hp-account-settings',
  template: `
    <div class="hp-account-settings">
      <!-- Tabs Navigation -->
      <div class="hp-account-settings__tabs">
        <button
          *ngFor="let tab of tabs"
          [class.active]="activeTab === tab.id"
          (click)="activeTab = tab.id"
        >
          <span [innerHTML]="getSafeIcon(tab.icon)"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Profile Tab -->
      <div *ngIf="activeTab === 'profile'" class="hp-account-settings__content">
        <hp-card class="hp-account-settings__section">
          <h2 class="hp-account-settings__section-title">Profile Information</h2>
          <p class="hp-account-settings__section-description">
            Update your personal information and profile photo.
          </p>

          <div class="hp-account-settings__avatar">
            <div class="hp-account-settings__avatar-preview">
              <img *ngIf="avatarUrl" [src]="avatarUrl" alt="Profile photo" />
              <span *ngIf="!avatarUrl" class="hp-account-settings__avatar-initials">JD</span>
            </div>
            <div class="hp-account-settings__avatar-actions">
              <hp-button variant="outline" size="sm" (click)="uploadAvatar()">
                Change Photo
              </hp-button>
              <hp-button *ngIf="avatarUrl" variant="ghost" size="sm" (click)="removeAvatar()">
                Remove
              </hp-button>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="hp-account-settings__form">
            <div class="hp-account-settings__form-row">
              <hp-input label="First Name" formControlName="firstName" [error]="getError('firstName')"></hp-input>
              <hp-input label="Last Name" formControlName="lastName" [error]="getError('lastName')"></hp-input>
            </div>
            <hp-input label="Email Address" type="email" formControlName="email" [error]="getError('email')"></hp-input>
            <hp-input label="Phone Number" type="tel" formControlName="phone" [error]="getError('phone')"></hp-input>
            <hp-input label="Job Title" formControlName="jobTitle" placeholder="e.g., Owner, Manager"></hp-input>
            <div class="hp-account-settings__form-actions">
              <hp-button type="submit" variant="primary" [disabled]="profileForm.invalid || profileForm.pristine" [loading]="isSavingProfile">
                Save Changes
              </hp-button>
            </div>
          </form>
        </hp-card>

        <hp-card class="hp-account-settings__section">
          <h2 class="hp-account-settings__section-title">Change Password</h2>
          <p class="hp-account-settings__section-description">Update your password to keep your account secure.</p>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="hp-account-settings__form">
            <hp-input label="Current Password" type="password" formControlName="currentPassword" [error]="getPasswordError('currentPassword')"></hp-input>
            <hp-input label="New Password" type="password" formControlName="newPassword" [error]="getPasswordError('newPassword')"></hp-input>
            <hp-input label="Confirm New Password" type="password" formControlName="confirmPassword" [error]="getPasswordError('confirmPassword')"></hp-input>
            <div class="hp-account-settings__password-requirements">
              <span class="hp-account-settings__requirements-title">Password must contain:</span>
              <ul class="hp-account-settings__requirements-list">
                <li [class.met]="hasMinLength">At least 8 characters</li>
                <li [class.met]="hasUppercase">One uppercase letter</li>
                <li [class.met]="hasLowercase">One lowercase letter</li>
                <li [class.met]="hasNumber">One number</li>
              </ul>
            </div>
            <div class="hp-account-settings__form-actions">
              <hp-button type="submit" variant="primary" [disabled]="passwordForm.invalid" [loading]="isChangingPassword">Update Password</hp-button>
            </div>
          </form>
        </hp-card>
      </div>

      <!-- Security Tab -->
      <div *ngIf="activeTab === 'security'" class="hp-account-settings__content">
        <hp-card class="hp-account-settings__section">
          <h2 class="hp-account-settings__section-title">Two-Factor Authentication</h2>
          <p class="hp-account-settings__section-description">Add an extra layer of security to your account.</p>
          <div class="hp-account-settings__2fa">
            <div class="hp-account-settings__2fa-status" [class.enabled]="twoFactorEnabled">
              <div class="hp-account-settings__2fa-icon">
                <span [innerHTML]="getSafeIcon(twoFactorEnabled ? 'shield-check' : 'shield')"></span>
              </div>
              <div class="hp-account-settings__2fa-info">
                <div class="hp-account-settings__2fa-title">
                  {{ twoFactorEnabled ? '2FA Enabled' : '2FA Not Enabled' }}
                </div>
                <div class="hp-account-settings__2fa-desc">
                  {{ twoFactorEnabled ? 'Your account is protected with two-factor authentication.' : 'Enable 2FA to add an extra layer of security.' }}
                </div>
              </div>
              <hp-button *ngIf="!twoFactorEnabled" variant="primary" (click)="enable2FA()">Enable 2FA</hp-button>
              <hp-button *ngIf="twoFactorEnabled" variant="outline" (click)="disable2FA()">Disable</hp-button>
            </div>
          </div>
        </hp-card>

        <hp-card class="hp-account-settings__section">
          <h2 class="hp-account-settings__section-title">Login Alerts</h2>
          <p class="hp-account-settings__section-description">Get notified of suspicious login attempts.</p>
          <div class="hp-account-settings__toggles">
            <div class="hp-account-settings__toggle-item">
              <div class="hp-account-settings__toggle-info">
                <div class="hp-account-settings__toggle-label">Email Alerts</div>
                <div class="hp-account-settings__toggle-desc">Receive email when login from new device</div>
              </div>
              <label class="hp-account-settings__switch">
                <input type="checkbox" [(ngModel)]="emailAlerts">
                <span class="hp-account-settings__switch-slider"></span>
              </label>
            </div>
            <div class="hp-account-settings__toggle-item">
              <div class="hp-account-settings__toggle-info">
                <div class="hp-account-settings__toggle-label">SMS Alerts</div>
                <div class="hp-account-settings__toggle-desc">Receive SMS for critical security events</div>
              </div>
              <label class="hp-account-settings__switch">
                <input type="checkbox" [(ngModel)]="smsAlerts">
                <span class="hp-account-settings__switch-slider"></span>
              </label>
            </div>
            <div class="hp-account-settings__toggle-item">
              <div class="hp-account-settings__toggle-info">
                <div class="hp-account-settings__toggle-label">Block Suspicious Logins</div>
                <div class="hp-account-settings__toggle-desc">Automatically block logins from unusual locations</div>
              </div>
              <label class="hp-account-settings__switch">
                <input type="checkbox" [(ngModel)]="blockSuspicious">
                <span class="hp-account-settings__switch-slider"></span>
              </label>
            </div>
          </div>
        </hp-card>

        <hp-card class="hp-account-settings__section hp-account-settings__section--danger">
          <h2 class="hp-account-settings__section-title">Delete Account</h2>
          <p class="hp-account-settings__section-description">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <hp-button variant="danger" (click)="deleteAccount()">Delete My Account</hp-button>
        </hp-card>
      </div>

      <!-- Sessions Tab -->
      <div *ngIf="activeTab === 'sessions'" class="hp-account-settings__content">
        <hp-card class="hp-account-settings__section">
          <div class="hp-account-settings__section-header">
            <div>
              <h2 class="hp-account-settings__section-title">Active Sessions</h2>
              <p class="hp-account-settings__section-description">Manage devices where you're currently logged in.</p>
            </div>
            <hp-button variant="outline" size="sm" (click)="revokeAllSessions()">Sign Out All Other</hp-button>
          </div>
          <div class="hp-account-settings__sessions">
            <div *ngFor="let session of sessions" class="hp-account-settings__session" [class.current]="session.isCurrent">
              <div class="hp-account-settings__session-icon">
                <span [innerHTML]="getSafeIcon(getDeviceIcon(session.device))"></span>
              </div>
              <div class="hp-account-settings__session-info">
                <div class="hp-account-settings__session-device">
                  {{ session.device }} - {{ session.browser }}
                  <span *ngIf="session.isCurrent" class="hp-account-settings__session-current">Current</span>
                </div>
                <div class="hp-account-settings__session-details">
                  <span>{{ session.location }}</span>
                  <span class="hp-account-settings__session-dot"></span>
                  <span>{{ session.ip }}</span>
                  <span class="hp-account-settings__session-dot"></span>
                  <span>{{ session.lastActive }}</span>
                </div>
              </div>
              <button *ngIf="!session.isCurrent" class="hp-account-settings__session-revoke" (click)="revokeSession(session)">
                <span [innerHTML]="getSafeIcon('x')"></span>
              </button>
            </div>
          </div>
        </hp-card>
      </div>

      <!-- API Keys Tab -->
      <div *ngIf="activeTab === 'api'" class="hp-account-settings__content">
        <hp-card class="hp-account-settings__section">
          <div class="hp-account-settings__section-header">
            <div>
              <h2 class="hp-account-settings__section-title">API Keys</h2>
              <p class="hp-account-settings__section-description">Manage API keys for programmatic access.</p>
            </div>
            <hp-button variant="primary" size="sm" (click)="createApiKey()">
              <span [innerHTML]="getSafeIcon('plus')"></span>
              Create Key
            </hp-button>
          </div>
          <div class="hp-account-settings__api-keys">
            <div *ngFor="let key of apiKeys" class="hp-account-settings__api-key">
              <div class="hp-account-settings__api-key-info">
                <div class="hp-account-settings__api-key-name">{{ key.name }}</div>
                <div class="hp-account-settings__api-key-value">
                  <code>{{ key.key }}</code>
                  <button class="hp-account-settings__copy-btn" (click)="copyApiKey(key)">
                    <span [innerHTML]="getSafeIcon('copy')"></span>
                  </button>
                </div>
                <div class="hp-account-settings__api-key-meta">
                  Created {{ key.created }} · Last used {{ key.lastUsed }}
                </div>
              </div>
              <div class="hp-account-settings__api-key-perms">
                <span *ngFor="let perm of key.permissions" class="hp-account-settings__api-key-perm">{{ perm }}</span>
              </div>
              <button class="hp-account-settings__api-key-delete" (click)="deleteApiKey(key)">
                <span [innerHTML]="getSafeIcon('trash')"></span>
              </button>
            </div>
            <div *ngIf="apiKeys.length === 0" class="hp-account-settings__empty">
              <span [innerHTML]="getSafeIcon('key')"></span>
              <p>No API keys yet. Create one to get started.</p>
            </div>
          </div>
        </hp-card>
      </div>

      <!-- Activity Tab -->
      <div *ngIf="activeTab === 'activity'" class="hp-account-settings__content">
        <hp-card class="hp-account-settings__section">
          <div class="hp-account-settings__section-header">
            <div>
              <h2 class="hp-account-settings__section-title">Activity Log</h2>
              <p class="hp-account-settings__section-description">Review recent account activity and security events.</p>
            </div>
            <div class="hp-account-settings__activity-filters">
              <select [(ngModel)]="activityFilter" class="hp-account-settings__filter-select">
                <option value="">All Activity</option>
                <option value="security">Security</option>
                <option value="profile">Profile</option>
                <option value="billing">Billing</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>
          <div class="hp-account-settings__activity-list">
            <div *ngFor="let item of filteredActivity" class="hp-account-settings__activity-item">
              <div class="hp-account-settings__activity-icon" [class]="'hp-account-settings__activity-icon--' + item.type">
                <span [innerHTML]="getSafeIcon(getActivityIcon(item.type))"></span>
              </div>
              <div class="hp-account-settings__activity-content">
                <div class="hp-account-settings__activity-action">{{ item.action }}</div>
                <div class="hp-account-settings__activity-details">{{ item.details }}</div>
                <div class="hp-account-settings__activity-meta">
                  <span>{{ item.ip }}</span>
                  <span class="hp-account-settings__activity-dot"></span>
                  <span>{{ item.device }}</span>
                  <span class="hp-account-settings__activity-dot"></span>
                  <span>{{ item.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-account-settings {
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
          transition: all 150ms;

          &:hover { color: var(--hp-color-neutral-900); }
          &.active {
            color: var(--hp-color-primary);
            border-bottom-color: var(--hp-color-primary);
          }
          :host ::ng-deep svg { width: 18px; height: 18px; }
        }
      }

      &__section {
        &-title {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
          margin: 0 0 var(--hp-spacing-1);
        }
        &-description {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
          margin: 0 0 var(--hp-spacing-6);
        }
        &-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--hp-spacing-4);
          flex-wrap: wrap;
          gap: var(--hp-spacing-3);
          .hp-account-settings__section-title { margin-bottom: var(--hp-spacing-1); }
          .hp-account-settings__section-description { margin-bottom: 0; }
        }
        &--danger {
          border-color: var(--hp-color-error-200);
          .hp-account-settings__section-title { color: var(--hp-color-error); }
        }
      }

      &__content {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-6);
      }

      &__avatar {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);
        &-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: var(--hp-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          img { width: 100%; height: 100%; object-fit: cover; }
        }
        &-initials {
          font-size: var(--hp-font-size-2xl);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-0);
        }
        &-actions {
          display: flex;
          flex-direction: column;
          gap: var(--hp-spacing-2);
        }
      }

      &__form {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
        &-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--hp-spacing-4);
          @media (max-width: 575px) { grid-template-columns: 1fr; }
        }
        &-actions {
          padding-top: var(--hp-spacing-4);
        }
      }

      &__password-requirements {
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);
      }

      &__requirements-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
        display: block;
        margin-bottom: var(--hp-spacing-2);
      }

      &__requirements-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-2);
        @media (max-width: 575px) { grid-template-columns: 1fr; }
        li {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
          &::before {
            content: '';
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: var(--hp-color-neutral-200);
            flex-shrink: 0;
          }
          &.met {
            color: var(--hp-color-success);
            &::before {
              background-color: var(--hp-color-success);
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
              background-size: 10px;
              background-repeat: no-repeat;
              background-position: center;
            }
          }
        }
      }

      &__2fa {
        &-status {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-4);
          padding: var(--hp-spacing-4);
          background: var(--hp-color-neutral-50);
          border-radius: var(--hp-radius-lg);
          border: 1px solid var(--hp-color-neutral-200);
          &.enabled {
            background: rgba(16, 185, 129, 0.05);
            border-color: rgba(16, 185, 129, 0.2);
          }
        }
        &-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--hp-color-neutral-200);
          display: flex;
          align-items: center;
          justify-content: center;
          .enabled & { background: rgba(16, 185, 129, 0.15); color: #10b981; }
          :host ::ng-deep svg { width: 24px; height: 24px; }
        }
        &-info { flex: 1; }
        &-title {
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
        }
        &-desc {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
        }
      }

      &__toggles {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__toggle-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4);
        background: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);
      }

      &__toggle-label {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__toggle-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
      }

      &__switch {
        position: relative;
        width: 48px;
        height: 28px;
        input {
          opacity: 0;
          width: 0;
          height: 0;
          &:checked + .hp-account-settings__switch-slider {
            background: var(--hp-color-primary);
            &::before { transform: translateX(20px); }
          }
        }
        &-slider {
          position: absolute;
          inset: 0;
          background: var(--hp-color-neutral-300);
          border-radius: 14px;
          cursor: pointer;
          transition: all 200ms;
          &::before {
            content: '';
            position: absolute;
            width: 22px;
            height: 22px;
            left: 3px;
            top: 3px;
            background: white;
            border-radius: 50%;
            transition: transform 200ms;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          }
        }
      }

      &__sessions {
        display: flex;
        flex-direction: column;
      }

      &__session {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-color-neutral-100);
        &:last-child { border-bottom: none; }
        &.current { background: rgba(27, 58, 100, 0.02); }
        &-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--hp-radius-md);
          background: var(--hp-color-neutral-100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--hp-color-neutral-600);
          :host ::ng-deep svg { width: 20px; height: 20px; }
        }
        &-info { flex: 1; }
        &-device {
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-900);
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
        }
        &-current {
          padding: 2px 8px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-radius: var(--hp-radius-full);
          font-size: var(--hp-font-size-xs);
          font-weight: var(--hp-font-weight-medium);
        }
        &-details {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
        }
        &-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--hp-color-neutral-300);
        }
        &-revoke {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: var(--hp-color-neutral-400);
          cursor: pointer;
          border-radius: var(--hp-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover { background: var(--hp-color-neutral-100); color: var(--hp-color-error); }
          :host ::ng-deep svg { width: 18px; height: 18px; }
        }
      }

      &__api-keys {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__api-key {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4);
        background: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);
        &-info { flex: 1; }
        &-name {
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
          margin-bottom: var(--hp-spacing-2);
        }
        &-value {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          margin-bottom: var(--hp-spacing-2);
          code {
            font-family: monospace;
            font-size: var(--hp-font-size-sm);
            color: var(--hp-color-neutral-600);
            background: var(--hp-color-neutral-0);
            padding: var(--hp-spacing-1) var(--hp-spacing-2);
            border-radius: var(--hp-radius-sm);
            border: 1px solid var(--hp-color-neutral-200);
          }
        }
        &-meta {
          font-size: var(--hp-font-size-xs);
          color: var(--hp-color-neutral-500);
        }
        &-perms {
          display: flex;
          gap: var(--hp-spacing-1);
          flex-wrap: wrap;
        }
        &-perm {
          padding: 2px 8px;
          background: var(--hp-color-neutral-200);
          color: var(--hp-color-neutral-700);
          border-radius: var(--hp-radius-full);
          font-size: var(--hp-font-size-xs);
        }
        &-delete {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: var(--hp-color-neutral-400);
          cursor: pointer;
          border-radius: var(--hp-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover { background: var(--hp-color-neutral-100); color: var(--hp-color-error); }
          :host ::ng-deep svg { width: 16px; height: 16px; }
        }
      }

      &__copy-btn {
        width: 28px;
        height: 28px;
        border: none;
        background: var(--hp-color-neutral-0);
        border: 1px solid var(--hp-color-neutral-200);
        color: var(--hp-color-neutral-500);
        cursor: pointer;
        border-radius: var(--hp-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover { background: var(--hp-color-neutral-100); color: var(--hp-color-neutral-700); }
        :host ::ng-deep svg { width: 14px; height: 14px; }
      }

      &__empty {
        text-align: center;
        padding: var(--hp-spacing-8);
        color: var(--hp-color-neutral-400);
        :host ::ng-deep svg { width: 48px; height: 48px; margin-bottom: var(--hp-spacing-3); }
        p { margin: 0; font-size: var(--hp-font-size-sm); }
      }

      &__activity-filters {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__filter-select {
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

      &__activity-list {
        display: flex;
        flex-direction: column;
      }

      &__activity-item {
        display: flex;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-color-neutral-100);
        &:last-child { border-bottom: none; }
      }

      &__activity-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        :host ::ng-deep svg { width: 18px; height: 18px; }
        &--security { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        &--profile { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        &--billing { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        &--api { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
      }

      &__activity-content { flex: 1; }

      &__activity-action {
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__activity-details {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        margin: var(--hp-spacing-1) 0;
      }

      &__activity-meta {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__activity-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--hp-color-neutral-300);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSettingsComponent {
  activeTab = 'profile';
  profileForm: FormGroup;
  passwordForm: FormGroup;
  avatarUrl: string | null = null;
  isSavingProfile = false;
  isChangingPassword = false;
  twoFactorEnabled = false;
  emailAlerts = true;
  smsAlerts = false;
  blockSuspicious = true;
  activityFilter = '';

  tabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'sessions', label: 'Sessions', icon: 'monitor' },
    { id: 'api', label: 'API Keys', icon: 'key' },
    { id: 'activity', label: 'Activity', icon: 'activity' }
  ];

  sessions: Session[] = [
    { id: '1', device: 'MacBook Pro', browser: 'Chrome 120', location: 'Atlanta, GA', ip: '192.168.1.1', lastActive: 'Now', isCurrent: true },
    { id: '2', device: 'iPhone 15', browser: 'Safari', location: 'Atlanta, GA', ip: '192.168.1.2', lastActive: '2 hours ago', isCurrent: false },
    { id: '3', device: 'Windows PC', browser: 'Firefox 121', location: 'New York, NY', ip: '10.0.0.5', lastActive: 'Yesterday', isCurrent: false }
  ];

  apiKeys: ApiKey[] = [
    { id: '1', name: 'Production API', key: 'hp_live_sk_...4x7n', created: 'Jan 5, 2024', lastUsed: '2 hours ago', permissions: ['read', 'write'] },
    { id: '2', name: 'Testing Key', key: 'hp_test_sk_...9k2m', created: 'Dec 20, 2023', lastUsed: 'Never', permissions: ['read'] }
  ];

  activityLog: ActivityItem[] = [
    { id: '1', action: 'Successful Login', details: 'Logged in from Chrome on MacBook Pro', ip: '192.168.1.1', device: 'Chrome 120', timestamp: '5 minutes ago', type: 'security' },
    { id: '2', action: 'Profile Updated', details: 'Changed phone number', ip: '192.168.1.1', device: 'Chrome 120', timestamp: '1 hour ago', type: 'profile' },
    { id: '3', action: 'API Key Created', details: 'Created new API key: Production API', ip: '192.168.1.1', device: 'Chrome 120', timestamp: 'Yesterday', type: 'api' },
    { id: '4', action: 'Password Changed', details: 'Password was successfully changed', ip: '192.168.1.1', device: 'Chrome 120', timestamp: '2 days ago', type: 'security' },
    { id: '5', action: 'Payment Method Added', details: 'Added Visa ending in 4242', ip: '192.168.1.1', device: 'Safari', timestamp: '3 days ago', type: 'billing' },
    { id: '6', action: 'Failed Login Attempt', details: 'Failed login from unknown location', ip: '45.33.32.156', device: 'Unknown', timestamp: 'Last week', type: 'security' }
  ];

  private icons: Record<string, string> = {
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'shield-check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    'monitor': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    'key': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'smartphone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    'laptop': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0l1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>',
    'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'copy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    'trash': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    'lock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    'credit-card': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'code': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
  };

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.profileForm = this.fb.group({
      firstName: ['John', [Validators.required]],
      lastName: ['Doe', [Validators.required]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['(555) 123-4567', [Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      jobTitle: ['Owner']
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  getSafeIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icons[name] || '');
  }

  get filteredActivity(): ActivityItem[] {
    if (!this.activityFilter) return this.activityLog;
    return this.activityLog.filter(a => a.type === this.activityFilter);
  }

  get hasMinLength(): boolean { return (this.passwordForm.get('newPassword')?.value || '').length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.passwordForm.get('newPassword')?.value || ''); }
  get hasLowercase(): boolean { return /[a-z]/.test(this.passwordForm.get('newPassword')?.value || ''); }
  get hasNumber(): boolean { return /\d/.test(this.passwordForm.get('newPassword')?.value || ''); }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  getError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }

  getPasswordError(field: string): string {
    const control = this.passwordForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength']) return 'Password must be at least 8 characters';
    }
    if (field === 'confirmPassword' && this.passwordForm.errors?.['mismatch'] && control?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  getDeviceIcon(device: string): string {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) return 'smartphone';
    return 'laptop';
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = { 'security': 'lock', 'profile': 'user', 'billing': 'credit-card', 'api': 'code' };
    return icons[type] || 'activity';
  }

  uploadAvatar(): void { console.log('Upload avatar'); }
  removeAvatar(): void { this.avatarUrl = null; }
  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSavingProfile = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.isSavingProfile = false; this.profileForm.markAsPristine(); this.cdr.markForCheck(); }, 1000);
    }
  }
  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.isChangingPassword = false; this.passwordForm.reset(); this.cdr.markForCheck(); }, 1000);
    }
  }
  enable2FA(): void { this.twoFactorEnabled = true; }
  disable2FA(): void { this.twoFactorEnabled = false; }
  deleteAccount(): void { console.log('Delete account'); }
  revokeSession(session: Session): void { this.sessions = this.sessions.filter(s => s.id !== session.id); }
  revokeAllSessions(): void { this.sessions = this.sessions.filter(s => s.isCurrent); }
  createApiKey(): void { console.log('Create API key'); }
  copyApiKey(key: ApiKey): void { console.log('Copy key:', key.key); }
  deleteApiKey(key: ApiKey): void { this.apiKeys = this.apiKeys.filter(k => k.id !== key.id); }
}
