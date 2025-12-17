import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-button',
  template: `
    <button
      [type]="type"
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="hp-button__spinner">
        <svg class="hp-button__spinner-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
        </svg>
      </span>
      <ng-container *ngIf="!loading && iconLeft">
        <span class="hp-button__icon hp-button__icon--left">{{ iconLeft }}</span>
      </ng-container>
      <span class="hp-button__content">
        <ng-content></ng-content>
      </span>
      <ng-container *ngIf="iconRight">
        <span class="hp-button__icon hp-button__icon--right">{{ iconRight }}</span>
      </ng-container>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'glass' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      'hp-button',
      `hp-button--${this.variant}`,
      `hp-button--${this.size}`
    ];

    if (this.fullWidth) {
      classes.push('hp-button--full-width');
    }

    if (this.loading) {
      classes.push('hp-button--loading');
    }

    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
