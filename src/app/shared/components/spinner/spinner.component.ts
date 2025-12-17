import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-spinner',
  template: `
    <div class="hp-spinner" [class]="spinnerClasses" role="status">
      <svg class="hp-spinner__svg" viewBox="0 0 24 24">
        <circle
          class="hp-spinner__circle"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          fill="none"
          stroke-dasharray="32"
          stroke-linecap="round"
        />
      </svg>
      <span class="hp-sr-only">Loading...</span>
    </div>
  `,
  styles: [`
    .hp-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--hp-color-primary);
      transition: color 200ms ease-in-out,
                  filter 200ms ease-in-out;

      &--sm {
        width: 16px;
        height: 16px;
      }

      &--md {
        width: 24px;
        height: 24px;
      }

      &--lg {
        width: 32px;
        height: 32px;
      }

      &--xl {
        width: 48px;
        height: 48px;
      }

      &--glow {
        filter: drop-shadow(0 0 6px currentColor);
      }

      &--white {
        color: white;
      }

      &__svg {
        width: 100%;
        height: 100%;
        animation: spin 1s linear infinite;
      }

      &__circle {
        transform-origin: center;
      }
    }

    .hp-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() glow = false;
  @Input() white = false;

  get spinnerClasses(): string {
    const classes = ['hp-spinner', `hp-spinner--${this.size}`];
    if (this.glow) {
      classes.push('hp-spinner--glow');
    }
    if (this.white) {
      classes.push('hp-spinner--white');
    }
    return classes.join(' ');
  }
}
