import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-divider',
  template: `
    <div class="hp-divider" [class]="dividerClasses">
      <span *ngIf="text" class="hp-divider__text">{{ text }}</span>
    </div>
  `,
  styles: [`
    .hp-divider {
      display: flex;
      align-items: center;
      width: 100%;

      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background-color: var(--hp-glass-border);
        transition: background-color 200ms ease-in-out;
      }

      &--vertical {
        flex-direction: column;
        width: auto;
        height: 100%;

        &::before,
        &::after {
          width: 1px;
          height: auto;
          flex: 1;
        }
      }

      &--dashed {
        &::before,
        &::after {
          border-top: 1px dashed var(--hp-border-primary);
          background: none;
          height: 0;
        }
      }

      &--gradient {
        &::before {
          background: linear-gradient(90deg, transparent, var(--hp-glass-border));
        }
        &::after {
          background: linear-gradient(90deg, var(--hp-glass-border), transparent);
        }
      }

      &__text {
        padding: 0 var(--hp-spacing-3);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        white-space: nowrap;
        letter-spacing: var(--hp-letter-spacing-wide);
        transition: color 200ms ease-in-out;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerComponent {
  @Input() text?: string;
  @Input() vertical = false;
  @Input() dashed = false;
  @Input() gradient = false;

  get dividerClasses(): string {
    const classes = ['hp-divider'];
    if (this.vertical) classes.push('hp-divider--vertical');
    if (this.dashed) classes.push('hp-divider--dashed');
    if (this.gradient) classes.push('hp-divider--gradient');
    return classes.join(' ');
  }
}
