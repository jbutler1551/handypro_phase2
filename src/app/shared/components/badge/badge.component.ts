import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-badge',
  template: `
    <span class="hp-badge" [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .hp-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--hp-font-family-primary);
      font-weight: var(--hp-font-weight-medium);
      border-radius: var(--hp-radius-full);
      white-space: nowrap;
      letter-spacing: var(--hp-letter-spacing-wide);
      transition: background-color 200ms ease-in-out,
                  color 200ms ease-in-out,
                  box-shadow 200ms ease-in-out,
                  transform var(--hp-micro-fast) ease-out;

      &--sm {
        height: 20px;
        padding: 0 var(--hp-spacing-2);
        font-size: 11px;
      }

      &--md {
        height: 24px;
        padding: 0 var(--hp-spacing-3);
        font-size: var(--hp-font-size-xs);
      }

      &--lg {
        height: 28px;
        padding: 0 var(--hp-spacing-4);
        font-size: var(--hp-font-size-sm);
      }

      &--primary {
        background-color: var(--hp-color-primary-100);
        color: var(--hp-color-primary-700);
      }

      &--secondary {
        background-color: var(--hp-color-secondary-100);
        color: var(--hp-color-secondary-700);
      }

      &--success {
        background-color: var(--hp-color-success-light);
        color: var(--hp-color-success);
      }

      &--warning {
        background-color: var(--hp-color-warning-light);
        color: var(--hp-color-warning);
      }

      &--error {
        background-color: var(--hp-color-error-light);
        color: var(--hp-color-error);
      }

      &--info {
        background-color: var(--hp-color-info-light);
        color: var(--hp-color-info);
      }

      &--neutral {
        background-color: var(--hp-bg-tertiary);
        color: var(--hp-text-secondary);
      }

      &--outline {
        background-color: transparent;
        border: 1px solid currentColor;
      }

      &--glass {
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        color: var(--hp-text-primary);
      }

      @supports (backdrop-filter: blur(1px)) {
        &--glass {
          backdrop-filter: blur(var(--hp-blur-sm));
          -webkit-backdrop-filter: blur(var(--hp-blur-sm));
        }
      }

      &--glow {
        box-shadow: var(--hp-glow-primary-subtle);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'glass' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() outline = false;
  @Input() glow = false;

  get badgeClasses(): string {
    const classes = ['hp-badge', `hp-badge--${this.variant}`, `hp-badge--${this.size}`];
    if (this.outline) {
      classes.push('hp-badge--outline');
    }
    if (this.glow) {
      classes.push('hp-badge--glow');
    }
    return classes.join(' ');
  }
}
