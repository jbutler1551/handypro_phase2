import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'technician';
  status: 'active' | 'pending' | 'disabled';
  avatar?: string;
  joinedAt: string;
}

@Component({
  selector: 'hp-team-settings',
  template: `
    <div class="hp-team-settings">
      <!-- Invite Section -->
      <hp-card class="hp-team-settings__section">
        <h2 class="hp-team-settings__section-title">Invite Team Members</h2>
        <p class="hp-team-settings__section-description">
          Send invitations to add new members to your team.
        </p>

        <form [formGroup]="inviteForm" (ngSubmit)="sendInvite()" class="hp-team-settings__invite-form">
          <div class="hp-team-settings__invite-row">
            <hp-input
              label="Email Address"
              type="email"
              formControlName="email"
              placeholder="colleague@company.com"
              [error]="getInviteError('email')"
            ></hp-input>
            <div class="hp-team-settings__role-select">
              <label class="hp-team-settings__role-label">Role</label>
              <select formControlName="role" class="hp-team-settings__select">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            <div class="hp-team-settings__invite-btn">
              <hp-button
                type="submit"
                variant="primary"
                [disabled]="inviteForm.invalid"
                [loading]="isSendingInvite"
              >
                Send Invite
              </hp-button>
            </div>
          </div>
        </form>
      </hp-card>

      <!-- Team Members Section -->
      <hp-card class="hp-team-settings__section">
        <div class="hp-team-settings__header">
          <div>
            <h2 class="hp-team-settings__section-title">Team Members</h2>
            <p class="hp-team-settings__section-description">
              Manage your team members and their roles.
            </p>
          </div>
          <div class="hp-team-settings__count">
            {{ teamMembers.length }} member{{ teamMembers.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Search -->
        <div class="hp-team-settings__search">
          <hp-input
            placeholder="Search team members..."
            [(ngModel)]="searchQuery"
            type="search"
          ></hp-input>
        </div>

        <!-- Members List -->
        <div class="hp-team-settings__members">
          <div
            *ngFor="let member of filteredMembers"
            class="hp-team-settings__member"
          >
            <div class="hp-team-settings__member-info">
              <div class="hp-team-settings__member-avatar">
                <img *ngIf="member.avatar" [src]="member.avatar" [alt]="member.name" />
                <span *ngIf="!member.avatar">{{ getInitials(member.name) }}</span>
              </div>
              <div class="hp-team-settings__member-details">
                <div class="hp-team-settings__member-name">
                  {{ member.name }}
                  <hp-badge *ngIf="member.status === 'pending'" variant="warning" size="sm">
                    Pending
                  </hp-badge>
                </div>
                <div class="hp-team-settings__member-email">{{ member.email }}</div>
              </div>
            </div>

            <div class="hp-team-settings__member-actions">
              <div class="hp-team-settings__member-role">
                <select
                  *ngIf="member.role !== 'owner'"
                  [value]="member.role"
                  class="hp-team-settings__select hp-team-settings__select--small"
                  (change)="changeRole(member.id, $event)"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="technician">Technician</option>
                </select>
                <hp-badge *ngIf="member.role === 'owner'" variant="primary" size="sm">
                  Owner
                </hp-badge>
              </div>

              <button
                *ngIf="member.role !== 'owner'"
                type="button"
                class="hp-team-settings__member-menu"
                [class.hp-team-settings__member-menu--open]="openMenuId === member.id"
                (click)="toggleMenu(member.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                *ngIf="openMenuId === member.id"
                class="hp-team-settings__dropdown"
              >
                <button
                  *ngIf="member.status === 'pending'"
                  type="button"
                  (click)="resendInvite(member)"
                >
                  Resend Invite
                </button>
                <button
                  *ngIf="member.status === 'active'"
                  type="button"
                  (click)="toggleMemberStatus(member)"
                >
                  Disable Account
                </button>
                <button
                  *ngIf="member.status === 'disabled'"
                  type="button"
                  (click)="toggleMemberStatus(member)"
                >
                  Enable Account
                </button>
                <button
                  type="button"
                  class="hp-team-settings__dropdown-danger"
                  (click)="removeMember(member)"
                >
                  Remove from Team
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredMembers.length === 0" class="hp-team-settings__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <p>No team members found</p>
          </div>
        </div>
      </hp-card>

      <!-- Roles Explanation -->
      <hp-card class="hp-team-settings__section">
        <h2 class="hp-team-settings__section-title">Role Permissions</h2>
        <p class="hp-team-settings__section-description">
          Understanding what each role can do.
        </p>

        <div class="hp-team-settings__roles">
          <div class="hp-team-settings__role">
            <h4>Admin</h4>
            <p>Full access to all features including billing and team management.</p>
          </div>
          <div class="hp-team-settings__role">
            <h4>Manager</h4>
            <p>Can manage jobs, customers, and team schedules. Cannot access billing.</p>
          </div>
          <div class="hp-team-settings__role">
            <h4>Technician</h4>
            <p>Can view and update assigned jobs. Limited access to customer data.</p>
          </div>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-team-settings {
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
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      &__count {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        background-color: var(--hp-color-neutral-100);
        padding: var(--hp-spacing-1) var(--hp-spacing-3);
        border-radius: var(--hp-radius-full);
      }

      &__invite-form {
        margin-bottom: 0;
      }

      &__invite-row {
        display: grid;
        grid-template-columns: 1fr 180px auto;
        gap: var(--hp-spacing-4);
        align-items: flex-end;

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__role-select {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__role-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
      }

      &__select {
        height: 44px;
        padding: 0 var(--hp-spacing-3);
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        background-color: var(--hp-color-neutral-0);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-900);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 3px var(--hp-color-primary-100);
        }

        &--small {
          height: 36px;
          padding: 0 var(--hp-spacing-2);
        }
      }

      &__invite-btn {
        @media (max-width: 767px) {
          width: 100%;

          hp-button {
            width: 100%;
          }
        }
      }

      &__search {
        margin-bottom: var(--hp-spacing-4);
      }

      &__members {
        display: flex;
        flex-direction: column;
      }

      &__member {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4) 0;
        border-bottom: 1px solid var(--hp-color-neutral-100);

        &:last-child {
          border-bottom: none;
        }

        @media (max-width: 575px) {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--hp-spacing-3);
        }
      }

      &__member-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--hp-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        span {
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-0);
        }
      }

      &__member-details {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__member-name {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__member-email {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__member-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        position: relative;

        @media (max-width: 575px) {
          width: 100%;
          justify-content: space-between;
        }
      }

      &__member-role {
        min-width: 120px;
      }

      &__member-menu {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--hp-radius-md);
        color: var(--hp-color-neutral-400);
        cursor: pointer;
        transition: background-color 150ms, color 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-100);
          color: var(--hp-color-neutral-600);
        }

        svg {
          width: 18px;
          height: 18px;
        }
      }

      &__dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: var(--hp-spacing-1);
        min-width: 160px;
        background-color: var(--hp-color-neutral-0);
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-md);
        box-shadow: var(--hp-shadow-lg);
        z-index: 10;
        overflow: hidden;

        button {
          display: block;
          width: 100%;
          padding: var(--hp-spacing-2) var(--hp-spacing-3);
          background: none;
          border: none;
          text-align: left;
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-700);
          cursor: pointer;

          &:hover {
            background-color: var(--hp-color-neutral-50);
          }
        }

        &-danger {
          color: var(--hp-color-error) !important;
        }
      }

      &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-8);
        color: var(--hp-color-neutral-400);

        svg {
          width: 48px;
          height: 48px;
          margin-bottom: var(--hp-spacing-3);
        }

        p {
          margin: 0;
          font-size: var(--hp-font-size-sm);
        }
      }

      &__roles {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__role {
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);

        h4 {
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-semibold);
          color: var(--hp-color-neutral-900);
          margin: 0 0 var(--hp-spacing-2);
        }

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-600);
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamSettingsComponent {
  inviteForm: FormGroup;
  searchQuery = '';
  openMenuId: string | null = null;
  isSendingInvite = false;

  teamMembers: TeamMember[] = [
    { id: '1', name: 'John Doe', email: 'john@acmeplumbing.com', role: 'owner', status: 'active', joinedAt: '2023-01-15' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@acmeplumbing.com', role: 'admin', status: 'active', joinedAt: '2023-03-22' },
    { id: '3', name: 'Mike Wilson', email: 'mike@acmeplumbing.com', role: 'manager', status: 'active', joinedAt: '2023-05-10' },
    { id: '4', name: 'Emily Brown', email: 'emily@acmeplumbing.com', role: 'technician', status: 'active', joinedAt: '2023-06-01' },
    { id: '5', name: 'Alex Martinez', email: 'alex@acmeplumbing.com', role: 'technician', status: 'pending', joinedAt: '2024-01-08' }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['technician', [Validators.required]]
    });
  }

  get filteredMembers(): TeamMember[] {
    if (!this.searchQuery) {
      return this.teamMembers;
    }
    const query = this.searchQuery.toLowerCase();
    return this.teamMembers.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    );
  }

  getInviteError(field: string): string {
    const control = this.inviteForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email']) return 'Please enter a valid email';
    }
    return '';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  sendInvite(): void {
    if (this.inviteForm.valid) {
      this.isSendingInvite = true;
      this.cdr.markForCheck();

      // Mock API call
      setTimeout(() => {
        const newMember: TeamMember = {
          id: Date.now().toString(),
          name: this.inviteForm.value.email.split('@')[0],
          email: this.inviteForm.value.email,
          role: this.inviteForm.value.role,
          status: 'pending',
          joinedAt: new Date().toISOString()
        };
        this.teamMembers = [...this.teamMembers, newMember];
        this.inviteForm.reset({ role: 'technician' });
        this.isSendingInvite = false;
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  toggleMenu(memberId: string): void {
    this.openMenuId = this.openMenuId === memberId ? null : memberId;
  }

  changeRole(memberId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const member = this.teamMembers.find(m => m.id === memberId);
    if (member) {
      member.role = select.value as TeamMember['role'];
    }
  }

  resendInvite(member: TeamMember): void {
    this.openMenuId = null;
    console.log('Resending invite to', member.email);
  }

  toggleMemberStatus(member: TeamMember): void {
    this.openMenuId = null;
    member.status = member.status === 'active' ? 'disabled' : 'active';
    this.cdr.markForCheck();
  }

  removeMember(member: TeamMember): void {
    this.openMenuId = null;
    this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
    this.cdr.markForCheck();
  }
}
