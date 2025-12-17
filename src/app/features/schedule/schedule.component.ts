import { Component, ChangeDetectionStrategy } from '@angular/core';

interface ScheduleEvent {
  id: string;
  title: string;
  customer: string;
  address: string;
  time: string;
  duration: string;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Component({
  selector: 'hp-schedule',
  template: `
    <div class="hp-schedule">
      <div class="hp-schedule__header">
        <div class="hp-schedule__header-left">
          <h1 class="hp-schedule__title">Schedule</h1>
          <p class="hp-schedule__subtitle">Manage your team's schedule and appointments</p>
        </div>
        <div class="hp-schedule__header-actions">
          <hp-button variant="outline" (click)="viewToday()">Today</hp-button>
          <hp-button variant="primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Event
          </hp-button>
        </div>
      </div>

      <!-- Calendar Navigation -->
      <hp-card class="hp-schedule__nav">
        <div class="hp-schedule__nav-row">
          <div class="hp-schedule__nav-controls">
            <button class="hp-schedule__nav-btn" (click)="previousWeek()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span class="hp-schedule__nav-date">{{ currentWeekLabel }}</span>
            <button class="hp-schedule__nav-btn" (click)="nextWeek()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div class="hp-schedule__view-toggle">
            <button [class.active]="view === 'week'" (click)="view = 'week'">Week</button>
            <button [class.active]="view === 'day'" (click)="view = 'day'">Day</button>
            <button [class.active]="view === 'list'" (click)="view = 'list'">List</button>
          </div>
          <div class="hp-schedule__filter">
            <select [(ngModel)]="technicianFilter" class="hp-schedule__select">
              <option value="">All Technicians</option>
              <option *ngFor="let tech of technicians" [value]="tech.id">{{ tech.name }}</option>
            </select>
          </div>
        </div>
      </hp-card>

      <!-- Week View -->
      <div class="hp-schedule__calendar">
        <div class="hp-schedule__calendar-header">
          <div class="hp-schedule__calendar-time-col"></div>
          <div *ngFor="let day of weekDays" class="hp-schedule__calendar-day-col"
               [class.hp-schedule__calendar-day-col--today]="day.isToday">
            <span class="hp-schedule__calendar-day-name">{{ day.name }}</span>
            <span class="hp-schedule__calendar-day-date">{{ day.date }}</span>
          </div>
        </div>

        <div class="hp-schedule__calendar-body">
          <div *ngFor="let hour of hours" class="hp-schedule__calendar-row">
            <div class="hp-schedule__calendar-time">{{ hour }}</div>
            <div *ngFor="let day of weekDays" class="hp-schedule__calendar-cell"
                 [class.hp-schedule__calendar-cell--today]="day.isToday">
              <div *ngFor="let event of getEventsForSlot(day.dateKey, hour)"
                   class="hp-schedule__event"
                   [class.hp-schedule__event--urgent]="event.priority === 'urgent'"
                   [class.hp-schedule__event--high]="event.priority === 'high'"
                   [class.hp-schedule__event--in-progress]="event.status === 'in_progress'"
                   [class.hp-schedule__event--completed]="event.status === 'completed'"
                   (click)="openEvent(event)">
                <div class="hp-schedule__event-time">{{ event.time }}</div>
                <div class="hp-schedule__event-title">{{ event.title }}</div>
                <div class="hp-schedule__event-customer">{{ event.customer }}</div>
                <div class="hp-schedule__event-tech">{{ event.technician }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Summary -->
      <div class="hp-schedule__summary">
        <hp-card>
          <h3 class="hp-schedule__summary-title">Today's Overview</h3>
          <div class="hp-schedule__summary-stats">
            <div class="hp-schedule__summary-stat">
              <span class="hp-schedule__summary-value">{{ todayStats.scheduled }}</span>
              <span class="hp-schedule__summary-label">Scheduled</span>
            </div>
            <div class="hp-schedule__summary-stat">
              <span class="hp-schedule__summary-value">{{ todayStats.inProgress }}</span>
              <span class="hp-schedule__summary-label">In Progress</span>
            </div>
            <div class="hp-schedule__summary-stat">
              <span class="hp-schedule__summary-value">{{ todayStats.completed }}</span>
              <span class="hp-schedule__summary-label">Completed</span>
            </div>
            <div class="hp-schedule__summary-stat">
              <span class="hp-schedule__summary-value">{{ todayStats.techsWorking }}</span>
              <span class="hp-schedule__summary-label">Techs Working</span>
            </div>
          </div>
        </hp-card>

        <hp-card>
          <h3 class="hp-schedule__summary-title">Upcoming Jobs</h3>
          <div class="hp-schedule__upcoming">
            <div *ngFor="let event of upcomingEvents" class="hp-schedule__upcoming-item">
              <div class="hp-schedule__upcoming-time">{{ event.time }}</div>
              <div class="hp-schedule__upcoming-info">
                <span class="hp-schedule__upcoming-title">{{ event.title }}</span>
                <span class="hp-schedule__upcoming-customer">{{ event.customer }}</span>
              </div>
              <hp-badge [variant]="event.priority === 'urgent' ? 'error' : 'neutral'" size="sm">
                {{ event.priority | titlecase }}
              </hp-badge>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-schedule {
      &__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--hp-spacing-6); @media (max-width: 767px) { flex-direction: column; gap: var(--hp-spacing-4); } }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); transition: color 200ms ease-in-out; }
      &__subtitle { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); margin: 0; transition: color 200ms ease-in-out; }
      &__header-actions { display: flex; gap: var(--hp-spacing-3); }
      &__nav { margin-bottom: var(--hp-spacing-4); }
      &__nav-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--hp-spacing-4); }
      &__nav-controls { display: flex; align-items: center; gap: var(--hp-spacing-3); }
      &__nav-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; padding: 0; background: none; border: 1px solid var(--hp-input-border); border-radius: var(--hp-radius-md); color: var(--hp-text-secondary); cursor: pointer; transition: background-color 200ms, border-color 200ms, color 200ms; &:hover { background-color: var(--hp-bg-tertiary); } svg { width: 18px; height: 18px; } }
      &__nav-date { font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); min-width: 200px; text-align: center; transition: color 200ms ease-in-out; }
      &__view-toggle { display: flex; border: 1px solid var(--hp-input-border); border-radius: var(--hp-radius-md); overflow: hidden; transition: border-color 200ms ease-in-out; button { padding: var(--hp-spacing-2) var(--hp-spacing-4); background: none; border: none; font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); cursor: pointer; transition: background-color 200ms, color 200ms; &.active { background-color: var(--hp-color-primary); color: white; } &:hover:not(.active) { background-color: var(--hp-bg-tertiary); } } }
      &__select { height: 36px; padding: 0 var(--hp-spacing-3); border: 1px solid var(--hp-input-border); border-radius: var(--hp-radius-md); background-color: var(--hp-input-bg); color: var(--hp-text-primary); font-size: var(--hp-font-size-sm); min-width: 160px; transition: background-color 200ms, border-color 200ms, color 200ms; }
      &__calendar { background: var(--hp-surface-card); border-radius: var(--hp-radius-lg); border: 1px solid var(--hp-border-primary); overflow: hidden; margin-bottom: var(--hp-spacing-6); transition: background-color 200ms, border-color 200ms; }
      &__calendar-header { display: grid; grid-template-columns: 60px repeat(7, 1fr); border-bottom: 1px solid var(--hp-border-primary); transition: border-color 200ms ease-in-out; }
      &__calendar-time-col { padding: var(--hp-spacing-3); background-color: var(--hp-bg-tertiary); transition: background-color 200ms ease-in-out; }
      &__calendar-day-col { padding: var(--hp-spacing-3); text-align: center; background-color: var(--hp-bg-tertiary); border-left: 1px solid var(--hp-border-primary); transition: background-color 200ms, border-color 200ms; &--today { background-color: var(--hp-color-primary-50); } }
      &__calendar-day-name { display: block; font-size: var(--hp-font-size-xs); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-tertiary); text-transform: uppercase; transition: color 200ms ease-in-out; }
      &__calendar-day-date { display: block; font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__calendar-body { max-height: 500px; overflow-y: auto; }
      &__calendar-row { display: grid; grid-template-columns: 60px repeat(7, 1fr); border-bottom: 1px solid var(--hp-border-primary); min-height: 80px; transition: border-color 200ms ease-in-out; }
      &__calendar-time { padding: var(--hp-spacing-2); font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); text-align: right; background-color: var(--hp-bg-tertiary); transition: background-color 200ms, color 200ms; }
      &__calendar-cell { border-left: 1px solid var(--hp-border-primary); padding: var(--hp-spacing-1); transition: border-color 200ms, background-color 200ms; &--today { background-color: var(--hp-color-primary-50); } }
      &__event { padding: var(--hp-spacing-2); background-color: var(--hp-color-primary-100); border-left: 3px solid var(--hp-color-primary); border-radius: var(--hp-radius-sm); margin-bottom: var(--hp-spacing-1); cursor: pointer; font-size: var(--hp-font-size-xs); &:hover { background-color: var(--hp-color-primary-200); } &--urgent { background-color: var(--hp-color-error-100); border-color: var(--hp-color-error); } &--high { background-color: var(--hp-color-warning-100); border-color: var(--hp-color-warning); } &--completed { opacity: 0.6; } }
      &__event-time { font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-secondary); }
      &__event-title { font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      &__event-customer, &__event-tech { color: var(--hp-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      &__summary { display: grid; grid-template-columns: 1fr 1fr; gap: var(--hp-spacing-4); @media (max-width: 767px) { grid-template-columns: 1fr; } }
      &__summary-title { font-size: var(--hp-font-size-base); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-4); transition: color 200ms ease-in-out; }
      &__summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); }
      &__summary-stat { text-align: center; }
      &__summary-value { display: block; font-size: var(--hp-font-size-xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__summary-label { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__upcoming { display: flex; flex-direction: column; gap: var(--hp-spacing-3); }
      &__upcoming-item { display: flex; align-items: center; gap: var(--hp-spacing-3); padding: var(--hp-spacing-2) 0; border-bottom: 1px solid var(--hp-border-primary); transition: border-color 200ms ease-in-out; &:last-child { border: none; } }
      &__upcoming-time { font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-semibold); color: var(--hp-color-primary); min-width: 80px; }
      &__upcoming-info { flex: 1; }
      &__upcoming-title { display: block; font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__upcoming-customer { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent {
  view: 'week' | 'day' | 'list' = 'week';
  technicianFilter = '';
  currentWeekLabel = 'December 15 - 21, 2024';

  technicians = [
    { id: '1', name: 'Mike Wilson' },
    { id: '2', name: 'Emily Brown' },
    { id: '3', name: 'Alex Martinez' }
  ];

  weekDays = [
    { name: 'Sun', date: '15', dateKey: '2024-12-15', isToday: false },
    { name: 'Mon', date: '16', dateKey: '2024-12-16', isToday: false },
    { name: 'Tue', date: '17', dateKey: '2024-12-17', isToday: true },
    { name: 'Wed', date: '18', dateKey: '2024-12-18', isToday: false },
    { name: 'Thu', date: '19', dateKey: '2024-12-19', isToday: false },
    { name: 'Fri', date: '20', dateKey: '2024-12-20', isToday: false },
    { name: 'Sat', date: '21', dateKey: '2024-12-21', isToday: false }
  ];

  hours = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  events: ScheduleEvent[] = [
    { id: '1', title: 'Water Heater Replacement', customer: 'John Smith', address: '123 Oak St', time: '9:00 AM', duration: '3h', technician: 'Mike W.', status: 'in_progress', priority: 'high' },
    { id: '2', title: 'Kitchen Faucet Install', customer: 'Sarah Johnson', address: '456 Maple Ave', time: '2:00 PM', duration: '2h', technician: 'Mike W.', status: 'scheduled', priority: 'medium' },
    { id: '3', title: 'Emergency Pipe Repair', customer: 'Lisa Anderson', address: '321 Elm St', time: '7:00 AM', duration: '2h', technician: 'Alex M.', status: 'completed', priority: 'urgent' },
    { id: '4', title: 'Drain Cleaning', customer: 'Robert Davis', address: '789 Pine Rd', time: '10:00 AM', duration: '1.5h', technician: 'Emily B.', status: 'scheduled', priority: 'low' }
  ];

  todayStats = { scheduled: 8, inProgress: 3, completed: 2, techsWorking: 4 };

  upcomingEvents = [
    { time: '2:00 PM', title: 'Kitchen Faucet Install', customer: 'Sarah Johnson', priority: 'medium' },
    { time: '3:30 PM', title: 'Toilet Repair', customer: 'Michael Brown', priority: 'low' },
    { time: '4:30 PM', title: 'Water Heater Inspection', customer: 'Jennifer Wilson', priority: 'high' }
  ];

  getEventsForSlot(dateKey: string, hour: string): ScheduleEvent[] {
    if (dateKey === '2024-12-17') {
      return this.events.filter(e => e.time === hour);
    }
    return [];
  }

  viewToday(): void { console.log('View today'); }
  previousWeek(): void { console.log('Previous week'); }
  nextWeek(): void { console.log('Next week'); }
  openEvent(event: ScheduleEvent): void { console.log('Open event', event.id); }
}
