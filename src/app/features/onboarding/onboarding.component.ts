import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnboardingService } from './services/onboarding.service';
import { OnboardingState } from '@core/models';

@Component({
  selector: 'hp-onboarding',
  template: `
    <div class="hp-onboarding">
      <!-- Progress Bar -->
      <div class="hp-onboarding__progress">
        <div class="hp-onboarding__progress-bar">
          <div
            class="hp-onboarding__progress-fill"
            [style.width.%]="(currentStep / totalSteps) * 100"
          ></div>
        </div>
        <div class="hp-onboarding__steps">
          <div
            *ngFor="let step of steps; let i = index"
            class="hp-onboarding__step"
            [class.hp-onboarding__step--active]="currentStep === i + 1"
            [class.hp-onboarding__step--completed]="isStepComplete(i + 1)"
            [class.hp-onboarding__step--accessible]="canAccessStep(i + 1)"
            (click)="goToStep(i + 1)"
          >
            <div class="hp-onboarding__step-number">
              <span *ngIf="!isStepComplete(i + 1)">{{ i + 1 }}</span>
              <svg *ngIf="isStepComplete(i + 1)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="hp-onboarding__step-label">{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="hp-onboarding__content">
        <ng-container [ngSwitch]="currentStep">
          <hp-step-plan *ngSwitchCase="1" (next)="nextStep()"></hp-step-plan>
          <hp-step-account *ngSwitchCase="2" (next)="nextStep()" (back)="previousStep()"></hp-step-account>
          <hp-step-company *ngSwitchCase="3" (next)="nextStep()" (back)="previousStep()"></hp-step-company>
          <hp-step-services *ngSwitchCase="4" (next)="nextStep()" (back)="previousStep()"></hp-step-services>
          <hp-step-team *ngSwitchCase="5" (next)="nextStep()" (back)="previousStep()"></hp-step-team>
          <hp-step-payment *ngSwitchCase="6" (next)="nextStep()" (back)="previousStep()"></hp-step-payment>
          <hp-step-confirmation *ngSwitchCase="7" (complete)="completeOnboarding()"></hp-step-confirmation>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .hp-onboarding {
      max-width: 800px;
      margin: 0 auto;

      &__progress {
        margin-bottom: var(--hp-spacing-10);
      }

      &__progress-bar {
        height: 4px;
        background-color: var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-full);
        margin-bottom: var(--hp-spacing-6);
        overflow: hidden;
      }

      &__progress-fill {
        height: 100%;
        background-color: var(--hp-color-primary);
        border-radius: var(--hp-radius-full);
        transition: width 300ms ease-in-out;
      }

      &__steps {
        display: flex;
        justify-content: space-between;

        @media (max-width: 767px) {
          display: none;
        }
      }

      &__step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        cursor: default;
        opacity: 0.5;
        transition: opacity 150ms ease-in-out;

        &--active,
        &--completed {
          opacity: 1;
        }

        &--accessible {
          cursor: pointer;

          &:hover {
            .hp-onboarding__step-number {
              border-color: var(--hp-color-primary);
            }
          }
        }
      }

      &__step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--hp-color-neutral-300);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-600);
        transition: all 150ms ease-in-out;

        svg {
          width: 16px;
          height: 16px;
        }

        .hp-onboarding__step--active & {
          border-color: var(--hp-color-primary);
          background-color: var(--hp-color-primary);
          color: white;
        }

        .hp-onboarding__step--completed & {
          border-color: var(--hp-color-success);
          background-color: var(--hp-color-success);
          color: white;
        }
      }

      &__step-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        white-space: nowrap;

        .hp-onboarding__step--active & {
          color: var(--hp-color-neutral-900);
          font-weight: var(--hp-font-weight-medium);
        }
      }

      &__content {
        background-color: var(--hp-color-neutral-0);
        border-radius: var(--hp-radius-xl);
        padding: var(--hp-spacing-8);
        box-shadow: var(--hp-shadow-md);

        @media (max-width: 767px) {
          padding: var(--hp-spacing-6);
          border-radius: var(--hp-radius-lg);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  steps = ['Plan', 'Account', 'Company', 'Services', 'Team', 'Payment', 'Confirmation'];
  totalSteps = 7;
  currentStep = 1;

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onboardingService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentStep = state.currentStep;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isStepComplete(step: number): boolean {
    return this.onboardingService.isStepComplete(step);
  }

  canAccessStep(step: number): boolean {
    return this.onboardingService.canAccessStep(step);
  }

  goToStep(step: number): void {
    if (this.canAccessStep(step)) {
      this.onboardingService.setStep(step);
    }
  }

  nextStep(): void {
    this.onboardingService.nextStep();
  }

  previousStep(): void {
    this.onboardingService.previousStep();
  }

  completeOnboarding(): void {
    this.onboardingService.submitOnboarding().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Onboarding error:', error);
      }
    });
  }
}
