import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-usage-meter',
  template: `
    <div class="hp-usage-meter" [class.hp-usage-meter--warning]="percentage >= 80 && percentage < 95" [class.hp-usage-meter--critical]="percentage >= 95">
      <div class="hp-usage-meter__header">
        <span class="hp-usage-meter__label">{{ label }}</span>
        <span class="hp-usage-meter__value">
          {{ current | number }} / {{ limit | number }}
          <span *ngIf="unit" class="hp-usage-meter__unit">{{ unit }}</span>
        </span>
      </div>
      <div class="hp-usage-meter__bar">
        <div class="hp-usage-meter__progress" [style.width.%]="percentage">
          <div *ngIf="percentage >= 80" class="hp-usage-meter__pulse"></div>
        </div>
        <div *ngIf="percentage >= 80" class="hp-usage-meter__threshold hp-usage-meter__threshold--80" [style.left.%]="80"></div>
        <div *ngIf="percentage >= 95" class="hp-usage-meter__threshold hp-usage-meter__threshold--95" [style.left.%]="95"></div>
      </div>
      <div *ngIf="percentage >= 80" class="hp-usage-meter__warning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span *ngIf="percentage >= 95">You've reached {{ percentage }}% of your {{ label.toLowerCase() }} limit. Upgrade to increase.</span>
        <span *ngIf="percentage >= 80 && percentage < 95">You're approaching your {{ label.toLowerCase() }} limit ({{ percentage }}%).</span>
      </div>
    </div>
  `,
  styles: [`
    .hp-usage-meter {
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-2);
      }

      &__label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__value {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__unit {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        margin-left: 2px;
      }

      &__bar {
        height: 8px;
        background: var(--hp-glass-bg);
        border-radius: 4px;
        overflow: visible;
        position: relative;
      }

      &__progress {
        height: 100%;
        background: var(--hp-gradient-primary);
        border-radius: 4px;
        transition: width 500ms ease, background 300ms ease;
        position: relative;
        overflow: hidden;

        .hp-usage-meter--warning & {
          background: linear-gradient(90deg, var(--hp-color-warning) 0%, #F59E0B 100%);
        }

        .hp-usage-meter--critical & {
          background: linear-gradient(90deg, var(--hp-color-error) 0%, #EF4444 100%);
        }
      }

      &__pulse {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        animation: pulse-slide 2s infinite;
      }

      &__threshold {
        position: absolute;
        top: -2px;
        bottom: -2px;
        width: 2px;
        border-radius: 1px;

        &--80 {
          background: var(--hp-color-warning);
        }

        &--95 {
          background: var(--hp-color-error);
        }
      }

      &__warning {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        margin-top: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        border-radius: var(--hp-radius-modern-xs);
        font-size: var(--hp-font-size-xs);

        .hp-usage-meter--warning & {
          background: rgba(245, 158, 11, 0.1);
          color: var(--hp-color-warning);
        }

        .hp-usage-meter--critical & {
          background: rgba(239, 68, 68, 0.1);
          color: var(--hp-color-error);
        }

        svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
      }
    }

    @keyframes pulse-slide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageMeterComponent {
  @Input() label = '';
  @Input() current = 0;
  @Input() limit = 100;
  @Input() unit?: string;

  get percentage(): number {
    if (this.limit === 0) return 0;
    return Math.min(Math.round((this.current / this.limit) * 100), 100);
  }
}
