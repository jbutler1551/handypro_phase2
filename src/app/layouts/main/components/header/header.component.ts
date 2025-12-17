import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'hp-header',
  template: `
    <header class="hp-header">
      <!-- Mobile Menu Toggle -->
      <button
        class="hp-header__menu-btn"
        (click)="menuClick.emit()"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Page Title -->
      <h1 class="hp-header__title">{{ pageTitle }}</h1>

      <!-- Right Section -->
      <div class="hp-header__actions">
        <!-- Search -->
        <button class="hp-header__action-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        <!-- Theme Toggle -->
        <button
          class="hp-header__action-btn hp-header__theme-toggle"
          (click)="toggleTheme()"
          [attr.aria-label]="(isDark$ | async) ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <!-- Sun Icon (shown in dark mode) -->
          <svg *ngIf="isDark$ | async" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <!-- Moon Icon (shown in light mode) -->
          <svg *ngIf="!(isDark$ | async)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <!-- Notifications -->
        <button class="hp-header__action-btn hp-header__action-btn--notifications" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span *ngIf="notificationCount > 0" class="hp-header__notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </button>

        <!-- User Menu -->
        <div class="hp-header__user" (click)="toggleUserMenu()">
          <hp-avatar
            *ngIf="currentUser$ | async as user"
            [src]="user.avatar"
            [name]="user.firstName + ' ' + user.lastName"
            size="sm"
          ></hp-avatar>
          <div class="hp-header__user-info">
            <span class="hp-header__user-name">{{ (currentUser$ | async)?.firstName }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- Dropdown Menu -->
          <div class="hp-header__dropdown" *ngIf="userMenuOpen" (clickOutside)="closeUserMenu()">
            <a routerLink="/settings/account" class="hp-header__dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>My Account</span>
            </a>
            <a routerLink="/settings" class="hp-header__dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Settings</span>
            </a>
            <a routerLink="/billing" class="hp-header__dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>Billing</span>
            </a>
            <div class="hp-header__dropdown-divider"></div>
            <button class="hp-header__dropdown-item hp-header__dropdown-item--danger" (click)="logout()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .hp-header {
      display: flex;
      align-items: center;
      gap: var(--hp-spacing-4);
      height: 64px;
      padding: 0 var(--hp-spacing-6);
      background-color: var(--hp-surface-card);
      border-bottom: 1px solid var(--hp-glass-border);
      transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out;

      @supports (backdrop-filter: blur(1px)) {
        background: var(--hp-glass-bg-prominent);
        backdrop-filter: blur(var(--hp-blur-md));
        -webkit-backdrop-filter: blur(var(--hp-blur-md));
      }

      &__menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        @media (min-width: 1024px) {
          display: none;
        }

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
        }

        &:active {
          transform: scale(var(--hp-scale-press));
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }

      &__title {
        flex: 1;
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0;
        letter-spacing: var(--hp-letter-spacing-tight);
        transition: color 200ms ease-in-out;
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
      }

      &__action-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
        }

        &:active {
          transform: scale(var(--hp-scale-press));
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }

        svg {
          width: 20px;
          height: 20px;
        }

        &--notifications {
          .hp-header__notification-badge {
            position: absolute;
            top: 4px;
            right: 4px;
          }
        }
      }

      &__theme-toggle {
        svg {
          transition: transform 200ms ease-in-out;
        }

        &:hover svg {
          transform: rotate(15deg);
        }
      }

      &__notification-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 var(--hp-spacing-1);
        background: linear-gradient(135deg, var(--hp-color-error), var(--hp-color-error-dark));
        border-radius: 9px;
        font-size: 10px;
        font-weight: var(--hp-font-weight-semibold);
        color: white;
        box-shadow: var(--hp-glow-error);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }

      &__user {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2);
        margin-left: var(--hp-spacing-2);
        border-radius: var(--hp-radius-modern-xs);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out;

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
        }
      }

      &__user-info {
        display: none;
        align-items: center;
        gap: var(--hp-spacing-1);

        @media (min-width: 768px) {
          display: flex;
        }

        svg {
          width: 16px;
          height: 16px;
          color: var(--hp-text-tertiary);
          transition: transform var(--hp-micro-normal) ease-out;
        }
      }

      &__user:hover &__user-info svg {
        transform: translateY(2px);
      }

      &__user-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        transition: color 200ms ease-in-out;
      }

      &__dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        min-width: 200px;
        margin-top: var(--hp-spacing-2);
        padding: var(--hp-spacing-2);
        background-color: var(--hp-surface-dropdown);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        box-shadow: var(--hp-shadow-2xl), var(--hp-glow-primary-subtle);
        z-index: var(--hp-z-dropdown);
        animation: scaleIn var(--hp-transition-fast) var(--hp-ease-out);
        transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-lg));
          -webkit-backdrop-filter: blur(var(--hp-blur-lg));
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      &__dropdown-item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        width: 100%;
        padding: var(--hp-spacing-3);
        background: none;
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        text-decoration: none;
        font-size: var(--hp-font-size-sm);
        cursor: pointer;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
          transform: translateX(2px);
        }

        svg {
          width: 16px;
          height: 16px;
          color: var(--hp-text-tertiary);
          transition: color 200ms ease-in-out;
        }

        &:hover svg {
          color: var(--hp-text-secondary);
        }

        &--danger {
          color: var(--hp-color-error);

          svg {
            color: var(--hp-color-error);
          }

          &:hover {
            background-color: rgba(239, 68, 68, 0.1);
          }
        }
      }

      &__dropdown-divider {
        height: 1px;
        margin: var(--hp-spacing-2) 0;
        background-color: var(--hp-glass-border);
        transition: background-color 200ms ease-in-out;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Input() notificationCount = 0;
  @Output() menuClick = new EventEmitter<void>();

  currentUser$: Observable<User | null>;
  isDark$: Observable<boolean>;
  userMenuOpen = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isDark$ = this.themeService.isDark$;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
