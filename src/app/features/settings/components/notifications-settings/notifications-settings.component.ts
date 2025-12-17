import { Component, ChangeDetectionStrategy } from '@angular/core';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

@Component({
  selector: 'hp-notifications-settings',
  template: `
    <div class="hp-notifications-settings">
      <hp-card class="hp-notifications-settings__section">
        <h2 class="hp-notifications-settings__section-title">Notification Preferences</h2>
        <p class="hp-notifications-settings__section-description">
          Choose how you want to be notified about activity in your account.
        </p>

        <div class="hp-notifications-settings__channels">
          <span></span>
          <span class="hp-notifications-settings__channel-header">Email</span>
          <span class="hp-notifications-settings__channel-header">Push</span>
          <span class="hp-notifications-settings__channel-header">SMS</span>
        </div>

        <div class="hp-notifications-settings__settings">
          <div *ngFor="let setting of notifications" class="hp-notifications-settings__row">
            <div class="hp-notifications-settings__info">
              <span class="hp-notifications-settings__title">{{ setting.title }}</span>
              <span class="hp-notifications-settings__description">{{ setting.description }}</span>
            </div>
            <label class="hp-notifications-settings__toggle">
              <input type="checkbox" [(ngModel)]="setting.email" />
              <span class="hp-notifications-settings__toggle-track"></span>
            </label>
            <label class="hp-notifications-settings__toggle">
              <input type="checkbox" [(ngModel)]="setting.push" />
              <span class="hp-notifications-settings__toggle-track"></span>
            </label>
            <label class="hp-notifications-settings__toggle">
              <input type="checkbox" [(ngModel)]="setting.sms" />
              <span class="hp-notifications-settings__toggle-track"></span>
            </label>
          </div>
        </div>
      </hp-card>

      <hp-card class="hp-notifications-settings__section">
        <h2 class="hp-notifications-settings__section-title">Quiet Hours</h2>
        <p class="hp-notifications-settings__section-description">
          Set times when you don't want to receive notifications.
        </p>

        <div class="hp-notifications-settings__quiet-hours">
          <label class="hp-notifications-settings__toggle-row">
            <span>Enable Quiet Hours</span>
            <label class="hp-notifications-settings__toggle">
              <input type="checkbox" [(ngModel)]="quietHoursEnabled" />
              <span class="hp-notifications-settings__toggle-track"></span>
            </label>
          </label>

          <div *ngIf="quietHoursEnabled" class="hp-notifications-settings__time-range">
            <div class="hp-notifications-settings__time-field">
              <label>From</label>
              <select [(ngModel)]="quietHoursStart" class="hp-notifications-settings__select">
                <option *ngFor="let hour of hours" [value]="hour">{{ hour }}</option>
              </select>
            </div>
            <div class="hp-notifications-settings__time-field">
              <label>To</label>
              <select [(ngModel)]="quietHoursEnd" class="hp-notifications-settings__select">
                <option *ngFor="let hour of hours" [value]="hour">{{ hour }}</option>
              </select>
            </div>
          </div>
        </div>
      </hp-card>

      <div class="hp-notifications-settings__actions">
        <hp-button variant="primary" (click)="saveSettings()">
          Save Preferences
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-notifications-settings {
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

      &__channels {
        display: grid;
        grid-template-columns: 1fr 80px 80px 80px;
        gap: var(--hp-spacing-4);
        padding-bottom: var(--hp-spacing-3);
        border-bottom: 1px solid var(--hp-color-neutral-200);
        margin-bottom: var(--hp-spacing-2);

        @media (max-width: 575px) {
          display: none;
        }
      }

      &__channel-header {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: center;
      }

      &__settings {
        display: flex;
        flex-direction: column;
      }

      &__row {
        display: grid;
        grid-template-columns: 1fr 80px 80px 80px;
        gap: var(--hp-spacing-4);
        align-items: center;
        padding: var(--hp-spacing-4) 0;
        border-bottom: 1px solid var(--hp-color-neutral-100);

        &:last-child {
          border-bottom: none;
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr repeat(3, auto);
        }
      }

      &__info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__description {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);

        @media (max-width: 575px) {
          display: none;
        }
      }

      &__toggle {
        display: flex;
        justify-content: center;

        input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;

          &:checked + .hp-notifications-settings__toggle-track {
            background-color: var(--hp-color-primary);

            &::after {
              transform: translateX(20px);
            }
          }

          &:focus + .hp-notifications-settings__toggle-track {
            box-shadow: 0 0 0 3px var(--hp-color-primary-100);
          }
        }
      }

      &__toggle-track {
        position: relative;
        width: 44px;
        height: 24px;
        background-color: var(--hp-color-neutral-200);
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 150ms;

        &::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          transition: transform 150ms;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      }

      &__toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
      }

      &__quiet-hours {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__time-range {
        display: flex;
        gap: var(--hp-spacing-4);
      }

      &__time-field {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);

        label {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-600);
        }
      }

      &__select {
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        background-color: var(--hp-color-neutral-0);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-900);
        min-width: 120px;

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 3px var(--hp-color-primary-100);
        }
      }

      &__actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsSettingsComponent {
  notifications: NotificationSetting[] = [
    { id: '1', title: 'New Job Assigned', description: 'When a new job is assigned to you or your team', email: true, push: true, sms: false },
    { id: '2', title: 'Job Updates', description: 'When job status changes or notes are added', email: true, push: true, sms: false },
    { id: '3', title: 'Customer Messages', description: 'When customers send messages or reply', email: true, push: true, sms: true },
    { id: '4', title: 'Payment Received', description: 'When a customer pays an invoice', email: true, push: false, sms: false },
    { id: '5', title: 'Schedule Reminders', description: 'Reminders for upcoming jobs', email: false, push: true, sms: true },
    { id: '6', title: 'Team Activity', description: 'When team members complete jobs or add updates', email: false, push: false, sms: false }
  ];

  quietHoursEnabled = false;
  quietHoursStart = '10:00 PM';
  quietHoursEnd = '7:00 AM';

  hours = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  saveSettings(): void {
    console.log('Saving notification settings');
  }
}
