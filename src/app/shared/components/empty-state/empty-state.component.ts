import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-empty-state',
  template: `
    <div class="hp-empty-state" [class]="'hp-empty-state--' + size">
      <div *ngIf="icon" class="hp-empty-state__icon">
        {{ icon }}
      </div>
      <h3 class="hp-empty-state__title">{{ title }}</h3>
      <p *ngIf="description" class="hp-empty-state__description">{{ description }}</p>
      <div *ngIf="hasAction" class="hp-empty-state__actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .hp-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--hp-spacing-8);
      animation: fadeIn 300ms ease-out;

      &--sm {
        padding: var(--hp-spacing-4);

        .hp-empty-state__icon {
          font-size: 32px;
          margin-bottom: var(--hp-spacing-2);
        }

        .hp-empty-state__title {
          font-size: var(--hp-font-size-sm);
        }

        .hp-empty-state__description {
          font-size: var(--hp-font-size-xs);
        }
      }

      &--md {
        .hp-empty-state__icon {
          font-size: 48px;
        }
      }

      &--lg {
        padding: var(--hp-spacing-12);

        .hp-empty-state__icon {
          font-size: 64px;
        }

        .hp-empty-state__title {
          font-size: var(--hp-font-size-xl);
        }
      }

      &__icon {
        color: var(--hp-text-disabled);
        margin-bottom: var(--hp-spacing-4);
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        transition: color 200ms ease-in-out;
      }

      &__title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-2) 0;
        letter-spacing: var(--hp-letter-spacing-tight);
        transition: color 200ms ease-in-out;
      }

      &__description {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        margin: 0 0 var(--hp-spacing-4) 0;
        max-width: 400px;
        line-height: var(--hp-line-height-relaxed);
        transition: color 200ms ease-in-out;
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-3);
        margin-top: var(--hp-spacing-2);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title = 'No data';
  @Input() description?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() hasAction = false;
}
