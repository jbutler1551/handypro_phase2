import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-alert',
  template: `
    <div
      class="hp-alert"
      [class]="'hp-alert--' + variant"
      role="alert"
    >
      <span class="hp-alert__icon">{{ iconName }}</span>

      <div class="hp-alert__content">
        <strong *ngIf="title" class="hp-alert__title">{{ title }}</strong>
        <p class="hp-alert__message">
          <ng-content></ng-content>
        </p>
      </div>

      <button
        *ngIf="dismissible"
        class="hp-alert__dismiss"
        (click)="dismiss()"
        aria-label="Dismiss alert"
      >
        <span class="hp-alert__dismiss-icon">×</span>
      </button>
    </div>
  `,
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input() variant: 'success' | 'warning' | 'error' | 'info' = 'info';
  @Input() title?: string;
  @Input() dismissible = false;

  @Output() dismissed = new EventEmitter<void>();

  get iconName(): string {
    const icons: Record<string, string> = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    return icons[this.variant];
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}
