import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-avatar',
  template: `
    <div class="hp-avatar" [class]="avatarClasses">
      <img
        *ngIf="src && !imageError"
        [src]="src"
        [alt]="name || 'Avatar'"
        class="hp-avatar__image"
        (error)="onImageError()"
      />
      <span *ngIf="!src || imageError" class="hp-avatar__initials">
        {{ initials }}
      </span>
    </div>
  `,
  styles: [`
    .hp-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--hp-radius-full);
      background-color: var(--hp-color-primary-100);
      color: var(--hp-color-primary-700);
      font-weight: var(--hp-font-weight-medium);
      overflow: hidden;
      flex-shrink: 0;
      transition: box-shadow 200ms ease-in-out,
                  transform var(--hp-micro-fast) ease-out,
                  background-color 200ms ease-in-out,
                  color 200ms ease-in-out;

      &--xs {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      &--sm {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      &--md {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }

      &--lg {
        width: 48px;
        height: 48px;
        font-size: 16px;
      }

      &--xl {
        width: 64px;
        height: 64px;
        font-size: 20px;
      }

      &--2xl {
        width: 96px;
        height: 96px;
        font-size: 28px;
      }

      &--square {
        border-radius: var(--hp-radius-modern-sm);
      }

      &--glow {
        box-shadow: 0 0 0 3px var(--hp-bg-primary),
                    0 0 0 5px var(--hp-color-primary-300),
                    var(--hp-glow-primary-subtle);
      }

      &--ring {
        box-shadow: 0 0 0 2px var(--hp-bg-primary),
                    0 0 0 4px var(--hp-color-primary);
      }

      &--gradient {
        background: var(--hp-gradient-primary);
        color: white;
      }

      &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &__initials {
        text-transform: uppercase;
        line-height: 1;
        letter-spacing: var(--hp-letter-spacing-wide);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Input() square = false;
  @Input() glow = false;
  @Input() ring = false;
  @Input() gradient = false;

  imageError = false;

  get avatarClasses(): string {
    const classes = ['hp-avatar', `hp-avatar--${this.size}`];
    if (this.square) {
      classes.push('hp-avatar--square');
    }
    if (this.glow) {
      classes.push('hp-avatar--glow');
    }
    if (this.ring) {
      classes.push('hp-avatar--ring');
    }
    if (this.gradient) {
      classes.push('hp-avatar--gradient');
    }
    return classes.join(' ');
  }

  get initials(): string {
    if (!this.name) return '?';
    const names = this.name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0].charAt(0);
    return names[0].charAt(0) + names[names.length - 1].charAt(0);
  }

  onImageError(): void {
    this.imageError = true;
  }
}
