import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
      <!-- Logo - TruztPro + Company Logo -->
      <div class="hp-sidebar__logo">
        <div class="hp-sidebar__logo-stack">
          <img
            *ngIf="!collapsed"
            src="assets/images/truztpro-wide-logo.png"
            alt="TruztPro"
            class="hp-sidebar__truztpro-logo hp-sidebar__truztpro-logo--wide"
          />
          <img
            *ngIf="collapsed"
            src="assets/images/truztpro-square-logo.jpeg"
            alt="TruztPro"
            class="hp-sidebar__truztpro-logo hp-sidebar__truztpro-logo--square"
          />
          <div *ngIf="!collapsed && (tenantName$ | async) as tenantName" class="hp-sidebar__tenant-info">
            <hp-tenant-logo size="sm"></hp-tenant-logo>
            <span class="hp-sidebar__tenant-name">{{ tenantName }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="hp-sidebar__nav">
        <ul class="hp-sidebar__list">
          <li *ngFor="let item of navItems" class="hp-sidebar__item">
            <a
              [routerLink]="item.route"
              routerLinkActive="hp-sidebar__link--active"
              [routerLinkActiveOptions]="{ exact: item.route === '/settings/account' }"
              class="hp-sidebar__link"
              [attr.title]="collapsed ? item.label : null"
            >
              <span class="hp-sidebar__icon" [innerHTML]="sanitizeHtml(item.icon)"></span>
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

      &__logo-stack {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__truztpro-logo {
        display: block;
        object-fit: contain;

        &--wide {
          max-width: 180px;
          height: auto;
        }

        &--square {
          width: 40px;
          height: 40px;
          border-radius: var(--hp-radius-modern-xs);
        }
      }

      &__tenant-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-xs);
        border: 1px solid var(--hp-glass-border);
      }

      &__tenant-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
      label: 'Team',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      route: '/settings/team'
    },
    {
      label: 'Locations',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
      route: '/settings/locations'
    },
    {
      label: 'Billing',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
      route: '/billing'
    },
    {
      label: 'Integrations',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      route: '/settings/integrations'
    },
    {
      label: 'Settings',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
      route: '/settings/account'
    },
    {
      label: 'Super Admin',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      route: '/admin'
    }
  ];

  constructor(
    private tenantService: TenantService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.tenantName$ = this.tenantService.tenant$.pipe(
      map(tenant => tenant?.name || '')
    );
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
