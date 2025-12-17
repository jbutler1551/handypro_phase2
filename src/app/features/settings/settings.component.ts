import { Component, ChangeDetectionStrategy } from '@angular/core';

interface SettingsNavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'hp-settings',
  template: `
    <div class="hp-settings">
      <!-- Settings Header -->
      <div class="hp-settings__header">
        <h1 class="hp-settings__title">Settings</h1>
        <p class="hp-settings__subtitle">Manage your account, branding, and team settings.</p>
      </div>

      <div class="hp-settings__content">
        <!-- Settings Navigation -->
        <nav class="hp-settings__nav">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="hp-settings__nav-item--active"
            class="hp-settings__nav-item"
          >
            <span class="hp-settings__nav-icon" [innerHTML]="item.icon"></span>
            <span class="hp-settings__nav-label">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Settings Content -->
        <div class="hp-settings__panel">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hp-settings {
      &__header {
        margin-bottom: var(--hp-spacing-8);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        letter-spacing: var(--hp-letter-spacing-tight);
        margin: 0 0 var(--hp-spacing-2);
        transition: color 200ms ease-in-out;
      }

      &__subtitle {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-tertiary);
        margin: 0;
        transition: color 200ms ease-in-out;
      }

      &__content {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: var(--hp-spacing-8);

        @media (max-width: 991px) {
          grid-template-columns: 1fr;
        }
      }

      &__nav {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
        padding: var(--hp-spacing-4);
        background-color: var(--hp-surface-card);
        border-radius: var(--hp-radius-modern-base);
        border: 1px solid var(--hp-glass-border);
        height: fit-content;
        transition: background-color 200ms ease-in-out,
                    border-color 200ms ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-md));
          -webkit-backdrop-filter: blur(var(--hp-blur-md));
        }

        @media (max-width: 991px) {
          flex-direction: row;
          overflow-x: auto;
          padding: var(--hp-spacing-3);
          border-bottom: 1px solid var(--hp-glass-border);
        }
      }

      &__nav-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        text-decoration: none;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
          transform: translateX(2px);
        }

        &--active {
          background: var(--hp-gradient-primary);
          color: white;
          box-shadow: var(--hp-shadow-primary);

          .hp-settings__nav-icon {
            color: white;
          }

          &:hover {
            transform: translateX(2px);
            box-shadow: var(--hp-shadow-primary), var(--hp-glow-primary-subtle);
          }
        }

        @media (max-width: 991px) {
          white-space: nowrap;
          padding: var(--hp-spacing-2) var(--hp-spacing-3);

          &:hover {
            transform: translateY(-1px);
          }
        }
      }

      &__nav-icon {
        display: flex;
        color: var(--hp-text-muted);
        transition: color 200ms ease-in-out;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__nav-item:hover &__nav-icon {
        color: var(--hp-text-secondary);
      }

      &__panel {
        min-width: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  navItems: SettingsNavItem[] = [
    {
      label: 'Account',
      route: 'account',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    },
    {
      label: 'Branding',
      route: 'branding',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>'
    },
    {
      label: 'Team',
      route: 'team',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    },
    {
      label: 'Notifications',
      route: 'notifications',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'
    },
    {
      label: 'Integrations',
      route: 'integrations',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
    }
  ];
}
