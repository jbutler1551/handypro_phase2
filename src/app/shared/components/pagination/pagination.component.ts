import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'hp-pagination',
  template: `
    <div class="hp-pagination" *ngIf="totalPages > 1">
      <button
        class="hp-pagination__btn hp-pagination__btn--prev"
        [disabled]="currentPage === 1"
        (click)="goToPage(currentPage - 1)"
        aria-label="Previous page"
      >
        ←
      </button>

      <div class="hp-pagination__pages">
        <button
          *ngFor="let page of visiblePages"
          class="hp-pagination__page"
          [class.hp-pagination__page--active]="page === currentPage"
          [class.hp-pagination__page--ellipsis]="page === '...'"
          [disabled]="page === '...'"
          (click)="page !== '...' && goToPage(+page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="hp-pagination__btn hp-pagination__btn--next"
        [disabled]="currentPage === totalPages"
        (click)="goToPage(currentPage + 1)"
        aria-label="Next page"
      >
        →
      </button>

      <span *ngIf="showInfo" class="hp-pagination__info">
        Showing {{ startItem }}-{{ endItem }} of {{ total }}
      </span>
    </div>
  `,
  styles: [`
    .hp-pagination {
      display: flex;
      align-items: center;
      gap: var(--hp-spacing-2);
      font-size: var(--hp-font-size-sm);

      &__btn,
      &__page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
        padding: 0 var(--hp-spacing-2);
        background-color: var(--hp-bg-primary);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        cursor: pointer;
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        transition: background-color var(--hp-micro-normal) ease-in-out,
                    border-color var(--hp-micro-normal) ease-in-out,
                    color var(--hp-micro-normal) ease-in-out,
                    box-shadow var(--hp-micro-normal) ease-in-out,
                    transform var(--hp-micro-fast) ease-out;

        &:hover:not(:disabled) {
          background-color: var(--hp-glass-bg-subtle);
          border-color: var(--hp-border-secondary);
          color: var(--hp-text-primary);
          transform: translateY(-1px);
        }

        &:active:not(:disabled) {
          transform: scale(var(--hp-scale-press));
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__pages {
        display: flex;
        gap: var(--hp-spacing-1);
      }

      &__page {
        &--active {
          background: var(--hp-gradient-primary);
          border-color: var(--hp-color-primary);
          color: white;
          box-shadow: var(--hp-shadow-primary);

          &:hover:not(:disabled) {
            filter: brightness(1.05);
            transform: translateY(-1px);
            box-shadow: var(--hp-shadow-primary), var(--hp-glow-primary-subtle);
          }
        }

        &--ellipsis {
          border: none;
          background: none;
          cursor: default;
          color: var(--hp-text-tertiary);

          &:hover {
            background: none;
            transform: none;
          }
        }
      }

      &__info {
        margin-left: var(--hp-spacing-4);
        color: var(--hp-text-tertiary);
        transition: color 200ms ease-in-out;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent implements OnChanges {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() maxVisiblePages = 5;
  @Input() showInfo = true;

  @Output() pageChange = new EventEmitter<number>();

  visiblePages: (number | string)[] = [];

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.total);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['total'] || changes['pageSize']) {
      this.calculateVisiblePages();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  private calculateVisiblePages(): void {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.maxVisiblePages;

    if (total <= max) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(max / 2);
      let start = current - half;
      let end = current + half;

      if (start < 1) {
        start = 1;
        end = max;
      }

      if (end > total) {
        end = total;
        start = total - max + 1;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      if (end < total) {
        if (end < total - 1) pages.push('...');
        pages.push(total);
      }
    }

    this.visiblePages = pages;
  }
}
