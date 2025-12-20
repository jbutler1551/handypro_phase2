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
}

@Component({
  selector: 'hp-mobile-nav',
  template: `
    <!-- Overlay -->
    <div
      class="hp-mobile-nav__overlay"
      [class.hp-mobile-nav__overlay--visible]="isOpen"
      (click)="close()"
    ></div>

    <!-- Drawer -->
    <div class="hp-mobile-nav" [class.hp-mobile-nav--open]="isOpen">
      <!-- Header -->
      <div class="hp-mobile-nav__header">
        <div class="hp-mobile-nav__branding">
          <span class="hp-mobile-nav__truztpro">TruztPro</span>
          <div *ngIf="(tenantName$ | async) as tenantName" class="hp-mobile-nav__tenant">
            <hp-tenant-logo size="sm"></hp-tenant-logo>
            <span class="hp-mobile-nav__tenant-name">{{ tenantName }}</span>
          </div>
        </div>
        <button class="hp-mobile-nav__close" (click)="close()" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="hp-mobile-nav__content">
        <ul class="hp-mobile-nav__list">
          <li *ngFor="let item of navItems" class="hp-mobile-nav__item">
            <a
              [routerLink]="item.route"
              routerLinkActive="hp-mobile-nav__link--active"
              [routerLinkActiveOptions]="{ exact: item.route === '/settings/account' }"
              class="hp-mobile-nav__link"
              (click)="close()"
            >
              <span class="hp-mobile-nav__icon" [innerHTML]="sanitizeHtml(item.icon)"></span>
              <span class="hp-mobile-nav__label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="hp-mobile-nav__footer">
        <button class="hp-mobile-nav__logout" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
        <hp-powered-by></hp-powered-by>
      </div>
    </div>
  `,
  styles: [`
    .hp-mobile-nav__overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4);
      opacity: 0;
      visibility: hidden;
      transition: opacity 200ms ease-in-out, visibility 200ms ease-in-out;
      z-index: var(--hp-z-modal-backdrop);

      @supports (backdrop-filter: blur(1px)) {
        backdrop-filter: blur(var(--hp-blur-xs));
        -webkit-backdrop-filter: blur(var(--hp-blur-xs));
      }

      &--visible {
        opacity: 1;
        visibility: visible;
      }
    }

    .hp-mobile-nav {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      width: 280px;
      background-color: var(--hp-surface-card);
      box-shadow: var(--hp-shadow-2xl), var(--hp-glow-primary-subtle);
      transform: translateX(-100%);
      transition: transform 250ms var(--hp-ease-out);
      z-index: var(--hp-z-modal);

      @supports (backdrop-filter: blur(1px)) {
        background: var(--hp-glass-bg-prominent);
        backdrop-filter: blur(var(--hp-blur-lg));
        -webkit-backdrop-filter: blur(var(--hp-blur-lg));
      }

      &--open {
        transform: translateX(0);
      }

      &__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-glass-border);
        transition: border-color 200ms ease-in-out;
      }

      &__branding {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
        flex: 1;
      }

      &__truztpro {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-primary);
        letter-spacing: var(--hp-letter-spacing-tight);
      }

      &__tenant {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-xs);
        border: 1px solid var(--hp-glass-border);
      }

      &__tenant-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
      }

      &__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__content {
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
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-medium);
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
          transform: translateX(4px);
        }

        &--active {
          background: var(--hp-gradient-primary);
          color: white;
          box-shadow: var(--hp-shadow-primary);

          .hp-mobile-nav__icon {
            color: white;
          }

          &:hover {
            filter: brightness(1.05);
            box-shadow: var(--hp-shadow-primary), var(--hp-glow-primary-subtle);
          }
        }
      }

      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        transition: color 200ms ease-in-out;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      &__footer {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-glass-border);
        transition: border-color 200ms ease-in-out;
      }

      &__logout {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        width: 100%;
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        background: none;
        border: none;
        border-radius: var(--hp-radius-modern-sm);
        color: var(--hp-color-error);
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-medium);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        &:hover {
          background-color: rgba(239, 68, 68, 0.1);
          transform: translateX(4px);
        }

        &:active {
          transform: scale(var(--hp-scale-press));
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileNavComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  tenantName$: Observable<string>;

  navItems: NavItem[] = [
    {
      label: 'Account',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
      route: '/settings/account'
    },
    {
      label: 'Branding',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
      route: '/settings/branding'
    },
    {
      label: 'Franchises',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      route: '/settings/franchises'
    },
    {
      label: 'Notifications',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
      route: '/settings/notifications'
    },
    {
      label: 'Integrations',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      route: '/settings/integrations'
    },
    {
      label: 'Billing',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
      route: '/billing'
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

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  logout(): void {
    this.authService.logout();
    this.close();
    this.router.navigate(['/auth/login']);
  }
}
