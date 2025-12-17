import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'hp-account-settings',
  template: `
    <div class="hp-account-settings">
      <!-- Profile Section -->
      <hp-card class="hp-account-settings__section">
        <h2 class="hp-account-settings__section-title">Profile Information</h2>
        <p class="hp-account-settings__section-description">
          Update your personal information and profile photo.
        </p>

        <div class="hp-account-settings__avatar">
          <div class="hp-account-settings__avatar-preview">
            <img *ngIf="avatarUrl" [src]="avatarUrl" alt="Profile photo" />
            <span *ngIf="!avatarUrl" class="hp-account-settings__avatar-initials">JD</span>
          </div>
          <div class="hp-account-settings__avatar-actions">
            <hp-button variant="outline" size="sm" (click)="uploadAvatar()">
              Change Photo
            </hp-button>
            <hp-button *ngIf="avatarUrl" variant="ghost" size="sm" (click)="removeAvatar()">
              Remove
            </hp-button>
          </div>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="hp-account-settings__form">
          <div class="hp-account-settings__form-row">
            <hp-input
              label="First Name"
              formControlName="firstName"
              [error]="getError('firstName')"
            ></hp-input>
            <hp-input
              label="Last Name"
              formControlName="lastName"
              [error]="getError('lastName')"
            ></hp-input>
          </div>

          <hp-input
            label="Email Address"
            type="email"
            formControlName="email"
            [error]="getError('email')"
          ></hp-input>

          <hp-input
            label="Phone Number"
            type="tel"
            formControlName="phone"
            [error]="getError('phone')"
          ></hp-input>

          <hp-input
            label="Job Title"
            formControlName="jobTitle"
            placeholder="e.g., Owner, Manager"
          ></hp-input>

          <div class="hp-account-settings__form-actions">
            <hp-button
              type="submit"
              variant="primary"
              [disabled]="profileForm.invalid || profileForm.pristine"
              [loading]="isSavingProfile"
            >
              Save Changes
            </hp-button>
          </div>
        </form>
      </hp-card>

      <!-- Password Section -->
      <hp-card class="hp-account-settings__section">
        <h2 class="hp-account-settings__section-title">Change Password</h2>
        <p class="hp-account-settings__section-description">
          Update your password to keep your account secure.
        </p>

        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="hp-account-settings__form">
          <hp-input
            label="Current Password"
            type="password"
            formControlName="currentPassword"
            [error]="getPasswordError('currentPassword')"
          ></hp-input>

          <hp-input
            label="New Password"
            type="password"
            formControlName="newPassword"
            [error]="getPasswordError('newPassword')"
          ></hp-input>

          <hp-input
            label="Confirm New Password"
            type="password"
            formControlName="confirmPassword"
            [error]="getPasswordError('confirmPassword')"
          ></hp-input>

          <div class="hp-account-settings__password-requirements">
            <span class="hp-account-settings__requirements-title">Password must contain:</span>
            <ul class="hp-account-settings__requirements-list">
              <li [class.met]="hasMinLength">At least 8 characters</li>
              <li [class.met]="hasUppercase">One uppercase letter</li>
              <li [class.met]="hasLowercase">One lowercase letter</li>
              <li [class.met]="hasNumber">One number</li>
            </ul>
          </div>

          <div class="hp-account-settings__form-actions">
            <hp-button
              type="submit"
              variant="primary"
              [disabled]="passwordForm.invalid"
              [loading]="isChangingPassword"
            >
              Update Password
            </hp-button>
          </div>
        </form>
      </hp-card>

      <!-- Danger Zone -->
      <hp-card class="hp-account-settings__section hp-account-settings__section--danger">
        <h2 class="hp-account-settings__section-title">Delete Account</h2>
        <p class="hp-account-settings__section-description">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <hp-button variant="danger" (click)="deleteAccount()">
          Delete My Account
        </hp-button>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-account-settings {
      display: flex;
      flex-direction: column;
      gap: var(--hp-spacing-6);

      &__section {
        &-title {
          font-size: var(--hp-font-size-lg);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
          margin: 0 0 var(--hp-spacing-1);
        }

        &-description {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
          margin: 0 0 var(--hp-spacing-6);
        }

        &--danger {
          border-color: var(--hp-color-error-200);

          .hp-account-settings__section-title {
            color: var(--hp-color-error);
          }
        }
      }

      &__avatar {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-6);
      }

      &__avatar-preview {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: var(--hp-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      &__avatar-initials {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-0);
      }

      &__avatar-actions {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__form {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__form-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__form-actions {
        padding-top: var(--hp-spacing-4);
      }

      &__password-requirements {
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);
      }

      &__requirements-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
        display: block;
        margin-bottom: var(--hp-spacing-2);
      }

      &__requirements-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-2);

        li {
          display: flex;
          align-items: center;
          gap: var(--hp-spacing-2);
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);

          &::before {
            content: '';
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: var(--hp-color-neutral-200);
            flex-shrink: 0;
          }

          &.met {
            color: var(--hp-color-success);

            &::before {
              background-color: var(--hp-color-success);
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
              background-size: 10px;
              background-repeat: no-repeat;
              background-position: center;
            }
          }
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSettingsComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  avatarUrl: string | null = null;
  isSavingProfile = false;
  isChangingPassword = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: ['John', [Validators.required]],
      lastName: ['Doe', [Validators.required]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['(555) 123-4567', [Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      jobTitle: ['Owner']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get hasMinLength(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  get hasUppercase(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  get hasLowercase(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  get hasNumber(): boolean {
    const password = this.passwordForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  getError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }

  getPasswordError(field: string): string {
    const control = this.passwordForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength']) return 'Password must be at least 8 characters';
    }
    if (field === 'confirmPassword' && this.passwordForm.errors?.['mismatch'] && control?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  uploadAvatar(): void {
    // Mock implementation
    console.log('Upload avatar clicked');
  }

  removeAvatar(): void {
    this.avatarUrl = null;
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSavingProfile = true;
      this.cdr.markForCheck();

      // Mock API call
      setTimeout(() => {
        this.isSavingProfile = false;
        this.profileForm.markAsPristine();
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      this.cdr.markForCheck();

      // Mock API call
      setTimeout(() => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  deleteAccount(): void {
    // Would show confirmation modal
    console.log('Delete account clicked');
  }
}
