import { Component, Input, Output, EventEmitter, ContentChild, ChangeDetectionStrategy, TemplateRef } from '@angular/core';

@Component({
  selector: 'hp-card',
  template: `
    <div
      class="hp-card"
      [class.hp-card--elevated]="variant === 'elevated'"
      [class.hp-card--bordered]="variant === 'bordered'"
      [class.hp-card--glass]="variant === 'glass'"
      [class.hp-card--floating]="variant === 'floating'"
      [class.hp-card--glow]="variant === 'glow'"
      [class.hp-card--interactive]="variant === 'interactive' || clickable"
      [class.hp-card--no-padding]="noPadding"
      [class.hp-card--compact]="compact"
      (click)="handleClick($event)"
      (keydown.enter)="handleKeydown($event)"
      [attr.role]="clickable ? 'button' : null"
      [attr.tabindex]="clickable ? 0 : null"
    >
      <div *ngIf="headerTemplate" class="hp-card__header">
        <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
      </div>

      <div class="hp-card__body">
        <ng-content></ng-content>
      </div>

      <div *ngIf="footerTemplate" class="hp-card__footer">
        <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() variant: 'default' | 'elevated' | 'bordered' | 'interactive' | 'glass' | 'floating' | 'glow' = 'default';
  @Input() clickable = false;
  @Input() noPadding = false;
  @Input() compact = false;

  @Output() cardClick = new EventEmitter<MouseEvent | KeyboardEvent>();

  @ContentChild('cardHeader') headerTemplate?: TemplateRef<unknown>;
  @ContentChild('cardFooter') footerTemplate?: TemplateRef<unknown>;

  handleClick(event: MouseEvent): void {
    if (this.clickable || this.variant === 'interactive') {
      this.cardClick.emit(event);
    }
  }

  handleKeydown(event: Event): void {
    if (this.clickable || this.variant === 'interactive') {
      this.cardClick.emit(event as KeyboardEvent);
    }
  }
}
