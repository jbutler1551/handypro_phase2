import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'hp-step-team',
  template: `
    <div class="hp-step-team">
      <div class="hp-step-team__header">
        <h2 class="hp-step-team__title">Invite your team</h2>
        <p class="hp-step-team__description">
          Add team members now or skip and invite them later.
        </p>
      </div>

      <form [formGroup]="form" class="hp-step-team__form">
        <div formArrayName="invitations" class="hp-step-team__invitations">
          <div
            *ngFor="let invitation of invitations.controls; let i = index"
            [formGroupName]="i"
            class="hp-step-team__invitation"
          >
            <hp-input
              label="Email address"
              type="email"
              formControlName="email"
              placeholder="team@example.com"
            ></hp-input>

            <div class="hp-step-team__role">
              <label class="hp-step-team__role-label">Role</label>
              <select formControlName="role" class="hp-step-team__role-select">
                <option value="TENANT_ADMIN">Admin</option>
                <option value="LOCATION_MANAGER">Manager</option>
                <option value="CRAFTSMAN">Technician</option>
              </select>
            </div>

            <button
              type="button"
              class="hp-step-team__remove"
              (click)="removeInvitation(i)"
              *ngIf="invitations.length > 1"
              aria-label="Remove invitation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <button
          type="button"
          class="hp-step-team__add"
          (click)="addInvitation()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add another team member
        </button>
      </form>

      <div class="hp-step-team__actions">
        <hp-button variant="outline" (click)="onBack()">
          Back
        </hp-button>
        <hp-button variant="ghost" (click)="onSkip()">
          Skip for now
        </hp-button>
        <hp-button variant="primary" (click)="onContinue()">
          Continue
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-step-team {
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
        max-width: 600px;
        margin: 0 auto var(--hp-spacing-8);
      }

      &__invitations {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
      }

      &__invitation {
        display: grid;
        grid-template-columns: 1fr 150px auto;
        gap: var(--hp-spacing-4);
        align-items: end;

        @media (max-width: 575px) {
          grid-template-columns: 1fr auto;

          hp-input {
            grid-column: 1 / -1;
          }
        }
      }

      &__role {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__role-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
      }

      &__role-select {
        padding: var(--hp-spacing-3);
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        background-color: var(--hp-color-neutral-0);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 3px var(--hp-color-primary-100);
        }
      }

      &__remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-bottom: 4px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-400);
        cursor: pointer;
        transition: background-color 150ms, color 150ms;

        &:hover {
          background-color: var(--hp-color-danger-50);
          color: var(--hp-color-danger);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__add {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: none;
        border: none;
        color: var(--hp-color-primary);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        cursor: pointer;
        transition: color 150ms;

        &:hover {
          color: var(--hp-color-primary-700);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__actions {
        display: flex;
        gap: var(--hp-spacing-4);
        justify-content: center;
        max-width: 600px;
        margin: 0 auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepTeamComponent {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService
  ) {
    this.form = this.fb.group({
      invitations: this.fb.array([this.createInvitation()])
    });
  }

  get invitations(): FormArray {
    return this.form.get('invitations') as FormArray;
  }

  createInvitation(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.email]],
      role: ['CRAFTSMAN']
    });
  }

  addInvitation(): void {
    this.invitations.push(this.createInvitation());
  }

  removeInvitation(index: number): void {
    if (this.invitations.length > 1) {
      this.invitations.removeAt(index);
    }
  }

  onContinue(): void {
    const validInvitations = this.invitations.value.filter(
      (inv: { email: string }) => inv.email && inv.email.trim()
    );
    this.onboardingService.updateData({
      team: { invitations: validInvitations }
    });
    this.next.emit();
  }

  onSkip(): void {
    this.onboardingService.updateData({ team: { invitations: [] } });
    this.next.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
