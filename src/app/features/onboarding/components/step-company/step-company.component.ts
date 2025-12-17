import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'hp-step-company',
  template: `
    <div class="hp-step-company">
      <div class="hp-step-company__header">
        <h2 class="hp-step-company__title">Tell us about your business</h2>
        <p class="hp-step-company__description">
          Help us customize HandyPro for your company.
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="hp-step-company__form">
        <hp-input
          label="Company name"
          formControlName="companyName"
          placeholder="ABC Handyman Services"
          [error]="getFieldError('companyName')"
        ></hp-input>

        <hp-input
          label="Business type"
          formControlName="businessType"
          placeholder="e.g., LLC, Sole Proprietor"
          [error]="getFieldError('businessType')"
        ></hp-input>

        <hp-input
          label="Street address"
          formControlName="address"
          placeholder="123 Main Street"
          [error]="getFieldError('address')"
        ></hp-input>

        <div class="hp-step-company__row">
          <hp-input
            label="City"
            formControlName="city"
            placeholder="New York"
            [error]="getFieldError('city')"
          ></hp-input>
          <hp-input
            label="State"
            formControlName="state"
            placeholder="NY"
            [error]="getFieldError('state')"
          ></hp-input>
          <hp-input
            label="ZIP code"
            formControlName="zipCode"
            placeholder="10001"
            [error]="getFieldError('zipCode')"
          ></hp-input>
        </div>

        <div class="hp-step-company__actions">
          <hp-button variant="outline" type="button" (click)="onBack()">
            Back
          </hp-button>
          <hp-button variant="primary" type="submit" [disabled]="form.invalid">
            Continue
          </hp-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .hp-step-company {
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

      &__form {
        max-width: 480px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-5);
      }

      &__row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-4);
        justify-content: space-between;
        margin-top: var(--hp-spacing-4);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepCompanyComponent {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService
  ) {
    const savedData = this.onboardingService.data.company;

    this.form = this.fb.group({
      companyName: [savedData?.companyName || '', [Validators.required]],
      businessType: [savedData?.businessType || '', [Validators.required]],
      address: [savedData?.address || '', [Validators.required]],
      city: [savedData?.city || '', [Validators.required]],
      state: [savedData?.state || '', [Validators.required]],
      zipCode: [savedData?.zipCode || '', [Validators.required]]
    });
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    return '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.onboardingService.updateData({ company: this.form.value });
      this.next.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
