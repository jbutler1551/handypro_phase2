import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'hp-main-layout',
  template: `
    <div class="hp-main-layout" [class.hp-main-layout--sidebar-collapsed]="sidebarCollapsed">
      <!-- Sidebar (Desktop) -->
      <hp-sidebar
        class="hp-main-layout__sidebar"
        [collapsed]="sidebarCollapsed"
        (collapsedChange)="sidebarCollapsed = $event"
      ></hp-sidebar>

      <!-- Mobile Navigation -->
      <hp-mobile-nav
        [isOpen]="mobileNavOpen"
        (isOpenChange)="mobileNavOpen = $event"
      ></hp-mobile-nav>

      <!-- Main Content Area -->
      <div class="hp-main-layout__content">
        <!-- Header -->
        <hp-header
          [pageTitle]="(pageTitle$ | async) || 'Account Settings'"
          [notificationCount]="3"
          (menuClick)="openMobileNav()"
        ></hp-header>

        <!-- Page Content -->
        <main class="hp-main-layout__main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .hp-main-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--hp-bg-secondary);
      background-image: var(--hp-gradient-mesh);
      background-attachment: fixed;
      transition: background-color 200ms ease-in-out;

      &__sidebar {
        display: none;

        @media (min-width: 1024px) {
          display: flex;
        }
      }

      &__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        position: relative;
        z-index: 1;
      }

      &__main {
        flex: 1;
        padding: var(--hp-spacing-6);
        overflow-y: auto;

        @media (min-width: 768px) {
          padding: var(--hp-spacing-8);
        }
      }

      &--sidebar-collapsed {
        .hp-main-layout__sidebar {
          width: 72px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  sidebarCollapsed = false;
  mobileNavOpen = false;
  pageTitle$: Observable<string>;

  private routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/settings': 'Settings',
    '/settings/account': 'Account Settings',
    '/settings/branding': 'Branding',
    '/settings/franchises': 'Franchises',
    '/settings/notifications': 'Notifications',
    '/settings/integrations': 'Integrations',
    '/billing': 'Billing',
    '/compliance': 'Compliance',
    '/documents': 'Documents',
    '/reports': 'Reports'
  };

  constructor(private router: Router) {
    this.pageTitle$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const url = this.router.url.split('?')[0];
        return this.routeTitles[url] || this.getPageTitleFromUrl(url);
      })
    );
  }

  openMobileNav(): void {
    this.mobileNavOpen = true;
  }

  private getPageTitleFromUrl(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) return 'Account Settings';
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
