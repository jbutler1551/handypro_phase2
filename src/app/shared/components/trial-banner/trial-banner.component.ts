import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'hp-trial-banner',
  template: `
    <div class="hp-trial-banner" [class.hp-trial-banner--urgent]="daysRemaining <= 3" [class.hp-trial-banner--expired]="daysRemaining <= 0">
      <div class="hp-trial-banner__icon">
        <svg *ngIf="daysRemaining > 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <svg *ngIf="daysRemaining <= 3 && daysRemaining > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <svg *ngIf="daysRemaining <= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <div class="hp-trial-banner__content">
        <ng-container *ngIf="daysRemaining > 0">
          <strong>{{ daysRemaining }} day{{ daysRemaining === 1 ? '' : 's' }} left</strong> in your free trial.
          <span class="hp-trial-banner__cta">Upgrade now to keep access to all features.</span>
        </ng-container>
        <ng-container *ngIf="daysRemaining <= 0">
          <strong>Your trial has ended.</strong>
          <span class="hp-trial-banner__cta">Upgrade to continue using TruztPro.</span>
        </ng-container>
      </div>
      <div class="hp-trial-banner__actions">
        <button class="hp-trial-banner__upgrade-btn" (click)="onUpgrade.emit()">
          <span>Upgrade Now</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
      <button *ngIf="dismissible && daysRemaining > 3" class="hp-trial-banner__dismiss" (click)="onDismiss.emit()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .hp-trial-banner {
      display: flex;
      align-items: center;
      gap: var(--hp-spacing-4);
      padding: var(--hp-spacing-3) var(--hp-spacing-4);
      background: linear-gradient(135deg, rgba(30, 58, 95, 0.9) 0%, rgba(30, 58, 95, 0.8) 100%);
      border-radius: var(--hp-radius-modern-md);
      color: white;
      margin-bottom: var(--hp-spacing-6);

      @supports (backdrop-filter: blur(1px)) {
        backdrop-filter: blur(var(--hp-blur-sm));
        -webkit-backdrop-filter: blur(var(--hp-blur-sm));
      }

      &--urgent {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%);
      }

      &--expired {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%);
      }

      &__icon {
        width: 40px;
        height: 40px;
        border-radius: var(--hp-radius-full);
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__content {
        flex: 1;
        font-size: var(--hp-font-size-sm);

        strong {
          font-weight: var(--hp-font-weight-semibold);
        }
      }

      &__cta {
        opacity: 0.9;
      }

      &__actions {
        flex-shrink: 0;
      }

      &__upgrade-btn {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background: white;
        border: none;
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-primary);
        cursor: pointer;
        transition: all 150ms ease;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          transform: translateX(2px);
          box-shadow: var(--hp-shadow-md);
        }

        .hp-trial-banner--urgent & {
          color: var(--hp-color-warning);
        }

        .hp-trial-banner--expired & {
          color: var(--hp-color-error);
        }
      }

      &__dismiss {
        width: 32px;
        height: 32px;
        padding: 0;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: var(--hp-radius-modern-xs);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background-color 150ms ease;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    @media (max-width: 768px) {
      .hp-trial-banner {
        flex-wrap: wrap;

        &__content {
          flex-basis: calc(100% - 56px);
        }

        &__actions {
          flex-basis: 100%;
          margin-top: var(--hp-spacing-2);
        }

        &__upgrade-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrialBannerComponent {
  @Input() daysRemaining = 14;
  @Input() dismissible = true;
  @Output() onUpgrade = new EventEmitter<void>();
  @Output() onDismiss = new EventEmitter<void>();
}
