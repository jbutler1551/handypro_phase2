import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-powered-by',
  template: `
    <div class="hp-powered-by" [class]="containerClasses">
      <span class="hp-powered-by__text">Powered by</span>
      <a
        [href]="link"
        target="_blank"
        rel="noopener noreferrer"
        class="hp-powered-by__brand"
      >
        <svg
          *ngIf="showIcon"
          class="hp-powered-by__icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="hp-powered-by__name">{{ brandName }}</span>
      </a>
    </div>
  `,
  styles: [`
    .hp-powered-by {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--hp-spacing-1);
      font-size: var(--hp-font-size-xs);
      color: var(--hp-text-disabled);
      letter-spacing: var(--hp-letter-spacing-wide);
      transition: color 200ms ease-in-out;

      &--light {
        color: rgba(255, 255, 255, 0.5);

        .hp-powered-by__brand {
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            color: white;
          }
        }
      }

      &--dark {
        color: var(--hp-text-tertiary);

        .hp-powered-by__brand {
          color: var(--hp-text-secondary);

          &:hover {
            color: var(--hp-text-primary);
          }
        }
      }

      &__text {
        opacity: 0.8;
      }

      &__brand {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        color: var(--hp-text-tertiary);
        text-decoration: none;
        font-weight: var(--hp-font-weight-medium);
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        margin: calc(var(--hp-spacing-1) * -1) calc(var(--hp-spacing-2) * -1);
        border-radius: var(--hp-radius-modern-xs);
        transition: color var(--hp-micro-normal) ease-in-out,
                    background-color var(--hp-micro-normal) ease-in-out;

        &:hover {
          color: var(--hp-color-primary);
          background-color: var(--hp-glass-bg-subtle);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__icon {
        width: 14px;
        height: 14px;
        transition: transform var(--hp-micro-normal) ease-out;
      }

      &__brand:hover &__icon {
        transform: rotate(15deg);
      }

      &__name {
        font-weight: var(--hp-font-weight-semibold);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoweredByComponent {
  @Input() brandName = 'TruztPro';
  @Input() link = 'https://truztpro.com';
  @Input() showIcon = true;
  @Input() variant: 'light' | 'dark' | 'default' = 'default';

  get containerClasses(): string {
    return this.variant !== 'default' ? `hp-powered-by--${this.variant}` : '';
  }
}
