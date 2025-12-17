import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TenantService } from '@core/services/tenant.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'hp-tenant-logo',
  template: `
    <div class="hp-tenant-logo" [class]="logoClasses">
      <img
        *ngIf="logoUrl$ | async as logoUrl; else fallback"
        [src]="logoUrl"
        [alt]="(tenantName$ | async) + ' logo'"
        class="hp-tenant-logo__image"
        (error)="onImageError($event)"
      />
      <ng-template #fallback>
        <div class="hp-tenant-logo__fallback">
          <span class="hp-tenant-logo__initials">{{ initials$ | async }}</span>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .hp-tenant-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--hp-micro-fast) ease-out,
                  filter var(--hp-micro-normal) ease-in-out;

      &:hover {
        transform: scale(1.02);
      }

      &--sm {
        width: 32px;
        height: 32px;

        .hp-tenant-logo__fallback {
          font-size: var(--hp-font-size-xs);
        }
      }

      &--md {
        width: 48px;
        height: 48px;

        .hp-tenant-logo__fallback {
          font-size: var(--hp-font-size-sm);
        }
      }

      &--lg {
        width: 64px;
        height: 64px;

        .hp-tenant-logo__fallback {
          font-size: var(--hp-font-size-base);
        }
      }

      &--xl {
        width: 96px;
        height: 96px;

        .hp-tenant-logo__fallback {
          font-size: var(--hp-font-size-lg);
        }
      }

      &__image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        transition: filter 200ms ease-in-out;
      }

      &:hover &__image {
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
      }

      &__fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--hp-gradient-primary);
        border-radius: var(--hp-radius-modern-sm);
        color: white;
        font-weight: var(--hp-font-weight-semibold);
        box-shadow: var(--hp-shadow-primary);
        transition: box-shadow 200ms ease-in-out;
      }

      &:hover &__fallback {
        box-shadow: var(--hp-shadow-primary), var(--hp-glow-primary-subtle);
      }

      &__initials {
        text-transform: uppercase;
        letter-spacing: var(--hp-letter-spacing-wide);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() overrideUrl?: string;

  logoUrl$: Observable<string | null>;
  tenantName$: Observable<string>;
  initials$: Observable<string>;

  private imageError = false;

  constructor(private tenantService: TenantService) {
    this.logoUrl$ = this.tenantService.tenant$.pipe(
      map(tenant => {
        if (this.imageError) return null;
        return this.overrideUrl || tenant?.theme?.logoUrl || null;
      })
    );

    this.tenantName$ = this.tenantService.tenant$.pipe(
      map(tenant => tenant?.name || 'HandyPro')
    );

    this.initials$ = this.tenantName$.pipe(
      map(name => {
        const words = name.split(' ');
        if (words.length >= 2) {
          return words[0][0] + words[1][0];
        }
        return name.substring(0, 2);
      })
    );
  }

  get logoClasses(): string {
    return `hp-tenant-logo--${this.size}`;
  }

  onImageError(event: Event): void {
    this.imageError = true;
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
