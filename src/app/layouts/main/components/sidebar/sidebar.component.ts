import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TenantService } from '@core/services/tenant.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavItem[];
}

@Component({
  selector: 'hp-sidebar',
  template: `
    <aside class="hp-sidebar" [class.hp-sidebar--collapsed]="collapsed">
      <!-- Logo -->
      <div class="hp-sidebar__logo">
        <hp-tenant-logo [size]="collapsed ? 'sm' : 'md'"></hp-tenant-logo>
        <span *ngIf="!collapsed" class="hp-sidebar__brand-name">{{ tenantName$ | async }}</span>
      </div>

      <!-- Navigation -->
      <nav class="hp-sidebar__nav">
        <ul class="hp-sidebar__list">
          <li *ngFor="let item of navItems" class="hp-sidebar__item">
            <a
              [routerLink]="item.route"
              routerLinkActive="hp-sidebar__link--active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="hp-sidebar__link"
              [attr.title]="collapsed ? item.label : null"
            >
              <span class="hp-sidebar__icon" [innerHTML]="item.icon"></span>
              <span *ngIf="!collapsed" class="hp-sidebar__label">{{ item.label }}</span>
              <hp-badge *ngIf="item.badge && !collapsed" variant="error" size="sm">
                {{ item.badge }}
              </hp-badge>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Bottom Section -->
      <div class="hp-sidebar__bottom">
        <button
          class="hp-sidebar__collapse-btn"
          (click)="toggleCollapse()"
          [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline *ngIf="collapsed" points="9 18 15 12 9 6"></polyline>
            <polyline *ngIf="!collapsed" points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <hp-powered-by *ngIf="!collapsed"></hp-powered-by>
      </div>
    </aside>
  `,
  styles: [`
    .hp-sidebar {
      display: flex;
      flex-direction: column;
      width: 260px;
      height: 100vh;
      background-color: var(--hp-surface-card);
      border-right: 1px solid var(--hp-glass-border);
      transition: width 200ms ease-in-out,
                  background-color 200ms ease-in-out,
                  border-color 200ms ease-in-out;

      @supports (backdrop-filter: blur(1px)) {
        background: var(--hp-glass-bg-prominent);
        backdrop-filter: blur(var(--hp-blur-lg));
        -webkit-backdrop-filter: blur(var(--hp-blur-lg));
      }

      &--collapsed {
        width: 72px;

        .hp-sidebar__logo {
          justify-content: center;
          padding: var(--hp-spacing-4);
        }

        .hp-sidebar__link {
          justify-content: center;
          padding: var(--hp-spacing-3);
        }

        .hp-sidebar__bottom {
          padding: var(--hp-spacing-4);
        }
      }

      &__logo {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-5) var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-glass-border);
        transition: border-color 200ms ease-in-out;
      }

      &__brand-name {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: var(--hp-letter-spacing-tight);
        transition: color 200ms ease-in-out;
      }

      &__nav {
        flex: 1;
        overflow-y: auto;
        padding: var(--hp-spacing-4) var(--hp-spacing-2);
      }

      &__list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      &__item {
        margin-bottom: var(--hp-spacing-1);
      }

      &__link {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        border-radius: var(--hp-radius-modern-sm);
        color: var(--hp-text-secondary);
        text-decoration: none;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
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

          .hp-sidebar__icon {
            color: white;
          }

          &:hover {
            filter: brightness(1.05);
            box-shadow: var(--hp-shadow-primary), var(--hp-glow-primary-subtle);
          }
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        transition: color 200ms ease-in-out;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      &__label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4) var(--hp-spacing-4) var(--hp-spacing-6);
        border-top: 1px solid var(--hp-glass-border);
        transition: border-color 200ms ease-in-out;
      }

      &__collapse-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background-color: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          background-color: var(--hp-glass-bg);
          color: var(--hp-text-primary);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  tenantName$: Observable<string>;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
      route: '/dashboard'
    },
    {
      label: 'Jobs',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      route: '/jobs'
    },
    {
      label: 'Customers',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      route: '/customers'
    },
    {
      label: 'Schedule',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      route: '/schedule'
    },
    {
      label: 'Invoices',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      route: '/invoices'
    },
    {
      label: 'Team',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      route: '/team'
    },
    {
      label: 'Reports',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      route: '/reports'
    },
    {
      label: 'Settings',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
      route: '/settings'
    }
  ];

  constructor(
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router
  ) {
    this.tenantName$ = this.tenantService.tenant$.pipe(
      map(tenant => tenant?.name || 'HandyPro')
    );
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
