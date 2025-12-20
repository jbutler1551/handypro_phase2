import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  category: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  channel: 'email' | 'push' | 'sms' | 'in-app';
  status: 'sent' | 'delivered' | 'failed' | 'read';
  sentAt: Date;
}

interface AlertThreshold {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  unit: string;
  enabled: boolean;
}

@Component({
  selector: 'hp-notifications-settings',
  template: `
    <div class="hp-notif">
      <div class="hp-notif__header">
        <div>
          <h1 class="hp-notif__title">Notifications</h1>
          <p class="hp-notif__subtitle">Manage your notification preferences, channels, and alerts</p>
        </div>
      </div>

      <div class="hp-notif__tabs">
        <button *ngFor="let tab of tabs" class="hp-notif__tab" [class.hp-notif__tab--active]="activeTab === tab.id" (click)="activeTab = tab.id">
          <span class="hp-notif__tab-icon" [innerHTML]="sanitizeHtml(tab.icon)"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Preferences Tab -->
      <div *ngIf="activeTab === 'preferences'" class="hp-notif__panel">
        <div class="hp-notif__category" *ngFor="let cat of categories">
          <h3 class="hp-notif__category-title">{{ cat }}</h3>
          <div class="hp-notif__grid">
            <div class="hp-notif__grid-header">
              <span></span><span>Email</span><span>Push</span><span>SMS</span><span>In-App</span>
            </div>
            <div *ngFor="let n of getNotificationsByCategory(cat)" class="hp-notif__row">
              <div class="hp-notif__info">
                <span class="hp-notif__name">{{ n.title }}</span>
                <span class="hp-notif__desc">{{ n.description }}</span>
              </div>
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="n.email"><span class="hp-notif__track"></span></label>
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="n.push"><span class="hp-notif__track"></span></label>
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="n.sms"><span class="hp-notif__track"></span></label>
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="n.inApp"><span class="hp-notif__track"></span></label>
            </div>
          </div>
        </div>

        <hp-card>
          <h3 class="hp-notif__card-title">Quiet Hours</h3>
          <div class="hp-notif__quiet">
            <label class="hp-notif__quiet-toggle">
              <span>Enable Quiet Hours</span>
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="quietHoursEnabled"><span class="hp-notif__track"></span></label>
            </label>
            <div *ngIf="quietHoursEnabled" class="hp-notif__quiet-times">
              <div class="hp-notif__time-field"><label>From</label><select [(ngModel)]="quietHoursStart" class="hp-notif__select"><option *ngFor="let h of hours" [value]="h">{{ h }}</option></select></div>
              <div class="hp-notif__time-field"><label>To</label><select [(ngModel)]="quietHoursEnd" class="hp-notif__select"><option *ngFor="let h of hours" [value]="h">{{ h }}</option></select></div>
              <div class="hp-notif__time-field"><label>Timezone</label><select [(ngModel)]="timezone" class="hp-notif__select"><option *ngFor="let tz of timezones" [value]="tz">{{ tz }}</option></select></div>
            </div>
          </div>
        </hp-card>
      </div>

      <!-- Channels Tab -->
      <div *ngIf="activeTab === 'channels'" class="hp-notif__panel">
        <div class="hp-notif__channels-grid">
          <hp-card *ngFor="let ch of channels" [class.hp-notif__channel--active]="ch.enabled">
            <div class="hp-notif__channel-header">
              <div class="hp-notif__channel-icon" [innerHTML]="sanitizeHtml(ch.icon)"></div>
              <div class="hp-notif__channel-info">
                <h4>{{ ch.name }}</h4>
                <p>{{ ch.description }}</p>
              </div>
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="ch.enabled"><span class="hp-notif__track"></span></label>
            </div>
            <div class="hp-notif__channel-stats">
              <div class="hp-notif__stat"><span class="hp-notif__stat-val">{{ ch.sent }}</span><span class="hp-notif__stat-lbl">Sent</span></div>
              <div class="hp-notif__stat"><span class="hp-notif__stat-val">{{ ch.delivered }}</span><span class="hp-notif__stat-lbl">Delivered</span></div>
              <div class="hp-notif__stat"><span class="hp-notif__stat-val">{{ ch.rate }}%</span><span class="hp-notif__stat-lbl">Rate</span></div>
            </div>
            <div class="hp-notif__channel-config" *ngIf="ch.configurable">
              <hp-button variant="ghost" size="sm">Configure {{ ch.name }}</hp-button>
            </div>
          </hp-card>
        </div>
      </div>

      <!-- Thresholds Tab -->
      <div *ngIf="activeTab === 'thresholds'" class="hp-notif__panel">
        <div class="hp-notif__section-header">
          <div><h2>Alert Thresholds</h2><p>Set up automatic alerts when metrics exceed thresholds</p></div>
          <hp-button variant="primary" size="sm" (click)="addThreshold()">Add Alert</hp-button>
        </div>
        <div class="hp-notif__thresholds">
          <div *ngFor="let t of thresholds" class="hp-notif__threshold">
            <div class="hp-notif__threshold-main">
              <label class="hp-notif__toggle"><input type="checkbox" [(ngModel)]="t.enabled"><span class="hp-notif__track"></span></label>
              <div class="hp-notif__threshold-info">
                <h4>{{ t.name }}</h4>
                <p>{{ t.description }}</p>
              </div>
            </div>
            <div class="hp-notif__threshold-rule">
              <span class="hp-notif__threshold-metric">{{ t.metric }}</span>
              <span class="hp-notif__threshold-op">{{ t.operator === 'gt' ? '>' : t.operator === 'lt' ? '<' : '=' }}</span>
              <span class="hp-notif__threshold-val">{{ t.value }}{{ t.unit }}</span>
            </div>
            <div class="hp-notif__threshold-actions">
              <hp-button variant="ghost" size="sm">Edit</hp-button>
              <hp-button variant="ghost" size="sm"><span class="hp-notif__danger">Delete</span></hp-button>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div *ngIf="activeTab === 'history'" class="hp-notif__panel">
        <div class="hp-notif__section-header">
          <div><h2>Notification History</h2><p>View past notifications sent from your account</p></div>
          <div class="hp-notif__filters">
            <select [(ngModel)]="historyFilter" class="hp-notif__select">
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="push">Push</option>
              <option value="sms">SMS</option>
              <option value="in-app">In-App</option>
            </select>
          </div>
        </div>
        <hp-card class="hp-notif__history-card">
          <div class="hp-notif__history-list">
            <div *ngFor="let h of filteredHistory" class="hp-notif__history-item">
              <div class="hp-notif__history-icon" [class]="'hp-notif__history-icon--' + h.channel">
                <span [innerHTML]="sanitizeHtml(getChannelIcon(h.channel))"></span>
              </div>
              <div class="hp-notif__history-content">
                <h4>{{ h.title }}</h4>
                <p>{{ h.message }}</p>
                <span class="hp-notif__history-time">{{ h.sentAt | date:'MMM d, h:mm a' }}</span>
              </div>
              <hp-badge [variant]="h.status === 'delivered' || h.status === 'read' ? 'success' : h.status === 'failed' ? 'error' : 'secondary'" size="sm">
                {{ h.status | titlecase }}
              </hp-badge>
            </div>
          </div>
        </hp-card>
      </div>

      <div class="hp-notif__actions">
        <hp-button variant="outline">Reset to Defaults</hp-button>
        <hp-button variant="primary" (click)="saveSettings()">Save Preferences</hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-notif {
      max-width: 1200px;
      &__header { margin-bottom: var(--hp-spacing-6); }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); }
      &__subtitle { font-size: var(--hp-font-size-base); color: var(--hp-text-secondary); margin: 0; }
      &__tabs { display: flex; gap: var(--hp-spacing-1); padding: var(--hp-spacing-2); background: var(--hp-glass-bg-subtle); border-radius: var(--hp-radius-modern-md); margin-bottom: var(--hp-spacing-6); overflow-x: auto; }
      &__tab { display: flex; align-items: center; gap: var(--hp-spacing-2); padding: var(--hp-spacing-3) var(--hp-spacing-5); background: transparent; border: none; border-radius: var(--hp-radius-modern-sm); font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-secondary); cursor: pointer; white-space: nowrap; transition: all 200ms ease; &:hover { color: var(--hp-text-primary); background: var(--hp-glass-bg); } &--active { background: var(--hp-surface-card); color: var(--hp-text-primary); box-shadow: var(--hp-shadow-sm); } }
      &__tab-icon { display: flex; width: 18px; height: 18px; svg { width: 100%; height: 100%; } }
      &__panel { display: flex; flex-direction: column; gap: var(--hp-spacing-6); }
      &__category { background: var(--hp-surface-card); border: 1px solid var(--hp-glass-border); border-radius: var(--hp-radius-modern-md); padding: var(--hp-spacing-5); margin-bottom: var(--hp-spacing-4); }
      &__category-title { font-size: var(--hp-font-size-base); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-4); }
      &__grid-header { display: grid; grid-template-columns: 1fr repeat(4, 70px); gap: var(--hp-spacing-3); padding-bottom: var(--hp-spacing-3); border-bottom: 1px solid var(--hp-glass-border); margin-bottom: var(--hp-spacing-2); span { font-size: var(--hp-font-size-xs); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-tertiary); text-transform: uppercase; text-align: center; &:first-child { text-align: left; } } }
      &__row { display: grid; grid-template-columns: 1fr repeat(4, 70px); gap: var(--hp-spacing-3); align-items: center; padding: var(--hp-spacing-3) 0; border-bottom: 1px solid var(--hp-glass-border); &:last-child { border-bottom: none; } }
      &__info { display: flex; flex-direction: column; gap: 2px; }
      &__name { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); }
      &__desc { font-size: var(--hp-font-size-xs); color: var(--hp-text-secondary); }
      &__toggle { display: flex; justify-content: center; cursor: pointer; input { position: absolute; opacity: 0; &:checked + .hp-notif__track { background: var(--hp-color-primary); &::after { transform: translateX(18px); } } } }
      &__track { position: relative; width: 40px; height: 22px; background: var(--hp-glass-bg-prominent); border-radius: 11px; transition: background 200ms; &::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: white; border-radius: 50%; box-shadow: var(--hp-shadow-sm); transition: transform 200ms; } }
      &__card-title { font-size: var(--hp-font-size-base); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-4); }
      &__quiet { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__quiet-toggle { display: flex; justify-content: space-between; align-items: center; font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); }
      &__quiet-times { display: flex; gap: var(--hp-spacing-4); flex-wrap: wrap; }
      &__time-field { display: flex; flex-direction: column; gap: var(--hp-spacing-1); label { font-size: var(--hp-font-size-xs); color: var(--hp-text-secondary); } }
      &__select { padding: var(--hp-spacing-2) var(--hp-spacing-3); border: 1px solid var(--hp-glass-border); border-radius: var(--hp-radius-modern-sm); background: var(--hp-surface-card); font-size: var(--hp-font-size-sm); color: var(--hp-text-primary); min-width: 120px; &:focus { outline: none; border-color: var(--hp-color-primary); } }
      &__channels-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--hp-spacing-4); @media (max-width: 767px) { grid-template-columns: 1fr; } }
      &__channel-header { display: flex; align-items: flex-start; gap: var(--hp-spacing-3); margin-bottom: var(--hp-spacing-4); }
      &__channel-icon { display: flex; padding: var(--hp-spacing-3); background: var(--hp-color-primary-100); border-radius: var(--hp-radius-modern-sm); color: var(--hp-color-primary); svg { width: 24px; height: 24px; } }
      &__channel-info { flex: 1; h4 { font-size: var(--hp-font-size-base); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); } p { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); margin: 0; } }
      &__channel-stats { display: flex; gap: var(--hp-spacing-4); padding: var(--hp-spacing-3) 0; border-top: 1px solid var(--hp-glass-border); border-bottom: 1px solid var(--hp-glass-border); margin-bottom: var(--hp-spacing-3); }
      &__stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
      &__stat-val { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); }
      &__stat-lbl { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }
      &__section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--hp-spacing-4); flex-wrap: wrap; gap: var(--hp-spacing-3); h2 { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); } p { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); margin: 0; } }
      &__thresholds { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__threshold { display: flex; align-items: center; gap: var(--hp-spacing-4); padding: var(--hp-spacing-4); background: var(--hp-surface-card); border: 1px solid var(--hp-glass-border); border-radius: var(--hp-radius-modern-md); flex-wrap: wrap; }
      &__threshold-main { display: flex; align-items: center; gap: var(--hp-spacing-3); flex: 1; min-width: 200px; }
      &__threshold-info { h4 { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); margin: 0 0 2px; } p { font-size: var(--hp-font-size-xs); color: var(--hp-text-secondary); margin: 0; } }
      &__threshold-rule { display: flex; align-items: center; gap: var(--hp-spacing-2); padding: var(--hp-spacing-2) var(--hp-spacing-3); background: var(--hp-glass-bg-subtle); border-radius: var(--hp-radius-modern-sm); }
      &__threshold-metric { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); }
      &__threshold-op { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-bold); color: var(--hp-color-primary); }
      &__threshold-val { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); }
      &__threshold-actions { display: flex; gap: var(--hp-spacing-2); }
      &__danger { color: var(--hp-color-danger); }
      &__history-card { padding: 0; overflow: hidden; }
      &__history-list { display: flex; flex-direction: column; }
      &__history-item { display: flex; align-items: flex-start; gap: var(--hp-spacing-3); padding: var(--hp-spacing-4); border-bottom: 1px solid var(--hp-glass-border); &:last-child { border-bottom: none; } }
      &__history-icon { display: flex; padding: var(--hp-spacing-2); border-radius: var(--hp-radius-modern-xs); &--email { background: var(--hp-color-primary-100); color: var(--hp-color-primary); } &--push { background: var(--hp-color-success-100); color: var(--hp-color-success); } &--sms { background: var(--hp-color-warning-100); color: var(--hp-color-warning); } &--in-app { background: var(--hp-color-info-100); color: var(--hp-color-info); } svg { width: 18px; height: 18px; } }
      &__history-content { flex: 1; h4 { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); margin: 0 0 2px; } p { font-size: var(--hp-font-size-xs); color: var(--hp-text-secondary); margin: 0 0 var(--hp-spacing-1); } }
      &__history-time { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); }
      &__filters { display: flex; gap: var(--hp-spacing-3); }
      &__actions { display: flex; justify-content: flex-end; gap: var(--hp-spacing-3); margin-top: var(--hp-spacing-6); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsSettingsComponent {
  activeTab = 'preferences';
  quietHoursEnabled = false;
  quietHoursStart = '10:00 PM';
  quietHoursEnd = '7:00 AM';
  timezone = 'America/New_York';
  historyFilter = 'all';

  tabs = [
    { id: 'preferences', label: 'Preferences', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>' },
    { id: 'channels', label: 'Channels', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>' },
    { id: 'thresholds', label: 'Alert Thresholds', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' },
    { id: 'history', label: 'History', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' }
  ];

  categories = ['Jobs & Scheduling', 'Customer Communication', 'Payments & Billing', 'Team & Admin'];

  notifications: NotificationSetting[] = [
    { id: '1', title: 'New Job Assigned', description: 'When a new job is assigned', category: 'Jobs & Scheduling', email: true, push: true, sms: false, inApp: true },
    { id: '2', title: 'Job Status Updates', description: 'When job status changes', category: 'Jobs & Scheduling', email: true, push: true, sms: false, inApp: true },
    { id: '3', title: 'Schedule Reminders', description: 'Upcoming job reminders', category: 'Jobs & Scheduling', email: false, push: true, sms: true, inApp: true },
    { id: '4', title: 'Customer Messages', description: 'New customer messages', category: 'Customer Communication', email: true, push: true, sms: true, inApp: true },
    { id: '5', title: 'Review Requests', description: 'Customer review submissions', category: 'Customer Communication', email: true, push: false, sms: false, inApp: true },
    { id: '6', title: 'Payment Received', description: 'Invoice payments', category: 'Payments & Billing', email: true, push: false, sms: false, inApp: true },
    { id: '7', title: 'Failed Payments', description: 'Payment failures', category: 'Payments & Billing', email: true, push: true, sms: true, inApp: true },
    { id: '8', title: 'Team Updates', description: 'Team member activity', category: 'Team & Admin', email: false, push: false, sms: false, inApp: true },
    { id: '9', title: 'Compliance Alerts', description: 'Expiring certifications', category: 'Team & Admin', email: true, push: true, sms: false, inApp: true }
  ];

  channels = [
    { name: 'Email', description: 'Send notifications via email', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>', enabled: true, sent: 1250, delivered: 1235, rate: 98.8, configurable: true },
    { name: 'Push', description: 'Browser & mobile push notifications', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>', enabled: true, sent: 3420, delivered: 3280, rate: 95.9, configurable: false },
    { name: 'SMS', description: 'Text message alerts', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>', enabled: true, sent: 450, delivered: 445, rate: 98.9, configurable: true },
    { name: 'In-App', description: 'Notifications within the app', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>', enabled: true, sent: 5600, delivered: 5600, rate: 100, configurable: false }
  ];

  thresholds: AlertThreshold[] = [
    { id: '1', name: 'Low SMS Credits', description: 'Alert when SMS credits drop below threshold', metric: 'SMS Credits', operator: 'lt', value: 100, unit: '', enabled: true },
    { id: '2', name: 'High Response Time', description: 'Alert on slow job response', metric: 'Avg Response Time', operator: 'gt', value: 4, unit: ' hrs', enabled: true },
    { id: '3', name: 'Storage Usage', description: 'Alert when storage exceeds limit', metric: 'Storage Used', operator: 'gt', value: 80, unit: '%', enabled: true },
    { id: '4', name: 'Failed Payments', description: 'Alert on multiple payment failures', metric: 'Failed Payments', operator: 'gt', value: 3, unit: '/day', enabled: false }
  ];

  history: NotificationHistory[] = [
    { id: '1', title: 'New Job Assigned', message: 'Plumbing repair at 123 Main St', channel: 'push', status: 'delivered', sentAt: new Date('2024-12-19T14:30:00') },
    { id: '2', title: 'Payment Received', message: '$150.00 from John Smith', channel: 'email', status: 'read', sentAt: new Date('2024-12-19T12:15:00') },
    { id: '3', title: 'Schedule Reminder', message: 'Job starting in 1 hour', channel: 'sms', status: 'delivered', sentAt: new Date('2024-12-19T09:00:00') },
    { id: '4', title: 'New Message', message: 'Customer replied to your quote', channel: 'in-app', status: 'read', sentAt: new Date('2024-12-18T16:45:00') },
    { id: '5', title: 'Failed Payment Alert', message: 'Payment attempt failed for INV-001', channel: 'email', status: 'delivered', sentAt: new Date('2024-12-18T11:20:00') }
  ];

  hours = ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];
  timezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix'];

  constructor(private sanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(html); }
  getNotificationsByCategory(cat: string): NotificationSetting[] { return this.notifications.filter(n => n.category === cat); }
  get filteredHistory(): NotificationHistory[] { return this.historyFilter === 'all' ? this.history : this.history.filter(h => h.channel === this.historyFilter); }
  getChannelIcon(channel: string): string {
    const icons: Record<string, string> = {
      email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      push: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path></svg>',
      sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      'in-app': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>'
    };
    return icons[channel] || '';
  }
  addThreshold(): void { console.log('Add threshold'); }
  saveSettings(): void { console.log('Saving settings'); }
}
