import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hp-super-admin',
  template: `
    <div class="hp-super-admin">
      <header class="hp-super-admin__header">
        <div class="hp-super-admin__brand">
          <div class="hp-super-admin__logo-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-super-admin__logo">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div class="hp-super-admin__brand-text">
            <span class="hp-super-admin__title">TruztPro</span>
            <span class="hp-super-admin__subtitle">Super Admin</span>
          </div>
        </div>
        <nav class="hp-super-admin__nav">
          <a routerLink="dashboard" routerLinkActive="active" class="hp-super-admin__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="tenants" routerLinkActive="active" class="hp-super-admin__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Tenants</span>
          </a>
          <a routerLink="analytics" routerLinkActive="active" class="hp-super-admin__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Analytics</span>
          </a>
          <a routerLink="feature-flags" routerLinkActive="active" class="hp-super-admin__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <span>Feature Flags</span>
          </a>
          <a routerLink="impersonation" routerLinkActive="active" class="hp-super-admin__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Impersonation</span>
          </a>
          <a routerLink="system" routerLinkActive="active" class="hp-super-admin__nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>System</span>
          </a>
        </nav>
        <div class="hp-super-admin__user">
          <div class="hp-super-admin__notifications">
            <button class="hp-super-admin__icon-btn" (click)="toggleNotifications()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="hp-super-admin__notification-badge">3</span>
            </button>
          </div>
          <div class="hp-super-admin__user-info">
            <div class="hp-super-admin__user-avatar">SA</div>
            <div class="hp-super-admin__user-details">
              <span class="hp-super-admin__user-name">Super Admin</span>
              <span class="hp-super-admin__user-role">Platform Owner</span>
            </div>
          </div>
          <button class="hp-super-admin__icon-btn" (click)="logout()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <main class="hp-super-admin__main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .hp-super-admin {
      min-height: 100vh;
      background-color: var(--hp-color-neutral-900);

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--hp-spacing-6);
        height: 64px;
        background: linear-gradient(135deg, var(--hp-color-neutral-800) 0%, var(--hp-color-neutral-850) 100%);
        border-bottom: 1px solid var(--hp-color-neutral-700);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      &__brand {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__logo-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-lg);
      }

      &__logo {
        width: 24px;
        height: 24px;
        color: white;
      }

      &__brand-text {
        display: flex;
        flex-direction: column;
      }

      &__title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
        line-height: 1.2;
      }

      &__subtitle {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__nav {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__nav-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-400);
        text-decoration: none;
        transition: color 150ms, background-color 150ms;

        svg {
          width: 18px;
          height: 18px;
        }

        &:hover {
          color: var(--hp-color-neutral-0);
          background-color: var(--hp-color-neutral-700);
        }

        &.active {
          color: var(--hp-color-neutral-0);
          background-color: var(--hp-color-primary);
        }
      }

      &__user {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__notifications {
        position: relative;
      }

      &__notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        background-color: var(--hp-color-error);
        border-radius: var(--hp-radius-full);
        font-size: 10px;
        font-weight: var(--hp-font-weight-bold);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-400);
        cursor: pointer;
        transition: color 150ms, background-color 150ms;

        &:hover {
          color: var(--hp-color-neutral-0);
          background-color: var(--hp-color-neutral-700);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__user-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background-color: var(--hp-color-neutral-800);
        border: 1px solid var(--hp-color-neutral-700);
        border-radius: var(--hp-radius-lg);
      }

      &__user-avatar {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, var(--hp-color-primary) 0%, var(--hp-color-primary-700) 100%);
        border-radius: var(--hp-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-bold);
        color: white;
      }

      &__user-details {
        display: flex;
        flex-direction: column;
      }

      &__user-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-0);
        line-height: 1.2;
      }

      &__user-role {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__main {
        padding: var(--hp-spacing-6);
        min-height: calc(100vh - 64px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminComponent {
  constructor(private router: Router) {}

  toggleNotifications(): void {
    console.log('Toggle notifications');
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
