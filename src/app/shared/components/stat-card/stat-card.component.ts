import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'hp-stat-card',
  template: `
    <div class="hp-stat-card">
      <div class="hp-stat-card__header">
        <span class="hp-stat-card__label">{{ label }}</span>
        <span *ngIf="icon" class="hp-stat-card__icon" [innerHTML]="sanitizedIcon"></span>
      </div>

      <div class="hp-stat-card__value">
        {{ formattedValue }}
      </div>

      <div *ngIf="trend !== undefined" class="hp-stat-card__trend"
           [class.hp-stat-card__trend--positive]="trend > 0"
           [class.hp-stat-card__trend--negative]="trend < 0">
        <span class="hp-stat-card__trend-icon" [innerHTML]="trendIcon"></span>
        <span class="hp-stat-card__trend-value">{{ Math.abs(trend) }}%</span>
        <span *ngIf="trendLabel" class="hp-stat-card__trend-label">{{ trendLabel }}</span>
      </div>

      <a *ngIf="actionLink" [routerLink]="actionLink" class="hp-stat-card__action">
        {{ actionLabel }}
        <span *ngIf="actionCount !== undefined"> ({{ actionCount }})</span>
        <span class="hp-stat-card__action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
      </a>
    </div>
  `,
  styles: [`
    .hp-stat-card {
      background-color: var(--hp-surface-card);
      border-radius: var(--hp-radius-modern-base);
      padding: var(--hp-spacing-5);
      box-shadow: var(--hp-shadow-sm);
      border: 1px solid var(--hp-glass-border);
      transition: background-color 200ms ease-in-out,
                  box-shadow 200ms ease-in-out,
                  border-color 200ms ease-in-out,
                  transform var(--hp-micro-normal) ease-out;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--hp-shadow-lg), var(--hp-glow-primary-subtle);
      }

      &--glass {
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
      }

      @supports (backdrop-filter: blur(1px)) {
        &--glass {
          background: var(--hp-glass-bg-prominent);
          backdrop-filter: blur(var(--hp-blur-md));
          -webkit-backdrop-filter: blur(var(--hp-blur-md));
        }
      }

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--hp-spacing-2);
      }

      &__label {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        font-weight: var(--hp-font-weight-medium);
        letter-spacing: var(--hp-letter-spacing-wide);
        transition: color 200ms ease-in-out;
      }

      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--hp-text-disabled);
        transition: color 200ms ease-in-out;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__value {
        font-size: var(--hp-font-size-3xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        line-height: 1.2;
        margin-bottom: var(--hp-spacing-2);
        letter-spacing: var(--hp-letter-spacing-tight);
        transition: color 200ms ease-in-out;
      }

      &__value--gradient {
        background: var(--hp-gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      &__trend {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);

        &--positive {
          .hp-stat-card__trend-icon,
          .hp-stat-card__trend-value {
            color: var(--hp-color-success);
          }
        }

        &--negative {
          .hp-stat-card__trend-icon,
          .hp-stat-card__trend-value {
            color: var(--hp-color-error);
          }
        }
      }

      &__trend-icon {
        display: flex;
        align-items: center;

        svg {
          width: 14px;
          height: 14px;
        }
      }

      &__trend-value {
        font-weight: var(--hp-font-weight-medium);
      }

      &__trend-label {
        color: var(--hp-text-disabled);
        transition: color 200ms ease-in-out;
      }

      &__action {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        margin-top: var(--hp-spacing-3);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-link);
        text-decoration: none;
        font-weight: var(--hp-font-weight-medium);
        border-radius: var(--hp-radius-sm);
        padding: var(--hp-spacing-1) 0;
        transition: color 200ms ease-in-out;

        &:hover {
          color: var(--hp-text-link-hover);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__action-icon {
        display: flex;
        align-items: center;
        transition: transform var(--hp-micro-normal) ease-out;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &:hover &__action-icon {
        transform: translateX(4px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() format: 'number' | 'currency' | 'percent' = 'number';
  @Input() icon?: string;
  @Input() trend?: number;
  @Input() trendLabel?: string;
  @Input() actionLink?: string;
  @Input() actionLabel?: string;
  @Input() actionCount?: number;

  Math = Math;

  constructor(private sanitizer: DomSanitizer) {}

  get sanitizedIcon(): SafeHtml | null {
    return this.icon ? this.sanitizer.bypassSecurityTrustHtml(this.icon) : null;
  }

  get trendIcon(): SafeHtml {
    let svg: string;
    if (this.trend !== undefined && this.trend > 0) {
      svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    } else if (this.trend !== undefined && this.trend < 0) {
      svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    } else {
      svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    }
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get formattedValue(): string {
    switch (this.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(this.value);
      case 'percent':
        return `${this.value}%`;
      default:
        return new Intl.NumberFormat('en-US').format(this.value);
    }
  }
}
