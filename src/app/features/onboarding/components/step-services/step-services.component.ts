import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OnboardingService } from '../../services/onboarding.service';

interface ServiceCategory {
  id: string;
  name: string;
  enabled: boolean;
  services: { id: string; name: string; enabled: boolean }[];
}

@Component({
  selector: 'hp-step-services',
  template: `
    <div class="hp-step-services">
      <div class="hp-step-services__header">
        <h2 class="hp-step-services__title">What services do you offer?</h2>
        <p class="hp-step-services__description">
          Select the services your business provides. You can customize this later.
        </p>
      </div>

      <div class="hp-step-services__categories">
        <div *ngFor="let category of categories" class="hp-step-services__category">
          <div class="hp-step-services__category-header">
            <hp-checkbox
              [ngModel]="category.enabled"
              (ngModelChange)="toggleCategory(category, $event)"
            >
              <span class="hp-step-services__category-name">{{ category.name }}</span>
            </hp-checkbox>
          </div>

          <div *ngIf="category.enabled" class="hp-step-services__services">
            <div *ngFor="let service of category.services" class="hp-step-services__service">
              <hp-checkbox
                [ngModel]="service.enabled"
                (ngModelChange)="toggleService(service, $event)"
              >
                {{ service.name }}
              </hp-checkbox>
            </div>
          </div>
        </div>
      </div>

      <div class="hp-step-services__actions">
        <hp-button variant="outline" (click)="onBack()">
          Back
        </hp-button>
        <hp-button variant="primary" (click)="onContinue()">
          Continue
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-step-services {
      &__header {
        text-align: center;
        margin-bottom: var(--hp-spacing-8);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__description {
        font-size: var(--hp-font-size-base);
        color: var(--hp-color-neutral-500);
        margin: 0;
      }

      &__categories {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-6);
        margin-bottom: var(--hp-spacing-8);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__category {
        padding: var(--hp-spacing-4);
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-md);
      }

      &__category-header {
        margin-bottom: var(--hp-spacing-3);
      }

      &__category-name {
        font-weight: var(--hp-font-weight-semibold);
      }

      &__services {
        padding-left: var(--hp-spacing-6);
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__service {
        font-size: var(--hp-font-size-sm);
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-4);
        justify-content: space-between;
        max-width: 480px;
        margin: 0 auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepServicesComponent {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  categories: ServiceCategory[] = [
    {
      id: 'plumbing',
      name: 'Plumbing',
      enabled: true,
      services: [
        { id: 'leak-repair', name: 'Leak Repair', enabled: true },
        { id: 'drain-cleaning', name: 'Drain Cleaning', enabled: true },
        { id: 'fixture-install', name: 'Fixture Installation', enabled: false },
        { id: 'water-heater', name: 'Water Heater Service', enabled: false }
      ]
    },
    {
      id: 'electrical',
      name: 'Electrical',
      enabled: true,
      services: [
        { id: 'outlet-repair', name: 'Outlet Repair', enabled: true },
        { id: 'light-install', name: 'Light Installation', enabled: true },
        { id: 'panel-upgrade', name: 'Panel Upgrade', enabled: false },
        { id: 'wiring', name: 'Wiring', enabled: false }
      ]
    },
    {
      id: 'hvac',
      name: 'HVAC',
      enabled: false,
      services: [
        { id: 'ac-repair', name: 'AC Repair', enabled: false },
        { id: 'heating-repair', name: 'Heating Repair', enabled: false },
        { id: 'duct-cleaning', name: 'Duct Cleaning', enabled: false }
      ]
    },
    {
      id: 'general',
      name: 'General Repairs',
      enabled: true,
      services: [
        { id: 'drywall', name: 'Drywall Repair', enabled: true },
        { id: 'painting', name: 'Painting', enabled: true },
        { id: 'carpentry', name: 'Carpentry', enabled: false },
        { id: 'flooring', name: 'Flooring', enabled: false }
      ]
    }
  ];

  constructor(private onboardingService: OnboardingService) {}

  toggleCategory(category: ServiceCategory, enabled: boolean): void {
    category.enabled = enabled;
    if (!enabled) {
      category.services.forEach(s => s.enabled = false);
    }
  }

  toggleService(service: { enabled: boolean }, enabled: boolean): void {
    service.enabled = enabled;
  }

  onContinue(): void {
    this.onboardingService.updateData({
      services: {
        services: this.categories,
        minimumJobFee: 75,
        estimateFee: 0,
        cancellationPolicy: 'standard',
        serviceTaxRate: 0
      }
    });
    this.next.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
