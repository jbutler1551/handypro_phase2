import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-super-admin',
  template: `
    <div class="hp-super-admin">
      <header class="hp-super-admin__header">
        <div class="hp-super-admin__brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-super-admin__logo">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="hp-super-admin__title">HandyPro Admin</span>
        </div>
        <nav class="hp-super-admin__nav">
          <a routerLink="tenants" routerLinkActive="active">Tenants</a>
          <a routerLink="analytics" routerLinkActive="active">Analytics</a>
          <a routerLink="system" routerLinkActive="active">System</a>
        </nav>
        <div class="hp-super-admin__user">
          <span class="hp-super-admin__user-name">Super Admin</span>
          <button class="hp-super-admin__logout" (click)="logout()">
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
        background-color: var(--hp-color-neutral-800);
        border-bottom: 1px solid var(--hp-color-neutral-700);
      }

      &__brand {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__logo {
        width: 28px;
        height: 28px;
        color: var(--hp-color-primary);
      }

      &__title {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-0);
      }

      &__nav {
        display: flex;
        gap: var(--hp-spacing-1);

        a {
          padding: var(--hp-spacing-2) var(--hp-spacing-4);
          border-radius: var(--hp-radius-md);
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-400);
          text-decoration: none;
          transition: color 150ms, background-color 150ms;

          &:hover {
            color: var(--hp-color-neutral-0);
            background-color: var(--hp-color-neutral-700);
          }

          &.active {
            color: var(--hp-color-neutral-0);
            background-color: var(--hp-color-neutral-700);
          }
        }
      }

      &__user {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__user-name {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-300);
      }

      &__logout {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
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

      &__main {
        padding: var(--hp-spacing-6);
        min-height: calc(100vh - 64px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperAdminComponent {
  logout(): void {
    console.log('Logout clicked');
  }
}
