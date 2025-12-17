import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
}

@Component({
  selector: 'hp-branding-settings',
  template: `
    <div class="hp-branding-settings">
      <!-- Logo Section -->
      <hp-card class="hp-branding-settings__section">
        <h2 class="hp-branding-settings__section-title">Company Logo</h2>
        <p class="hp-branding-settings__section-description">
          Upload your company logo. It will appear on invoices, quotes, and your customer portal.
        </p>

        <div class="hp-branding-settings__logos">
          <div class="hp-branding-settings__logo-item">
            <span class="hp-branding-settings__logo-label">Primary Logo</span>
            <div
              class="hp-branding-settings__logo-upload"
              [class.hp-branding-settings__logo-upload--has-image]="primaryLogo"
              (click)="uploadLogo('primary')"
            >
              <img *ngIf="primaryLogo" [src]="primaryLogo" alt="Primary logo" />
              <div *ngIf="!primaryLogo" class="hp-branding-settings__logo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Upload Logo</span>
                <span class="hp-branding-settings__logo-hint">PNG, SVG up to 2MB</span>
              </div>
            </div>
            <hp-button *ngIf="primaryLogo" variant="ghost" size="sm" (click)="removeLogo('primary')">
              Remove
            </hp-button>
          </div>

          <div class="hp-branding-settings__logo-item">
            <span class="hp-branding-settings__logo-label">Favicon</span>
            <div
              class="hp-branding-settings__logo-upload hp-branding-settings__logo-upload--small"
              [class.hp-branding-settings__logo-upload--has-image]="favicon"
              (click)="uploadLogo('favicon')"
            >
              <img *ngIf="favicon" [src]="favicon" alt="Favicon" />
              <div *ngIf="!favicon" class="hp-branding-settings__logo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
              </div>
            </div>
            <hp-button *ngIf="favicon" variant="ghost" size="sm" (click)="removeLogo('favicon')">
              Remove
            </hp-button>
          </div>
        </div>
      </hp-card>

      <!-- Colors Section -->
      <hp-card class="hp-branding-settings__section">
        <h2 class="hp-branding-settings__section-title">Brand Colors</h2>
        <p class="hp-branding-settings__section-description">
          Choose colors that represent your brand. These will be used throughout your workspace.
        </p>

        <!-- Color Presets -->
        <div class="hp-branding-settings__presets">
          <span class="hp-branding-settings__presets-label">Quick Presets</span>
          <div class="hp-branding-settings__presets-grid">
            <button
              *ngFor="let preset of colorPresets"
              type="button"
              class="hp-branding-settings__preset"
              [class.hp-branding-settings__preset--selected]="selectedPreset === preset.name"
              (click)="selectPreset(preset)"
            >
              <span
                class="hp-branding-settings__preset-swatch"
                [style.background]="'linear-gradient(135deg, ' + preset.primary + ' 50%, ' + preset.secondary + ' 50%)'"
              ></span>
              <span class="hp-branding-settings__preset-name">{{ preset.name }}</span>
            </button>
          </div>
        </div>

        <!-- Custom Colors -->
        <form [formGroup]="colorForm" class="hp-branding-settings__colors">
          <div class="hp-branding-settings__color-row">
            <div class="hp-branding-settings__color-field">
              <label class="hp-branding-settings__color-label">Primary Color</label>
              <div class="hp-branding-settings__color-input">
                <input
                  type="color"
                  formControlName="primaryColor"
                  class="hp-branding-settings__color-picker"
                />
                <input
                  type="text"
                  formControlName="primaryColor"
                  class="hp-branding-settings__color-text"
                  maxlength="7"
                />
              </div>
            </div>
            <div class="hp-branding-settings__color-field">
              <label class="hp-branding-settings__color-label">Secondary Color</label>
              <div class="hp-branding-settings__color-input">
                <input
                  type="color"
                  formControlName="secondaryColor"
                  class="hp-branding-settings__color-picker"
                />
                <input
                  type="text"
                  formControlName="secondaryColor"
                  class="hp-branding-settings__color-text"
                  maxlength="7"
                />
              </div>
            </div>
          </div>
        </form>
      </hp-card>

      <!-- Preview Section -->
      <hp-card class="hp-branding-settings__section">
        <h2 class="hp-branding-settings__section-title">Preview</h2>
        <p class="hp-branding-settings__section-description">
          See how your branding will look in your customer-facing pages.
        </p>

        <div class="hp-branding-settings__preview" [style.--preview-primary]="colorForm.value.primaryColor" [style.--preview-secondary]="colorForm.value.secondaryColor">
          <div class="hp-branding-settings__preview-header">
            <div class="hp-branding-settings__preview-logo">
              <img *ngIf="primaryLogo" [src]="primaryLogo" alt="Logo preview" />
              <span *ngIf="!primaryLogo">Your Logo</span>
            </div>
            <div class="hp-branding-settings__preview-nav">
              <span>Home</span>
              <span>Services</span>
              <span>Contact</span>
            </div>
          </div>
          <div class="hp-branding-settings__preview-content">
            <div class="hp-branding-settings__preview-hero">
              <h3>Professional Home Services</h3>
              <p>Quality work you can trust</p>
              <button class="hp-branding-settings__preview-btn">Get a Quote</button>
            </div>
          </div>
        </div>
      </hp-card>

      <!-- Save Actions -->
      <div class="hp-branding-settings__actions">
        <hp-button variant="outline" (click)="resetToDefaults()">
          Reset to Defaults
        </hp-button>
        <hp-button variant="primary" [loading]="isSaving" (click)="saveBranding()">
          Save Changes
        </hp-button>
      </div>
    </div>
  `,
  styles: [`
    .hp-branding-settings {
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

      &__logos {
        display: flex;
        gap: var(--hp-spacing-6);
        flex-wrap: wrap;
      }

      &__logo-item {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__logo-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
      }

      &__logo-upload {
        width: 200px;
        height: 120px;
        border: 2px dashed var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 150ms, background-color 150ms;
        overflow: hidden;

        &:hover {
          border-color: var(--hp-color-primary);
          background-color: var(--hp-color-primary-50);
        }

        &--small {
          width: 80px;
          height: 80px;
        }

        &--has-image {
          border-style: solid;
          border-color: var(--hp-color-neutral-200);

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: var(--hp-spacing-2);
          }
        }
      }

      &__logo-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        color: var(--hp-color-neutral-400);

        svg {
          width: 32px;
          height: 32px;
        }

        span {
          font-size: var(--hp-font-size-sm);
        }
      }

      &__logo-hint {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-400);
      }

      &__presets {
        margin-bottom: var(--hp-spacing-6);
      }

      &__presets-label {
        display: block;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
        margin-bottom: var(--hp-spacing-3);
      }

      &__presets-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--hp-spacing-3);
      }

      &__preset {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-3);
        background: none;
        border: 2px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-md);
        cursor: pointer;
        transition: border-color 150ms;

        &:hover {
          border-color: var(--hp-color-neutral-400);
        }

        &--selected {
          border-color: var(--hp-color-primary);
          background-color: var(--hp-color-primary-50);
        }
      }

      &__preset-swatch {
        width: 48px;
        height: 48px;
        border-radius: var(--hp-radius-sm);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      &__preset-name {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-600);
      }

      &__colors {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__color-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__color-field {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);
      }

      &__color-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-color-neutral-700);
      }

      &__color-input {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--hp-color-neutral-300);
        border-radius: var(--hp-radius-md);
        overflow: hidden;
      }

      &__color-picker {
        width: 44px;
        height: 44px;
        padding: var(--hp-spacing-2);
        border: none;
        cursor: pointer;

        &::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        &::-webkit-color-swatch {
          border: none;
          border-radius: var(--hp-radius-sm);
        }
      }

      &__color-text {
        flex: 1;
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        border: none;
        font-family: var(--hp-font-family-mono);
        font-size: var(--hp-font-size-sm);
        text-transform: uppercase;

        &:focus {
          outline: none;
        }
      }

      &__preview {
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-lg);
        overflow: hidden;
      }

      &__preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--hp-spacing-4);
        background-color: var(--preview-primary, var(--hp-color-primary));
      }

      &__preview-logo {
        font-size: var(--hp-font-size-lg);
        font-weight: var(--hp-font-weight-bold);
        color: white;

        img {
          height: 32px;
          width: auto;
        }
      }

      &__preview-nav {
        display: flex;
        gap: var(--hp-spacing-4);
        font-size: var(--hp-font-size-sm);
        color: rgba(255, 255, 255, 0.9);

        @media (max-width: 575px) {
          display: none;
        }
      }

      &__preview-content {
        padding: var(--hp-spacing-8);
        background-color: var(--hp-color-neutral-50);
      }

      &__preview-hero {
        text-align: center;

        h3 {
          font-size: var(--hp-font-size-xl);
          font-weight: var(--hp-font-weight-bold);
          color: var(--hp-color-neutral-900);
          margin: 0 0 var(--hp-spacing-2);
        }

        p {
          font-size: var(--hp-font-size-sm);
          color: var(--hp-color-neutral-500);
          margin: 0 0 var(--hp-spacing-4);
        }
      }

      &__preview-btn {
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background-color: var(--preview-primary, var(--hp-color-primary));
        color: white;
        border: none;
        border-radius: var(--hp-radius-md);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        cursor: default;
      }

      &__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--hp-spacing-3);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandingSettingsComponent {
  colorForm: FormGroup;
  primaryLogo: string | null = null;
  favicon: string | null = null;
  selectedPreset: string | null = 'Default';
  isSaving = false;

  colorPresets: ColorPreset[] = [
    { name: 'Default', primary: '#2563EB', secondary: '#1E40AF' },
    { name: 'Forest', primary: '#059669', secondary: '#047857' },
    { name: 'Sunset', primary: '#EA580C', secondary: '#C2410C' },
    { name: 'Ocean', primary: '#0891B2', secondary: '#0E7490' },
    { name: 'Berry', primary: '#7C3AED', secondary: '#6D28D9' },
    { name: 'Slate', primary: '#475569', secondary: '#334155' }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.colorForm = this.fb.group({
      primaryColor: ['#2563EB'],
      secondaryColor: ['#1E40AF']
    });
  }

  uploadLogo(type: 'primary' | 'favicon'): void {
    // Mock implementation
    console.log(`Upload ${type} logo clicked`);
  }

  removeLogo(type: 'primary' | 'favicon'): void {
    if (type === 'primary') {
      this.primaryLogo = null;
    } else {
      this.favicon = null;
    }
  }

  selectPreset(preset: ColorPreset): void {
    this.selectedPreset = preset.name;
    this.colorForm.patchValue({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  }

  resetToDefaults(): void {
    this.selectPreset(this.colorPresets[0]);
    this.primaryLogo = null;
    this.favicon = null;
  }

  saveBranding(): void {
    this.isSaving = true;
    this.cdr.markForCheck();

    // Mock API call
    setTimeout(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
    }, 1000);
  }
}
