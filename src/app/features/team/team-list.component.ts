import { Component, ChangeDetectionStrategy } from '@angular/core';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'manager' | 'technician';
  status: 'active' | 'offline' | 'on_job';
  avatar?: string;
  jobsCompleted: number;
  rating: number;
  currentJob?: { id: string; title: string; customer: string };
  skills: string[];
  joinedAt: string;
}

@Component({
  selector: 'hp-team-list',
  template: `
    <div class="hp-team">
      <div class="hp-team__header">
        <div class="hp-team__header-left">
          <h1 class="hp-team__title">Team</h1>
          <p class="hp-team__subtitle">Manage your technicians and staff</p>
        </div>
        <hp-button variant="primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Add Team Member
        </hp-button>
      </div>

      <div class="hp-team__stats">
        <div class="hp-team__stat">
          <span class="hp-team__stat-value">{{ stats.total }}</span>
          <span class="hp-team__stat-label">Total Members</span>
        </div>
        <div class="hp-team__stat">
          <span class="hp-team__stat-value hp-team__stat-value--active">{{ stats.active }}</span>
          <span class="hp-team__stat-label">Active Now</span>
        </div>
        <div class="hp-team__stat">
          <span class="hp-team__stat-value">{{ stats.onJob }}</span>
          <span class="hp-team__stat-label">On Job</span>
        </div>
        <div class="hp-team__stat">
          <span class="hp-team__stat-value">{{ stats.avgRating }}</span>
          <span class="hp-team__stat-label">Avg Rating</span>
        </div>
      </div>

      <hp-card class="hp-team__filters">
        <div class="hp-team__filters-row">
          <div class="hp-team__search">
            <hp-input placeholder="Search team members..." [(ngModel)]="searchQuery" type="search"></hp-input>
          </div>
          <div class="hp-team__filter-group">
            <select [(ngModel)]="roleFilter" class="hp-team__select">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="technician">Technician</option>
            </select>
            <select [(ngModel)]="statusFilter" class="hp-team__select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on_job">On Job</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </hp-card>

      <div class="hp-team__grid">
        <hp-card *ngFor="let member of filteredMembers" class="hp-team__card">
          <div class="hp-team__card-header">
            <div class="hp-team__card-avatar" [class.hp-team__card-avatar--active]="member.status === 'active'" [class.hp-team__card-avatar--on-job]="member.status === 'on_job'">
              {{ getInitials(member.name) }}
              <span class="hp-team__card-status-dot"></span>
            </div>
            <div class="hp-team__card-info">
              <div class="hp-team__card-name">{{ member.name }}</div>
              <div class="hp-team__card-role">{{ member.role | titlecase }}</div>
            </div>
            <button class="hp-team__card-menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>

          <div class="hp-team__card-contact">
            <a href="mailto:{{ member.email }}">{{ member.email }}</a>
            <a href="tel:{{ member.phone }}">{{ member.phone }}</a>
          </div>

          <div *ngIf="member.currentJob" class="hp-team__card-current-job">
            <span class="hp-team__card-current-label">Currently working on:</span>
            <span class="hp-team__card-current-title">{{ member.currentJob.title }}</span>
            <span class="hp-team__card-current-customer">{{ member.currentJob.customer }}</span>
          </div>

          <div class="hp-team__card-stats">
            <div class="hp-team__card-stat">
              <span class="hp-team__card-stat-value">{{ member.jobsCompleted }}</span>
              <span class="hp-team__card-stat-label">Jobs</span>
            </div>
            <div class="hp-team__card-stat">
              <span class="hp-team__card-stat-value">{{ member.rating }}</span>
              <span class="hp-team__card-stat-label">Rating</span>
            </div>
          </div>

          <div class="hp-team__card-skills">
            <span *ngFor="let skill of member.skills" class="hp-team__card-skill">{{ skill }}</span>
          </div>

          <div class="hp-team__card-actions">
            <hp-button variant="outline" size="sm" [fullWidth]="true">View Profile</hp-button>
            <hp-button variant="outline" size="sm" [fullWidth]="true">Assign Job</hp-button>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-team {
      &__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--hp-spacing-6); @media (max-width: 575px) { flex-direction: column; gap: var(--hp-spacing-4); } }
      &__title { font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); margin: 0 0 var(--hp-spacing-1); transition: color 200ms ease-in-out; }
      &__subtitle { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); margin: 0; transition: color 200ms ease-in-out; }
      &__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--hp-spacing-4); margin-bottom: var(--hp-spacing-6); @media (max-width: 767px) { grid-template-columns: repeat(2, 1fr); } }
      &__stat { background-color: var(--hp-surface-card); border-radius: var(--hp-radius-lg); padding: var(--hp-spacing-4); transition: background-color 200ms ease-in-out; }
      &__stat-value { display: block; font-size: var(--hp-font-size-2xl); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; &--active { color: var(--hp-color-success); } }
      &__stat-label { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__filters { margin-bottom: var(--hp-spacing-6); }
      &__filters-row { display: flex; gap: var(--hp-spacing-4); align-items: center; @media (max-width: 767px) { flex-direction: column; align-items: stretch; } }
      &__search { flex: 1; min-width: 200px; }
      &__filter-group { display: flex; gap: var(--hp-spacing-3); }
      &__select { height: 44px; padding: 0 var(--hp-spacing-3); border: 1px solid var(--hp-input-border); border-radius: var(--hp-radius-md); background-color: var(--hp-input-bg); color: var(--hp-text-primary); font-size: var(--hp-font-size-sm); min-width: 140px; transition: background-color 200ms, border-color 200ms, color 200ms; }
      &__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--hp-spacing-4); @media (max-width: 1199px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 767px) { grid-template-columns: 1fr; } }
      &__card { display: flex; flex-direction: column; gap: var(--hp-spacing-4); }
      &__card-header { display: flex; align-items: flex-start; gap: var(--hp-spacing-3); }
      &__card-avatar { position: relative; width: 48px; height: 48px; border-radius: 50%; background-color: var(--hp-text-disabled); color: white; font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-semibold); display: flex; align-items: center; justify-content: center; transition: background-color 200ms ease-in-out; &--active { background-color: var(--hp-color-success); } &--on-job { background-color: var(--hp-color-primary); } }
      &__card-status-dot { position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--hp-surface-card); background-color: var(--hp-text-disabled); transition: border-color 200ms, background-color 200ms; .hp-team__card-avatar--active & { background-color: var(--hp-color-success); } .hp-team__card-avatar--on-job & { background-color: var(--hp-color-warning); } }
      &__card-info { flex: 1; }
      &__card-name { font-size: var(--hp-font-size-base); font-weight: var(--hp-font-weight-semibold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__card-role { font-size: var(--hp-font-size-sm); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__card-menu { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; background: none; border: none; border-radius: var(--hp-radius-md); color: var(--hp-text-tertiary); cursor: pointer; transition: background-color 200ms, color 200ms; &:hover { background-color: var(--hp-bg-tertiary); color: var(--hp-text-secondary); } svg { width: 18px; height: 18px; } }
      &__card-contact { display: flex; flex-direction: column; gap: var(--hp-spacing-1); a { font-size: var(--hp-font-size-sm); color: var(--hp-text-secondary); text-decoration: none; transition: color 200ms ease-in-out; &:hover { color: var(--hp-color-primary); } } }
      &__card-current-job { padding: var(--hp-spacing-3); background-color: var(--hp-color-primary-50); border-radius: var(--hp-radius-md); border-left: 3px solid var(--hp-color-primary); }
      &__card-current-label { display: block; font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); margin-bottom: var(--hp-spacing-1); transition: color 200ms ease-in-out; }
      &__card-current-title { display: block; font-size: var(--hp-font-size-sm); font-weight: var(--hp-font-weight-medium); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__card-current-customer { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__card-stats { display: flex; gap: var(--hp-spacing-6); }
      &__card-stat { text-align: center; }
      &__card-stat-value { display: block; font-size: var(--hp-font-size-lg); font-weight: var(--hp-font-weight-bold); color: var(--hp-text-primary); transition: color 200ms ease-in-out; }
      &__card-stat-label { font-size: var(--hp-font-size-xs); color: var(--hp-text-tertiary); transition: color 200ms ease-in-out; }
      &__card-skills { display: flex; flex-wrap: wrap; gap: var(--hp-spacing-1); }
      &__card-skill { font-size: var(--hp-font-size-xs); color: var(--hp-text-secondary); background-color: var(--hp-bg-tertiary); padding: 2px var(--hp-spacing-2); border-radius: var(--hp-radius-sm); transition: background-color 200ms, color 200ms; }
      &__card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--hp-spacing-2); margin-top: auto; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamListComponent {
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';

  stats = { total: 8, active: 5, onJob: 3, avgRating: 4.8 };

  members: TeamMember[] = [
    { id: '1', name: 'Mike Wilson', email: 'mike@acmeplumbing.com', phone: '(555) 111-2222', role: 'technician', status: 'on_job', jobsCompleted: 245, rating: 4.9, currentJob: { id: 'j1', title: 'Water Heater Replacement', customer: 'John Smith' }, skills: ['Plumbing', 'Water Heaters', 'Gas Lines'], joinedAt: '2022-03-15' },
    { id: '2', name: 'Emily Brown', email: 'emily@acmeplumbing.com', phone: '(555) 222-3333', role: 'technician', status: 'on_job', jobsCompleted: 189, rating: 4.8, currentJob: { id: 'j2', title: 'Bathroom Renovation', customer: 'Michael Brown' }, skills: ['Plumbing', 'Fixtures', 'Renovations'], joinedAt: '2022-06-20' },
    { id: '3', name: 'Alex Martinez', email: 'alex@acmeplumbing.com', phone: '(555) 333-4444', role: 'technician', status: 'active', jobsCompleted: 156, rating: 4.7, skills: ['Plumbing', 'Drain Cleaning', 'Inspections'], joinedAt: '2023-01-10' },
    { id: '4', name: 'Sarah Johnson', email: 'sarah@acmeplumbing.com', phone: '(555) 444-5555', role: 'admin', status: 'active', jobsCompleted: 0, rating: 0, skills: ['Scheduling', 'Customer Service'], joinedAt: '2022-01-05' },
    { id: '5', name: 'David Lee', email: 'david@acmeplumbing.com', phone: '(555) 555-6666', role: 'manager', status: 'active', jobsCompleted: 312, rating: 4.9, skills: ['Plumbing', 'Management', 'Training'], joinedAt: '2021-08-15' },
    { id: '6', name: 'Jennifer Garcia', email: 'jennifer@acmeplumbing.com', phone: '(555) 666-7777', role: 'technician', status: 'on_job', jobsCompleted: 98, rating: 4.6, currentJob: { id: 'j3', title: 'Sewer Line Repair', customer: 'Springfield Mall' }, skills: ['Plumbing', 'Sewer Lines', 'Emergency'], joinedAt: '2023-06-01' }
  ];

  get filteredMembers(): TeamMember[] {
    return this.members.filter(m => {
      const matchesSearch = !this.searchQuery || m.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || m.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesRole = !this.roleFilter || m.role === this.roleFilter;
      const matchesStatus = !this.statusFilter || m.status === this.statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getInitials(name: string): string { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
}
