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
        <hp-tenant-logo size="md"></hp-tenant-logo>
        <span class="hp-mobile-nav__brand">{{ tenantName$ | async }}</span>
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
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
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
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-glass-border);
        transition: border-color 200ms ease-in-out;
      }

      &__brand {
        flex: 1;
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        letter-spacing: var(--hp-letter-spacing-tight);
        transition: color 200ms ease-in-out;
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
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.tenantName$ = this.tenantService.tenant$.pipe(
      map(tenant => tenant?.name || 'HandyPro')
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
