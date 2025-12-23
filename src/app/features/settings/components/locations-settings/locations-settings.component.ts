import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  manager?: string;
  status: 'active' | 'inactive';
  teamCount: number;
  createdAt: string;
}

@Component({
  selector: 'hp-locations-settings',
  template: `
    <div class="hp-locations-settings">
      <!-- Enterprise Badge -->
      <div class="hp-locations-settings__enterprise-badge">
        <hp-badge variant="primary">Enterprise Feature</hp-badge>
      </div>

      <!-- Add Location Section -->
      <hp-card class="hp-locations-settings__section">
        <div class="hp-locations-settings__header">
          <div>
            <h2 class="hp-locations-settings__section-title">Manage Locations</h2>
            <p class="hp-locations-settings__section-description">
              Add and manage your franchise locations. Each location can have its own team members and settings.
            </p>
          </div>
          <hp-button variant="primary" (click)="showAddModal = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 6px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Location
          </hp-button>
        </div>

        <!-- Search -->
        <div class="hp-locations-settings__search">
          <hp-input
            placeholder="Search locations..."
            [(ngModel)]="searchQuery"
            type="search"
          ></hp-input>
        </div>

        <!-- Locations List -->
        <div class="hp-locations-settings__list">
          <div
            *ngFor="let location of filteredLocations"
            class="hp-locations-settings__item"
            [class.hp-locations-settings__item--inactive]="location.status === 'inactive'"
          >
            <div class="hp-locations-settings__item-main">
              <div class="hp-locations-settings__item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="hp-locations-settings__item-info">
                <div class="hp-locations-settings__item-name">
                  {{ location.name }}
                  <hp-badge
                    [variant]="location.status === 'active' ? 'success' : 'secondary'"
                    size="sm"
                  >
                    {{ location.status }}
                  </hp-badge>
                </div>
                <div class="hp-locations-settings__item-address">
                  {{ location.address }}, {{ location.city }}, {{ location.state }} {{ location.zip }}
                </div>
                <div class="hp-locations-settings__item-meta">
                  <span>{{ location.teamCount }} team member{{ location.teamCount !== 1 ? 's' : '' }}</span>
                  <span *ngIf="location.manager">• Manager: {{ location.manager }}</span>
                </div>
              </div>
            </div>
            <div class="hp-locations-settings__item-actions">
              <hp-button variant="ghost" size="sm" (click)="editLocation(location)">Edit</hp-button>
              <button
                type="button"
                class="hp-locations-settings__item-menu"
                (click)="toggleMenu(location.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                *ngIf="openMenuId === location.id"
                class="hp-locations-settings__dropdown"
              >
                <button type="button" (click)="toggleLocationStatus(location)">
                  {{ location.status === 'active' ? 'Deactivate' : 'Activate' }} Location
                </button>
                <button
                  type="button"
                  class="hp-locations-settings__dropdown-danger"
                  (click)="deleteLocation(location)"
                >
                  Delete Location
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredLocations.length === 0" class="hp-locations-settings__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p>No locations found</p>
            <hp-button variant="outline" (click)="showAddModal = true">Add Your First Location</hp-button>
          </div>
        </div>
      </hp-card>

      <!-- Location Stats -->
      <hp-card class="hp-locations-settings__section">
        <h2 class="hp-locations-settings__section-title">Location Summary</h2>
        <div class="hp-locations-settings__stats">
          <div class="hp-locations-settings__stat">
            <span class="hp-locations-settings__stat-value">{{ locations.length }}</span>
            <span class="hp-locations-settings__stat-label">Total Locations</span>
          </div>
          <div class="hp-locations-settings__stat">
            <span class="hp-locations-settings__stat-value">{{ activeLocationsCount }}</span>
            <span class="hp-locations-settings__stat-label">Active</span>
          </div>
          <div class="hp-locations-settings__stat">
            <span class="hp-locations-settings__stat-value">{{ totalTeamMembers }}</span>
            <span class="hp-locations-settings__stat-label">Team Members</span>
          </div>
        </div>
      </hp-card>

      <!-- Add/Edit Modal -->
      <hp-modal
        *ngIf="showAddModal || showEditModal"
        [title]="showEditModal ? 'Edit Location' : 'Add New Location'"
        (close)="closeModal()"
      >
        <form [formGroup]="locationForm" (ngSubmit)="saveLocation()">
          <div class="hp-locations-settings__form-grid">
            <hp-input
              label="Location Name"
              formControlName="name"
              placeholder="e.g., HandyPro Downtown"
              [error]="getFormError('name')"
            ></hp-input>
            <hp-input
              label="Phone Number"
              formControlName="phone"
              placeholder="(555) 123-4567"
              [error]="getFormError('phone')"
            ></hp-input>
          </div>
          <hp-input
            label="Street Address"
            formControlName="address"
            placeholder="123 Main Street"
            [error]="getFormError('address')"
          ></hp-input>
          <div class="hp-locations-settings__form-grid hp-locations-settings__form-grid--3">
            <hp-input
              label="City"
              formControlName="city"
              placeholder="City"
              [error]="getFormError('city')"
            ></hp-input>
            <hp-input
              label="State"
              formControlName="state"
              placeholder="State"
              [error]="getFormError('state')"
            ></hp-input>
            <hp-input
              label="ZIP Code"
              formControlName="zip"
              placeholder="12345"
              [error]="getFormError('zip')"
            ></hp-input>
          </div>
          <div class="hp-locations-settings__form-actions">
            <hp-button variant="outline" type="button" (click)="closeModal()">Cancel</hp-button>
            <hp-button
              variant="primary"
              type="submit"
              [disabled]="locationForm.invalid"
              [loading]="isSaving"
            >
              {{ showEditModal ? 'Save Changes' : 'Add Location' }}
            </hp-button>
          </div>
        </form>
      </hp-modal>
    </div>
  `,
  styles: [`
    .hp-locations-settings {
      display: flex;
      flex-direction: column;
      gap: var(--hp-spacing-6);

      &__enterprise-badge {
        margin-bottom: var(--hp-spacing-2);
      }

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
          margin: 0;
        }
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__search {
        margin-bottom: var(--hp-spacing-4);
      }

      &__list {
        display: flex;
        flex-direction: column;
      }

      &__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-color-neutral-100);
        transition: background-color 150ms;

        &:hover {
          background-color: var(--hp-color-neutral-50);
        }

        &:last-child {
          border-bottom: none;
        }

        &--inactive {
          opacity: 0.6;
        }

        @media (max-width: 767px) {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--hp-spacing-3);
        }
      }

      &__item-main {
        display: flex;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        flex: 1;
      }

      &__item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background-color: var(--hp-color-primary-50);
        border-radius: var(--hp-radius-lg);
        flex-shrink: 0;

        svg {
          width: 22px;
          height: 22px;
          color: var(--hp-color-primary);
        }
      }

      &__item-info {
        flex: 1;
        min-width: 0;
      }

      &__item-name {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-900);
        margin-bottom: var(--hp-spacing-1);
      }

      &__item-address {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        margin-bottom: var(--hp-spacing-1);
      }

      &__item-meta {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__item-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        position: relative;

        @media (max-width: 767px) {
          width: 100%;
          justify-content: flex-end;
        }
      }

      &__item-menu {
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
        min-width: 180px;
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
        padding: var(--hp-spacing-10);
        color: var(--hp-color-neutral-400);

        svg {
          width: 48px;
          height: 48px;
          margin-bottom: var(--hp-spacing-3);
        }

        p {
          margin: 0 0 var(--hp-spacing-4);
          font-size: var(--hp-font-size-sm);
        }
      }

      &__stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__stat {
        text-align: center;
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-md);
      }

      &__stat-value {
        display: block;
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-color-primary);
      }

      &__stat-label {
        display: block;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-500);
        margin-top: var(--hp-spacing-1);
      }

      &__form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);

        &--3 {
          grid-template-columns: 2fr 1fr 1fr;
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--hp-spacing-3);
        margin-top: var(--hp-spacing-6);
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-color-neutral-100);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationsSettingsComponent {
  locationForm: FormGroup;
  searchQuery = '';
  openMenuId: string | null = null;
  showAddModal = false;
  showEditModal = false;
  isSaving = false;
  editingLocationId: string | null = null;

  locations: Location[] = [
    {
      id: '1',
      name: 'HandyPro Downtown',
      address: '123 Main Street',
      city: 'Atlanta',
      state: 'GA',
      zip: '30301',
      phone: '(404) 555-0101',
      manager: 'John Smith',
      status: 'active',
      teamCount: 12,
      createdAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'HandyPro Midtown',
      address: '456 Peachtree Ave',
      city: 'Atlanta',
      state: 'GA',
      zip: '30308',
      phone: '(404) 555-0102',
      manager: 'Sarah Johnson',
      status: 'active',
      teamCount: 8,
      createdAt: '2023-03-20'
    },
    {
      id: '3',
      name: 'HandyPro Buckhead',
      address: '789 Lenox Road',
      city: 'Atlanta',
      state: 'GA',
      zip: '30326',
      phone: '(404) 555-0103',
      manager: 'Mike Wilson',
      status: 'active',
      teamCount: 15,
      createdAt: '2023-06-10'
    },
    {
      id: '4',
      name: 'HandyPro Decatur',
      address: '321 College Ave',
      city: 'Decatur',
      state: 'GA',
      zip: '30030',
      phone: '(404) 555-0104',
      status: 'inactive',
      teamCount: 0,
      createdAt: '2023-09-01'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      phone: ['', [Validators.required]]
    });
  }

  get filteredLocations(): Location[] {
    if (!this.searchQuery) {
      return this.locations;
    }
    const query = this.searchQuery.toLowerCase();
    return this.locations.filter(l =>
      l.name.toLowerCase().includes(query) ||
      l.city.toLowerCase().includes(query) ||
      l.address.toLowerCase().includes(query)
    );
  }

  get activeLocationsCount(): number {
    return this.locations.filter(l => l.status === 'active').length;
  }

  get totalTeamMembers(): number {
    return this.locations.reduce((sum, l) => sum + l.teamCount, 0);
  }

  getFormError(field: string): string {
    const control = this.locationForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }
    return '';
  }

  toggleMenu(locationId: string): void {
    this.openMenuId = this.openMenuId === locationId ? null : locationId;
  }

  editLocation(location: Location): void {
    this.editingLocationId = location.id;
    this.locationForm.patchValue({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zip: location.zip,
      phone: location.phone
    });
    this.showEditModal = true;
  }

  toggleLocationStatus(location: Location): void {
    this.openMenuId = null;
    location.status = location.status === 'active' ? 'inactive' : 'active';
    this.cdr.markForCheck();
  }

  deleteLocation(location: Location): void {
    this.openMenuId = null;
    this.locations = this.locations.filter(l => l.id !== location.id);
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.editingLocationId = null;
    this.locationForm.reset();
  }

  saveLocation(): void {
    if (this.locationForm.valid) {
      this.isSaving = true;
      this.cdr.markForCheck();

      setTimeout(() => {
        if (this.showEditModal && this.editingLocationId) {
          const index = this.locations.findIndex(l => l.id === this.editingLocationId);
          if (index > -1) {
            this.locations[index] = {
              ...this.locations[index],
              ...this.locationForm.value
            };
          }
        } else {
          const newLocation: Location = {
            id: Date.now().toString(),
            ...this.locationForm.value,
            status: 'active',
            teamCount: 0,
            createdAt: new Date().toISOString()
          };
          this.locations = [...this.locations, newLocation];
        }
        this.isSaving = false;
        this.closeModal();
        this.cdr.markForCheck();
      }, 1000);
    }
  }
}
