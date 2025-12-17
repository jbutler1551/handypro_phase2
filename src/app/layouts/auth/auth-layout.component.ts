import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-auth-layout',
  template: `
    <div class="hp-auth-layout">
      <!-- Left Panel - Branding -->
      <div class="hp-auth-layout__brand">
        <div class="hp-auth-layout__brand-overlay"></div>
        <div class="hp-auth-layout__brand-content">
          <div class="hp-auth-layout__logo">
            <hp-tenant-logo size="xl"></hp-tenant-logo>
          </div>
          <h1 class="hp-auth-layout__tagline">
            The Complete Platform for<br />
            <span class="hp-auth-layout__highlight">Handyman Businesses</span>
          </h1>
          <p class="hp-auth-layout__description">
            Manage your jobs, teams, and customers all in one place.
            Grow your business with powerful tools designed for service professionals.
          </p>
          <div class="hp-auth-layout__features">
            <div class="hp-auth-layout__feature" style="animation-delay: 0ms">
              <div class="hp-auth-layout__feature-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20,6 9,17 4,12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Easy job scheduling & dispatch</span>
            </div>
            <div class="hp-auth-layout__feature" style="animation-delay: 100ms">
              <div class="hp-auth-layout__feature-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20,6 9,17 4,12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Professional invoicing & payments</span>
            </div>
            <div class="hp-auth-layout__feature" style="animation-delay: 200ms">
              <div class="hp-auth-layout__feature-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20,6 9,17 4,12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Customer management & CRM</span>
            </div>
            <div class="hp-auth-layout__feature" style="animation-delay: 300ms">
              <div class="hp-auth-layout__feature-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20,6 9,17 4,12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Real-time analytics & reporting</span>
            </div>
          </div>
        </div>
        <hp-powered-by variant="light" class="hp-auth-layout__powered-by"></hp-powered-by>
      </div>

      <!-- Right Panel - Form -->
      <div class="hp-auth-layout__form">
        <div class="hp-auth-layout__form-container">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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

    @keyframes shimmer {
      0% {
        background-position: -200% center;
      }
      100% {
        background-position: 200% center;
      }
    }

    .hp-auth-layout {
      display: flex;
      min-height: 100vh;
      transition: background-color 200ms ease-in-out;

      &__brand {
        display: none;
        flex-direction: column;
        justify-content: space-between;
        width: 50%;
        padding: var(--hp-spacing-12);
        background: linear-gradient(
          135deg,
          var(--hp-color-primary) 0%,
          var(--hp-color-primary-600) 50%,
          var(--hp-color-primary-700) 100%
        );
        color: white;
        position: relative;
        overflow: hidden;

        @media (min-width: 1024px) {
          display: flex;
        }
      }

      &__brand-overlay {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
          radial-gradient(ellipse at 40% 60%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
        pointer-events: none;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
      }

      &__brand-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        z-index: 1;
      }

      &__logo {
        margin-bottom: var(--hp-spacing-8);
        animation: fadeInUp 600ms ease-out both;
      }

      &__tagline {
        font-size: var(--hp-font-size-4xl);
        font-weight: var(--hp-font-weight-bold);
        line-height: 1.2;
        margin-bottom: var(--hp-spacing-4);
        letter-spacing: var(--hp-letter-spacing-tight);
        animation: fadeInUp 600ms ease-out 100ms both;
      }

      &__highlight {
        background: linear-gradient(
          90deg,
          var(--hp-color-accent) 0%,
          rgba(255, 255, 255, 0.9) 50%,
          var(--hp-color-accent) 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s linear infinite;
      }

      &__description {
        font-size: var(--hp-font-size-lg);
        opacity: 0.9;
        margin-bottom: var(--hp-spacing-8);
        max-width: 480px;
        line-height: 1.6;
        animation: fadeInUp 600ms ease-out 200ms both;
      }

      &__features {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__feature {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-medium);
        animation: fadeInUp 500ms ease-out both;
        transition: transform var(--hp-micro-normal) ease-out;

        &:hover {
          transform: translateX(4px);
        }
      }

      &__feature-check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--hp-radius-full);
        flex-shrink: 0;
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        @supports (backdrop-filter: blur(1px)) {
          backdrop-filter: blur(var(--hp-blur-xs));
          -webkit-backdrop-filter: blur(var(--hp-blur-xs));
        }

        svg {
          width: 14px;
          height: 14px;
          color: var(--hp-color-accent);
        }
      }

      &__feature:hover &__feature-check {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      &__powered-by {
        padding-top: var(--hp-spacing-8);
        position: relative;
        z-index: 1;
        animation: fadeInUp 600ms ease-out 500ms both;
      }

      &__form {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--hp-spacing-8);
        background-color: var(--hp-bg-secondary);
        background-image: var(--hp-gradient-mesh);
        background-attachment: fixed;
        position: relative;
        transition: background-color 200ms ease-in-out;

        @media (min-width: 1024px) {
          width: 50%;
        }
      }

      &__form-container {
        width: 100%;
        max-width: 400px;
        background-color: var(--hp-surface-card);
        border-radius: var(--hp-radius-modern-lg);
        padding: var(--hp-spacing-8);
        box-shadow: var(--hp-shadow-2xl), var(--hp-glow-primary-subtle);
        animation: scaleIn 400ms var(--hp-ease-out) both;
        transition: background-color 200ms ease-in-out,
                    box-shadow 200ms ease-in-out;

        @supports (backdrop-filter: blur(1px)) {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-lg));
          -webkit-backdrop-filter: blur(var(--hp-blur-lg));
          border: 1px solid var(--hp-glass-border);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {}
