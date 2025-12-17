import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-onboarding-layout',
  template: `
    <div class="hp-onboarding-layout">
      <!-- Header -->
      <header class="hp-onboarding-layout__header">
        <div class="hp-onboarding-layout__header-content">
          <hp-tenant-logo size="md"></hp-tenant-logo>
          <a routerLink="/auth/login" class="hp-onboarding-layout__exit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Exit</span>
          </a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="hp-onboarding-layout__main">
        <div class="hp-onboarding-layout__content">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Footer -->
      <footer class="hp-onboarding-layout__footer">
        <hp-powered-by></hp-powered-by>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hp-onboarding-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--hp-bg-secondary);
      background-image: var(--hp-gradient-mesh);
      background-attachment: fixed;
      transition: background-color 200ms ease-in-out;

      &__header {
        padding: var(--hp-spacing-4) var(--hp-spacing-6);
        background-color: var(--hp-surface-card);
        border-bottom: 1px solid var(--hp-glass-border);
        position: sticky;
        top: 0;
        z-index: var(--hp-z-sticky);
        transition: background-color 200ms ease-in-out,
                    border-color 200ms ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-lg));
          -webkit-backdrop-filter: blur(var(--hp-blur-lg));
        }
      }

      &__header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      &__exit {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        text-decoration: none;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          background-color: var(--hp-glass-bg-subtle);
          color: var(--hp-text-primary);
          transform: scale(1.02);
        }

        &:active {
          transform: scale(0.98);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-8) var(--hp-spacing-6);
        animation: fadeIn 400ms ease-out;

        @media (min-width: 768px) {
          padding: var(--hp-spacing-12) var(--hp-spacing-6);
        }
      }

      &__content {
        width: 100%;
        max-width: 800px;
        background-color: var(--hp-surface-card);
        border-radius: var(--hp-radius-modern-lg);
        padding: var(--hp-spacing-8);
        box-shadow: var(--hp-shadow-xl);
        transition: background-color 200ms ease-in-out,
                    box-shadow 200ms ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-md));
          -webkit-backdrop-filter: blur(var(--hp-blur-md));
          border: 1px solid var(--hp-glass-border);
        }

        @media (min-width: 768px) {
          padding: var(--hp-spacing-10);
        }
      }

      &__footer {
        padding: var(--hp-spacing-6);
        text-align: center;
        animation: fadeIn 400ms ease-out 200ms both;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingLayoutComponent {}
