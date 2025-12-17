import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-skeleton',
  template: `
    <div
      class="hp-skeleton"
      [class]="skeletonClasses"
      [style]="customStyle"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading content"
    ></div>
  `,
  styles: [`
    .hp-skeleton {
      background: linear-gradient(
        90deg,
        var(--hp-bg-tertiary) 25%,
        var(--hp-glass-bg-subtle) 50%,
        var(--hp-bg-tertiary) 75%
      );
      background-size: 400% 100%;
      animation: shimmer 2s ease-in-out infinite;
      border-radius: var(--hp-radius-modern-xs);
      transition: background 200ms ease-in-out;

      &--text {
        height: 16px;
        width: 100%;
      }

      &--heading {
        height: 24px;
        width: 60%;
      }

      &--avatar {
        border-radius: var(--hp-radius-full);

        &.hp-skeleton--sm {
          width: 32px;
          height: 32px;
        }

        &.hp-skeleton--md {
          width: 40px;
          height: 40px;
        }

        &.hp-skeleton--lg {
          width: 48px;
          height: 48px;
        }
      }

      &--button {
        height: 42px;
        width: 120px;
        border-radius: var(--hp-radius-modern-sm);
      }

      &--card {
        height: 200px;
        width: 100%;
        border-radius: var(--hp-radius-modern-base);
      }

      &--image {
        aspect-ratio: 16/9;
        width: 100%;
        border-radius: var(--hp-radius-modern-sm);
      }

      &--circle {
        border-radius: var(--hp-radius-full);
      }

      &--pulse {
        animation: shimmer 2s ease-in-out infinite, pulse 2s ease-in-out infinite;
      }
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'heading' | 'avatar' | 'button' | 'card' | 'image' | 'custom' = 'text';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() width?: string;
  @Input() height?: string;
  @Input() circle = false;
  @Input() pulse = false;

  get skeletonClasses(): string {
    const classes = ['hp-skeleton'];
    if (this.variant !== 'custom') {
      classes.push(`hp-skeleton--${this.variant}`);
    }
    classes.push(`hp-skeleton--${this.size}`);
    if (this.circle) {
      classes.push('hp-skeleton--circle');
    }
    if (this.pulse) {
      classes.push('hp-skeleton--pulse');
    }
    return classes.join(' ');
  }

  get customStyle(): Record<string, string> {
    const style: Record<string, string> = {};
    if (this.width) style['width'] = this.width;
    if (this.height) style['height'] = this.height;
    return style;
  }
}
