import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'hp-alert',
  template: `
    <div
      class="hp-alert"
      [class]="'hp-alert--' + variant"
      role="alert"
    >
      <span class="hp-alert__icon" [innerHTML]="iconSvg"></span>

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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
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

  constructor(private sanitizer: DomSanitizer) {}

  get iconSvg(): SafeHtml {
    const icons: Record<string, string> = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[this.variant]);
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}
