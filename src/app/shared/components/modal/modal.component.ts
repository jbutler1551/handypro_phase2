import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

let nextId = 0;

@Component({
  selector: 'hp-modal',
  template: `
    <div
      *ngIf="isOpen"
      class="hp-modal-backdrop"
      (click)="onBackdropClick($event)"
      [@fadeAnimation]
    >
      <div
        class="hp-modal"
        [class]="'hp-modal--' + size"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        [@slideAnimation]
        (click)="$event.stopPropagation()"
      >
        <header class="hp-modal__header">
          <h2 [id]="titleId" class="hp-modal__title">{{ title }}</h2>
          <button
            *ngIf="showCloseButton"
            class="hp-modal__close"
            (click)="close()"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div class="hp-modal__body">
          <ng-content></ng-content>
        </div>

        <footer *ngIf="showFooter" class="hp-modal__footer">
          <ng-content select="[modal-footer]"></ng-content>
        </footer>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px) scale(0.98)' }))
      ])
    ])
  ]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() showCloseButton = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() showFooter = true;

  @Output() closed = new EventEmitter<void>();

  titleId = `hp-modal-title-${nextId++}`;
  private originalOverflow = '';

  ngOnInit(): void {
    if (this.isOpen) {
      this.lockBodyScroll();
    }
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  close(): void {
    this.unlockBodyScroll();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  private lockBodyScroll(): void {
    this.originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = this.originalOverflow;
  }
}
