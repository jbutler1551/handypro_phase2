import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { BreadcrumbItem } from '@core/models';

@Component({
  selector: 'hp-breadcrumbs',
  template: `
    <nav aria-label="Breadcrumb" class="hp-breadcrumbs">
      <ol class="hp-breadcrumbs__list">
        <li *ngFor="let item of items; let last = last" class="hp-breadcrumbs__item">
          <a
            *ngIf="!last && item.route"
            [routerLink]="item.route"
            class="hp-breadcrumbs__link"
          >
            {{ item.label }}
          </a>
          <span
            *ngIf="last || !item.route"
            class="hp-breadcrumbs__current"
            [attr.aria-current]="last ? 'page' : null"
          >
            {{ item.label }}
          </span>
          <span *ngIf="!last" class="hp-breadcrumbs__separator" aria-hidden="true">
            /
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .hp-breadcrumbs {
      &__list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--hp-spacing-1);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      &__item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-1);
      }

      &__link {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-tertiary);
        text-decoration: none;
        padding: var(--hp-spacing-1) var(--hp-spacing-2);
        margin: calc(var(--hp-spacing-1) * -1) calc(var(--hp-spacing-2) * -1);
        border-radius: var(--hp-radius-modern-xs);
        transition: color var(--hp-micro-normal) ease-in-out,
                    background-color var(--hp-micro-normal) ease-in-out,
                    box-shadow var(--hp-micro-normal) ease-in-out;

        &:hover {
          color: var(--hp-color-primary);
          background-color: var(--hp-glass-bg-subtle);
        }

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--hp-bg-primary),
                      0 0 0 4px var(--hp-color-primary),
                      var(--hp-glow-primary-subtle);
        }
      }

      &__current {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
        font-weight: var(--hp-font-weight-medium);
        transition: color 200ms ease-in-out;
      }

      &__separator {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-disabled);
        margin: 0 var(--hp-spacing-1);
        transition: color 200ms ease-in-out;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {
  @Input() items: BreadcrumbItem[] = [];
}
