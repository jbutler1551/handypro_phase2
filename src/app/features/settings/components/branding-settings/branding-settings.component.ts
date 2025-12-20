import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface LogoAsset {
  id: string;
  type: 'primary' | 'secondary' | 'icon' | 'dark' | 'favicon';
  label: string;
  description: string;
  dimensions: string;
  url: string | null;
  formats: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer' | 'internal' | 'marketing';
  lastModified: Date;
  enabled: boolean;
}

interface FontOption {
  name: string;
  family: string;
  weights: number[];
  category: 'sans-serif' | 'serif' | 'mono';
}

@Component({
  selector: 'hp-branding-settings',
  template: `
    <div class="hp-branding">
      <!-- Header -->
      <div class="hp-branding__header">
        <div class="hp-branding__header-content">
          <h1 class="hp-branding__title">Branding & White Label</h1>
          <p class="hp-branding__subtitle">Customize your franchise portal's look and feel</p>
        </div>
        <div class="hp-branding__header-actions">
          <hp-button variant="outline" size="sm" (click)="previewBranding()">
            <span class="hp-branding__btn-icon" [innerHTML]="sanitizeHtml(icons.eye)"></span>
            Preview
          </hp-button>
          <hp-button variant="primary" size="sm" [loading]="isSaving" (click)="saveBranding()">
            <span class="hp-branding__btn-icon" [innerHTML]="sanitizeHtml(icons.save)"></span>
            Save Changes
          </hp-button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="hp-branding__tabs">
        <button
          *ngFor="let tab of tabs"
          class="hp-branding__tab"
          [class.hp-branding__tab--active]="activeTab === tab.id"
          (click)="activeTab = tab.id"
        >
          <span class="hp-branding__tab-icon" [innerHTML]="sanitizeHtml(tab.icon)"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="hp-branding__content">
        <!-- Logo Suite Tab -->
        <div *ngIf="activeTab === 'logos'" class="hp-branding__panel">
          <div class="hp-branding__section-intro">
            <h2 class="hp-branding__section-heading">Logo Suite</h2>
            <p class="hp-branding__section-desc">Upload different logo versions for various use cases across your platform</p>
          </div>

          <div class="hp-branding__logo-grid">
            <div *ngFor="let logo of logoAssets" class="hp-branding__logo-card">
              <div class="hp-branding__logo-card-header">
                <h3 class="hp-branding__logo-card-title">{{ logo.label }}</h3>
                <hp-badge *ngIf="logo.url" variant="success" size="sm">Uploaded</hp-badge>
              </div>
              <p class="hp-branding__logo-card-desc">{{ logo.description }}</p>

              <div
                class="hp-branding__logo-dropzone"
                [class.hp-branding__logo-dropzone--has-image]="logo.url"
                (click)="uploadLogo(logo)"
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event, logo)"
              >
                <img *ngIf="logo.url" [src]="logo.url" [alt]="logo.label" />
                <div *ngIf="!logo.url" class="hp-branding__logo-placeholder">
                  <span class="hp-branding__upload-icon" [innerHTML]="sanitizeHtml(icons.upload)"></span>
                  <span class="hp-branding__upload-text">Drop file or click to upload</span>
                  <span class="hp-branding__upload-hint">{{ logo.formats.join(', ') }} • {{ logo.dimensions }}</span>
                </div>
              </div>

              <div class="hp-branding__logo-card-actions" *ngIf="logo.url">
                <hp-button variant="ghost" size="sm" (click)="downloadLogo(logo)">
                  <span class="hp-branding__btn-icon" [innerHTML]="sanitizeHtml(icons.download)"></span>
                  Download
                </hp-button>
                <hp-button variant="ghost" size="sm" (click)="removeLogo(logo)">
                  <span class="hp-branding__text-danger">Remove</span>
                </hp-button>
              </div>
            </div>
          </div>

          <!-- Logo Guidelines -->
          <hp-card class="hp-branding__guidelines">
            <h3 class="hp-branding__card-title">Logo Guidelines</h3>
            <div class="hp-branding__guidelines-grid">
              <div class="hp-branding__guideline">
                <span class="hp-branding__guideline-icon" [innerHTML]="sanitizeHtml(icons.check)"></span>
                <div class="hp-branding__guideline-content">
                  <span class="hp-branding__guideline-title">High Resolution</span>
                  <span class="hp-branding__guideline-desc">Use SVG or PNG at 2x scale for crisp display</span>
                </div>
              </div>
              <div class="hp-branding__guideline">
                <span class="hp-branding__guideline-icon" [innerHTML]="sanitizeHtml(icons.check)"></span>
                <div class="hp-branding__guideline-content">
                  <span class="hp-branding__guideline-title">Transparent Background</span>
                  <span class="hp-branding__guideline-desc">PNG with transparency works best</span>
                </div>
              </div>
              <div class="hp-branding__guideline">
                <span class="hp-branding__guideline-icon" [innerHTML]="sanitizeHtml(icons.check)"></span>
                <div class="hp-branding__guideline-content">
                  <span class="hp-branding__guideline-title">Proper Padding</span>
                  <span class="hp-branding__guideline-desc">Leave some breathing room around the logo</span>
                </div>
              </div>
              <div class="hp-branding__guideline">
                <span class="hp-branding__guideline-icon" [innerHTML]="sanitizeHtml(icons.x)"></span>
                <div class="hp-branding__guideline-content">
                  <span class="hp-branding__guideline-title">Avoid Low Quality</span>
                  <span class="hp-branding__guideline-desc">Don't upload blurry or pixelated images</span>
                </div>
              </div>
            </div>
          </hp-card>
        </div>

        <!-- Brand Kit Tab -->
        <div *ngIf="activeTab === 'brand'" class="hp-branding__panel">
          <div class="hp-branding__section-intro">
            <h2 class="hp-branding__section-heading">Brand Kit</h2>
            <p class="hp-branding__section-desc">Define your brand colors, typography, and visual identity</p>
          </div>

          <!-- Color Palette -->
          <hp-card>
            <h3 class="hp-branding__card-title">Color Palette</h3>

            <!-- Presets -->
            <div class="hp-branding__presets">
              <span class="hp-branding__presets-label">Quick Presets</span>
              <div class="hp-branding__presets-grid">
                <button
                  *ngFor="let preset of colorPresets"
                  type="button"
                  class="hp-branding__preset"
                  [class.hp-branding__preset--selected]="selectedPreset === preset.name"
                  (click)="selectPreset(preset)"
                >
                  <span
                    class="hp-branding__preset-swatch"
                    [style.background]="'linear-gradient(135deg, ' + preset.primary + ' 33%, ' + preset.secondary + ' 33%, ' + preset.secondary + ' 66%, ' + preset.accent + ' 66%)'"
                  ></span>
                  <span class="hp-branding__preset-name">{{ preset.name }}</span>
                </button>
              </div>
            </div>

            <!-- Custom Colors -->
            <form [formGroup]="colorForm" class="hp-branding__colors">
              <div class="hp-branding__color-row">
                <div class="hp-branding__color-field">
                  <label class="hp-branding__color-label">Primary Color</label>
                  <p class="hp-branding__color-desc">Main brand color for buttons, links, and accents</p>
                  <div class="hp-branding__color-input">
                    <input type="color" formControlName="primaryColor" class="hp-branding__color-picker" />
                    <input type="text" formControlName="primaryColor" class="hp-branding__color-text" maxlength="7" />
                  </div>
                </div>
                <div class="hp-branding__color-field">
                  <label class="hp-branding__color-label">Secondary Color</label>
                  <p class="hp-branding__color-desc">Supporting color for gradients and highlights</p>
                  <div class="hp-branding__color-input">
                    <input type="color" formControlName="secondaryColor" class="hp-branding__color-picker" />
                    <input type="text" formControlName="secondaryColor" class="hp-branding__color-text" maxlength="7" />
                  </div>
                </div>
                <div class="hp-branding__color-field">
                  <label class="hp-branding__color-label">Accent Color</label>
                  <p class="hp-branding__color-desc">Eye-catching color for CTAs and important elements</p>
                  <div class="hp-branding__color-input">
                    <input type="color" formControlName="accentColor" class="hp-branding__color-picker" />
                    <input type="text" formControlName="accentColor" class="hp-branding__color-text" maxlength="7" />
                  </div>
                </div>
              </div>
            </form>

            <!-- Generated Palette -->
            <div class="hp-branding__palette">
              <span class="hp-branding__palette-label">Generated Palette</span>
              <div class="hp-branding__palette-grid">
                <div
                  *ngFor="let shade of generatedShades"
                  class="hp-branding__palette-swatch"
                  [style.backgroundColor]="shade.color"
                  [class.hp-branding__palette-swatch--light]="shade.isLight"
                >
                  <span class="hp-branding__palette-shade-name">{{ shade.name }}</span>
                  <span class="hp-branding__palette-shade-hex">{{ shade.color }}</span>
                </div>
              </div>
            </div>
          </hp-card>

          <!-- Typography -->
          <hp-card>
            <h3 class="hp-branding__card-title">Typography</h3>

            <div class="hp-branding__typography">
              <div class="hp-branding__font-section">
                <label class="hp-branding__font-label">Heading Font</label>
                <select class="hp-branding__font-select" [(ngModel)]="headingFont">
                  <option *ngFor="let font of fonts" [value]="font.name">{{ font.name }}</option>
                </select>
                <div class="hp-branding__font-preview" [style.fontFamily]="getSelectedFont('heading')?.family">
                  <span class="hp-branding__font-preview-heading">The Quick Brown Fox</span>
                </div>
              </div>

              <div class="hp-branding__font-section">
                <label class="hp-branding__font-label">Body Font</label>
                <select class="hp-branding__font-select" [(ngModel)]="bodyFont">
                  <option *ngFor="let font of fonts" [value]="font.name">{{ font.name }}</option>
                </select>
                <div class="hp-branding__font-preview" [style.fontFamily]="getSelectedFont('body')?.family">
                  <span class="hp-branding__font-preview-body">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.</span>
                </div>
              </div>
            </div>
          </hp-card>

          <!-- Border Radius -->
          <hp-card>
            <h3 class="hp-branding__card-title">Corner Radius</h3>
            <p class="hp-branding__card-desc">Adjust the roundness of buttons, cards, and other elements</p>

            <div class="hp-branding__radius">
              <div class="hp-branding__radius-options">
                <button
                  *ngFor="let option of radiusOptions"
                  class="hp-branding__radius-option"
                  [class.hp-branding__radius-option--selected]="selectedRadius === option.value"
                  (click)="selectedRadius = option.value"
                >
                  <div class="hp-branding__radius-preview" [style.borderRadius]="option.value + 'px'"></div>
                  <span class="hp-branding__radius-label">{{ option.label }}</span>
                </button>
              </div>
            </div>
          </hp-card>
        </div>

        <!-- Email Templates Tab -->
        <div *ngIf="activeTab === 'emails'" class="hp-branding__panel">
          <div class="hp-branding__section-intro">
            <h2 class="hp-branding__section-heading">Email Templates</h2>
            <p class="hp-branding__section-desc">Customize the emails sent to your customers and team</p>
          </div>

          <!-- Email Categories -->
          <div class="hp-branding__email-filters">
            <button
              *ngFor="let cat of emailCategories"
              class="hp-branding__email-filter"
              [class.hp-branding__email-filter--active]="emailCategory === cat.id"
              (click)="emailCategory = cat.id"
            >
              {{ cat.label }}
              <span class="hp-branding__email-count">{{ getEmailCount(cat.id) }}</span>
            </button>
          </div>

          <!-- Email Template List -->
          <div class="hp-branding__email-list">
            <div
              *ngFor="let template of filteredEmailTemplates"
              class="hp-branding__email-card"
            >
              <div class="hp-branding__email-card-content">
                <div class="hp-branding__email-header">
                  <div class="hp-branding__email-icon" [innerHTML]="sanitizeHtml(icons.mail)"></div>
                  <div class="hp-branding__email-info">
                    <h4 class="hp-branding__email-name">{{ template.name }}</h4>
                    <p class="hp-branding__email-desc">{{ template.description }}</p>
                  </div>
                </div>
                <div class="hp-branding__email-meta">
                  <span class="hp-branding__email-date">Modified {{ template.lastModified | date:'MMM d, yyyy' }}</span>
                </div>
              </div>
              <div class="hp-branding__email-card-actions">
                <div class="hp-branding__toggle-wrapper">
                  <button
                    class="hp-branding__toggle"
                    [class.hp-branding__toggle--on]="template.enabled"
                    (click)="template.enabled = !template.enabled"
                  >
                    <span class="hp-branding__toggle-thumb"></span>
                  </button>
                  <span class="hp-branding__toggle-label">{{ template.enabled ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="hp-branding__email-buttons">
                  <hp-button variant="ghost" size="sm" (click)="previewEmail(template)">Preview</hp-button>
                  <hp-button variant="ghost" size="sm" (click)="editEmail(template)">Edit</hp-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Email Footer Settings -->
          <hp-card>
            <h3 class="hp-branding__card-title">Email Footer</h3>
            <p class="hp-branding__card-desc">Customize the footer that appears on all transactional emails</p>

            <form [formGroup]="emailFooterForm" class="hp-branding__email-footer-form">
              <div class="hp-branding__form-row">
                <div class="hp-branding__form-field">
                  <label class="hp-branding__form-label">Company Name</label>
                  <input type="text" formControlName="companyName" class="hp-branding__form-input" />
                </div>
                <div class="hp-branding__form-field">
                  <label class="hp-branding__form-label">Support Email</label>
                  <input type="email" formControlName="supportEmail" class="hp-branding__form-input" />
                </div>
              </div>
              <div class="hp-branding__form-field">
                <label class="hp-branding__form-label">Address</label>
                <input type="text" formControlName="address" class="hp-branding__form-input" />
              </div>
              <div class="hp-branding__form-row">
                <div class="hp-branding__form-field">
                  <label class="hp-branding__form-label">Phone</label>
                  <input type="tel" formControlName="phone" class="hp-branding__form-input" />
                </div>
                <div class="hp-branding__form-field">
                  <label class="hp-branding__form-label">Website</label>
                  <input type="url" formControlName="website" class="hp-branding__form-input" />
                </div>
              </div>
            </form>
          </hp-card>
        </div>

        <!-- Custom Domain Tab -->
        <div *ngIf="activeTab === 'domain'" class="hp-branding__panel">
          <div class="hp-branding__section-intro">
            <h2 class="hp-branding__section-heading">Custom Domain</h2>
            <p class="hp-branding__section-desc">Use your own domain for the customer portal and booking page</p>
          </div>

          <!-- Current Domain Status -->
          <hp-card>
            <div class="hp-branding__domain-status">
              <div class="hp-branding__domain-info">
                <div class="hp-branding__domain-icon" [class.hp-branding__domain-icon--active]="customDomain.verified" [innerHTML]="sanitizeHtml(customDomain.verified ? icons.checkCircle : icons.globe)"></div>
                <div class="hp-branding__domain-details">
                  <span class="hp-branding__domain-url">{{ customDomain.domain || 'No custom domain configured' }}</span>
                  <span class="hp-branding__domain-default">Default: {{ defaultDomain }}</span>
                </div>
              </div>
              <hp-badge [variant]="customDomain.verified ? 'success' : (customDomain.domain ? 'warning' : 'secondary')" size="sm">
                {{ customDomain.verified ? 'Active' : (customDomain.domain ? 'Pending Verification' : 'Not Configured') }}
              </hp-badge>
            </div>
          </hp-card>

          <!-- Add/Edit Domain -->
          <hp-card>
            <h3 class="hp-branding__card-title">{{ customDomain.domain ? 'Update' : 'Add' }} Custom Domain</h3>

            <form [formGroup]="domainForm" class="hp-branding__domain-form" (ngSubmit)="verifyDomain()">
              <div class="hp-branding__form-field">
                <label class="hp-branding__form-label">Your Domain</label>
                <div class="hp-branding__domain-input-wrapper">
                  <span class="hp-branding__domain-prefix">https://</span>
                  <input
                    type="text"
                    formControlName="domain"
                    class="hp-branding__domain-input"
                    placeholder="portal.yourcompany.com"
                  />
                </div>
                <p class="hp-branding__form-hint">Use a subdomain like portal.yourcompany.com or book.yourcompany.com</p>
              </div>

              <hp-button
                type="submit"
                variant="primary"
                size="sm"
                [loading]="isVerifying"
                [disabled]="!domainForm.valid"
              >
                {{ customDomain.domain ? 'Update Domain' : 'Verify Domain' }}
              </hp-button>
            </form>
          </hp-card>

          <!-- DNS Configuration -->
          <hp-card *ngIf="customDomain.domain && !customDomain.verified">
            <h3 class="hp-branding__card-title">DNS Configuration</h3>
            <p class="hp-branding__card-desc">Add these DNS records to your domain registrar to complete verification</p>

            <div class="hp-branding__dns-records">
              <div class="hp-branding__dns-record">
                <div class="hp-branding__dns-record-header">
                  <span class="hp-branding__dns-record-type">CNAME Record</span>
                  <hp-badge variant="warning" size="sm">Required</hp-badge>
                </div>
                <div class="hp-branding__dns-record-content">
                  <div class="hp-branding__dns-field">
                    <span class="hp-branding__dns-label">Host/Name</span>
                    <div class="hp-branding__dns-value">
                      <code>{{ getSubdomain(customDomain.domain) }}</code>
                      <button class="hp-branding__copy-btn" (click)="copyToClipboard(getSubdomain(customDomain.domain))">
                        <span [innerHTML]="sanitizeHtml(icons.copy)"></span>
                      </button>
                    </div>
                  </div>
                  <div class="hp-branding__dns-field">
                    <span class="hp-branding__dns-label">Points to</span>
                    <div class="hp-branding__dns-value">
                      <code>cname.truztpro.com</code>
                      <button class="hp-branding__copy-btn" (click)="copyToClipboard('cname.truztpro.com')">
                        <span [innerHTML]="sanitizeHtml(icons.copy)"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="hp-branding__dns-record">
                <div class="hp-branding__dns-record-header">
                  <span class="hp-branding__dns-record-type">TXT Record (Verification)</span>
                  <hp-badge variant="warning" size="sm">Required</hp-badge>
                </div>
                <div class="hp-branding__dns-record-content">
                  <div class="hp-branding__dns-field">
                    <span class="hp-branding__dns-label">Host/Name</span>
                    <div class="hp-branding__dns-value">
                      <code>_truztpro-verify</code>
                      <button class="hp-branding__copy-btn" (click)="copyToClipboard('_truztpro-verify')">
                        <span [innerHTML]="sanitizeHtml(icons.copy)"></span>
                      </button>
                    </div>
                  </div>
                  <div class="hp-branding__dns-field">
                    <span class="hp-branding__dns-label">Value</span>
                    <div class="hp-branding__dns-value">
                      <code>{{ verificationToken }}</code>
                      <button class="hp-branding__copy-btn" (click)="copyToClipboard(verificationToken)">
                        <span [innerHTML]="sanitizeHtml(icons.copy)"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="hp-branding__dns-actions">
              <hp-button variant="outline" size="sm" (click)="refreshVerification()">
                <span class="hp-branding__btn-icon" [innerHTML]="sanitizeHtml(icons.refresh)"></span>
                Check DNS Status
              </hp-button>
              <span class="hp-branding__dns-note">DNS changes can take up to 48 hours to propagate</span>
            </div>
          </hp-card>

          <!-- SSL Certificate -->
          <hp-card *ngIf="customDomain.verified">
            <h3 class="hp-branding__card-title">SSL Certificate</h3>
            <div class="hp-branding__ssl-status">
              <div class="hp-branding__ssl-icon" [innerHTML]="sanitizeHtml(icons.shield)"></div>
              <div class="hp-branding__ssl-info">
                <span class="hp-branding__ssl-label">SSL certificate is active</span>
                <span class="hp-branding__ssl-detail">Auto-renews on {{ sslExpiry | date:'MMM d, yyyy' }}</span>
              </div>
              <hp-badge variant="success" size="sm">Secure</hp-badge>
            </div>
          </hp-card>
        </div>
      </div>

      <!-- Live Preview -->
      <hp-card class="hp-branding__preview" *ngIf="activeTab === 'brand'">
        <h3 class="hp-branding__card-title">Live Preview</h3>
        <div
          class="hp-branding__preview-frame"
          [style.--preview-primary]="colorForm.value.primaryColor"
          [style.--preview-secondary]="colorForm.value.secondaryColor"
          [style.--preview-accent]="colorForm.value.accentColor"
          [style.--preview-radius]="selectedRadius + 'px'"
        >
          <div class="hp-branding__preview-header">
            <div class="hp-branding__preview-logo">
              <img *ngIf="primaryLogoUrl" [src]="primaryLogoUrl" alt="Logo" />
              <span *ngIf="!primaryLogoUrl">Your Logo</span>
            </div>
            <div class="hp-branding__preview-nav">
              <span>Home</span>
              <span>Services</span>
              <span>Book Now</span>
            </div>
          </div>
          <div class="hp-branding__preview-body">
            <div class="hp-branding__preview-hero">
              <h3 [style.fontFamily]="getSelectedFont('heading')?.family">Professional Home Services</h3>
              <p [style.fontFamily]="getSelectedFont('body')?.family">Quality work you can trust. Book your service today.</p>
              <button class="hp-branding__preview-cta">Get a Free Quote</button>
            </div>
            <div class="hp-branding__preview-cards">
              <div class="hp-branding__preview-card">
                <div class="hp-branding__preview-card-icon" [innerHTML]="sanitizeHtml(icons.wrench)"></div>
                <span>Repairs</span>
              </div>
              <div class="hp-branding__preview-card">
                <div class="hp-branding__preview-card-icon" [innerHTML]="sanitizeHtml(icons.brush)"></div>
                <span>Painting</span>
              </div>
              <div class="hp-branding__preview-card">
                <div class="hp-branding__preview-card-icon" [innerHTML]="sanitizeHtml(icons.plug)"></div>
                <span>Electrical</span>
              </div>
            </div>
          </div>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-branding {
      max-width: 1200px;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--hp-spacing-6);
        flex-wrap: wrap;
        gap: var(--hp-spacing-4);
      }

      &__title {
        font-size: var(--hp-font-size-2xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__subtitle {
        font-size: var(--hp-font-size-base);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__header-actions {
        display: flex;
        gap: var(--hp-spacing-3);
      }

      &__btn-icon {
        display: inline-flex;
        width: 16px;
        height: 16px;
        margin-right: var(--hp-spacing-2);

        svg {
          width: 100%;
          height: 100%;
        }
      }

      /* Tabs */
      &__tabs {
        display: flex;
        gap: var(--hp-spacing-1);
        padding: var(--hp-spacing-2);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-md);
        margin-bottom: var(--hp-spacing-6);
        overflow-x: auto;
      }

      &__tab {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-3) var(--hp-spacing-5);
        background: transparent;
        border: none;
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 200ms ease;

        &:hover {
          color: var(--hp-text-primary);
          background: var(--hp-glass-bg);
        }

        &--active {
          background: var(--hp-surface-card);
          color: var(--hp-text-primary);
          box-shadow: var(--hp-shadow-sm);
        }
      }

      &__tab-icon {
        display: flex;
        width: 18px;
        height: 18px;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      /* Panel */
      &__panel {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-6);
      }

      &__section-intro {
        margin-bottom: var(--hp-spacing-2);
      }

      &__section-heading {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-1);
      }

      &__section-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      /* Cards */
      &__card-title {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__card-desc {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        margin: 0 0 var(--hp-spacing-4);
      }

      /* Logo Grid */
      &__logo-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 991px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__logo-card {
        display: flex;
        flex-direction: column;
        padding: var(--hp-spacing-5);
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
      }

      &__logo-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--hp-spacing-1);
      }

      &__logo-card-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-primary);
        margin: 0;
      }

      &__logo-card-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        margin: 0 0 var(--hp-spacing-4);
      }

      &__logo-dropzone {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 120px;
        padding: var(--hp-spacing-4);
        border: 2px dashed var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        background: var(--hp-glass-bg-subtle);
        cursor: pointer;
        transition: all 200ms ease;

        &:hover {
          border-color: var(--hp-color-primary);
          background: var(--hp-color-primary-50);
        }

        &--has-image {
          border-style: solid;
          padding: var(--hp-spacing-2);

          img {
            max-width: 100%;
            max-height: 80px;
            object-fit: contain;
          }
        }
      }

      &__logo-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        text-align: center;
      }

      &__upload-icon {
        display: flex;
        color: var(--hp-text-tertiary);

        svg {
          width: 32px;
          height: 32px;
        }
      }

      &__upload-text {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__upload-hint {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__logo-card-actions {
        display: flex;
        gap: var(--hp-spacing-2);
        margin-top: var(--hp-spacing-3);
      }

      &__text-danger {
        color: var(--hp-color-danger);
      }

      /* Guidelines */
      &__guidelines {
        margin-top: var(--hp-spacing-4);
      }

      &__guidelines-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__guideline {
        display: flex;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__guideline-icon {
        display: flex;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        color: var(--hp-color-success);

        svg {
          width: 100%;
          height: 100%;
        }
      }

      &__guideline:nth-child(4) &__guideline-icon {
        color: var(--hp-color-danger);
      }

      &__guideline-content {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__guideline-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__guideline-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
      }

      /* Color Presets */
      &__presets {
        margin-bottom: var(--hp-spacing-6);
      }

      &__presets-label {
        display: block;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
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
        background: transparent;
        border: 2px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        cursor: pointer;
        transition: all 200ms ease;

        &:hover {
          border-color: var(--hp-color-primary-200);
        }

        &--selected {
          border-color: var(--hp-color-primary);
          background: var(--hp-color-primary-50);
        }
      }

      &__preset-swatch {
        width: 48px;
        height: 48px;
        border-radius: var(--hp-radius-modern-xs);
        box-shadow: var(--hp-shadow-sm);
      }

      &__preset-name {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
      }

      /* Colors */
      &__colors {
        margin-bottom: var(--hp-spacing-6);
      }

      &__color-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__color-field {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__color-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__color-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__color-input {
        display: flex;
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
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
          border-radius: var(--hp-radius-xs);
        }
      }

      &__color-text {
        flex: 1;
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        border: none;
        font-family: monospace;
        font-size: var(--hp-font-size-sm);
        text-transform: uppercase;
        background: var(--hp-surface-card);
        color: var(--hp-text-primary);

        &:focus {
          outline: none;
        }
      }

      /* Palette */
      &__palette {
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-glass-border);
      }

      &__palette-label {
        display: block;
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-secondary);
        margin-bottom: var(--hp-spacing-3);
      }

      &__palette-grid {
        display: flex;
        gap: 2px;
        border-radius: var(--hp-radius-modern-sm);
        overflow: hidden;
      }

      &__palette-swatch {
        flex: 1;
        padding: var(--hp-spacing-4) var(--hp-spacing-2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--hp-spacing-1);
        color: white;

        &--light {
          color: var(--hp-text-primary);
        }
      }

      &__palette-shade-name {
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-medium);
      }

      &__palette-shade-hex {
        font-size: 10px;
        font-family: monospace;
        opacity: 0.8;
      }

      /* Typography */
      &__typography {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-6);

        @media (max-width: 767px) {
          grid-template-columns: 1fr;
        }
      }

      &__font-section {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__font-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__font-select {
        padding: var(--hp-spacing-3);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        background: var(--hp-surface-card);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
        }
      }

      &__font-preview {
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__font-preview-heading {
        font-size: var(--hp-font-size-xl);
        font-weight: var(--hp-font-weight-bold);
        color: var(--hp-text-primary);
      }

      &__font-preview-body {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        line-height: 1.6;
      }

      /* Border Radius */
      &__radius-options {
        display: flex;
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__radius-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-4);
        background: transparent;
        border: 2px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        cursor: pointer;
        transition: all 200ms ease;

        &:hover {
          border-color: var(--hp-color-primary-200);
        }

        &--selected {
          border-color: var(--hp-color-primary);
          background: var(--hp-color-primary-50);
        }
      }

      &__radius-preview {
        width: 48px;
        height: 48px;
        background: var(--hp-color-primary);
      }

      &__radius-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
      }

      /* Email Templates */
      &__email-filters {
        display: flex;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__email-filter {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid transparent;
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 200ms ease;

        &:hover {
          background: var(--hp-glass-bg);
        }

        &--active {
          background: var(--hp-surface-card);
          border-color: var(--hp-color-primary);
          color: var(--hp-text-primary);
        }
      }

      &__email-count {
        padding: 2px 8px;
        background: var(--hp-glass-bg-prominent);
        border-radius: 10px;
        font-size: var(--hp-font-size-xs);
      }

      &__email-list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-3);
      }

      &__email-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4);
        background: var(--hp-surface-card);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-md);
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__email-header {
        display: flex;
        gap: var(--hp-spacing-3);
        align-items: flex-start;
      }

      &__email-icon {
        display: flex;
        padding: var(--hp-spacing-2);
        background: var(--hp-color-primary-100);
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-color-primary);

        svg {
          width: 20px;
          height: 20px;
        }
      }

      &__email-info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__email-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
        margin: 0;
      }

      &__email-desc {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        margin: 0;
      }

      &__email-meta {
        margin-top: var(--hp-spacing-2);
      }

      &__email-date {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__email-card-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__toggle-wrapper {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
      }

      &__toggle {
        position: relative;
        width: 44px;
        height: 24px;
        background: var(--hp-glass-bg-prominent);
        border: 1px solid var(--hp-glass-border);
        border-radius: 12px;
        cursor: pointer;
        transition: all 200ms ease;

        &--on {
          background: var(--hp-color-primary);
          border-color: var(--hp-color-primary);
        }
      }

      &__toggle-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: white;
        border-radius: 50%;
        box-shadow: var(--hp-shadow-sm);
        transition: transform 200ms ease;

        .hp-branding__toggle--on & {
          transform: translateX(20px);
        }
      }

      &__toggle-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        min-width: 60px;
      }

      &__email-buttons {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      /* Form Fields */
      &__form-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__form-field {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
        margin-bottom: var(--hp-spacing-4);
      }

      &__form-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__form-input {
        padding: var(--hp-spacing-3);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        background: var(--hp-surface-card);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);

        &:focus {
          outline: none;
          border-color: var(--hp-color-primary);
          box-shadow: 0 0 0 3px var(--hp-color-primary-100);
        }
      }

      &__form-hint {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        margin: var(--hp-spacing-1) 0 0;
      }

      /* Domain */
      &__domain-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__domain-info {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
      }

      &__domain-icon {
        display: flex;
        padding: var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
        color: var(--hp-text-secondary);

        svg {
          width: 24px;
          height: 24px;
        }

        &--active {
          background: var(--hp-color-success-100);
          color: var(--hp-color-success);
        }
      }

      &__domain-details {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__domain-url {
        font-size: var(--hp-font-size-base);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__domain-default {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__domain-form {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__domain-input-wrapper {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        overflow: hidden;
      }

      &__domain-prefix {
        display: flex;
        align-items: center;
        padding: 0 var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
        border-right: 1px solid var(--hp-glass-border);
      }

      &__domain-input {
        flex: 1;
        padding: var(--hp-spacing-3);
        border: none;
        background: var(--hp-surface-card);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);

        &:focus {
          outline: none;
        }
      }

      /* DNS Records */
      &__dns-records {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
      }

      &__dns-record {
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
      }

      &__dns-record-header {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-3);
      }

      &__dns-record-type {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__dns-record-content {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--hp-spacing-4);

        @media (max-width: 575px) {
          grid-template-columns: 1fr;
        }
      }

      &__dns-field {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__dns-label {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__dns-value {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);

        code {
          padding: var(--hp-spacing-2);
          background: var(--hp-surface-card);
          border-radius: var(--hp-radius-xs);
          font-size: var(--hp-font-size-sm);
          font-family: monospace;
          color: var(--hp-text-primary);
          word-break: break-all;
        }
      }

      &__copy-btn {
        display: flex;
        padding: var(--hp-spacing-1);
        background: transparent;
        border: none;
        color: var(--hp-text-tertiary);
        cursor: pointer;
        transition: color 200ms ease;

        &:hover {
          color: var(--hp-color-primary);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__dns-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
      }

      &__dns-note {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      /* SSL */
      &__ssl-status {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__ssl-icon {
        display: flex;
        padding: var(--hp-spacing-3);
        background: var(--hp-color-success-100);
        border-radius: var(--hp-radius-modern-sm);
        color: var(--hp-color-success);

        svg {
          width: 24px;
          height: 24px;
        }
      }

      &__ssl-info {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
        flex: 1;
      }

      &__ssl-label {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
      }

      &__ssl-detail {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
      }

      /* Preview */
      &__preview {
        margin-top: var(--hp-spacing-6);
      }

      &__preview-frame {
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--preview-radius, var(--hp-radius-modern-md));
        overflow: hidden;
      }

      &__preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--hp-spacing-4);
        background: var(--preview-primary, var(--hp-color-primary));
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

      &__preview-body {
        padding: var(--hp-spacing-8);
        background: var(--hp-color-neutral-50);
      }

      &__preview-hero {
        text-align: center;
        margin-bottom: var(--hp-spacing-6);

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

      &__preview-cta {
        padding: var(--hp-spacing-3) var(--hp-spacing-5);
        background: var(--preview-accent, var(--preview-primary, var(--hp-color-primary)));
        color: white;
        border: none;
        border-radius: var(--preview-radius, var(--hp-radius-modern-sm));
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        cursor: default;
      }

      &__preview-cards {
        display: flex;
        justify-content: center;
        gap: var(--hp-spacing-4);
      }

      &__preview-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-4);
        background: white;
        border-radius: var(--preview-radius, var(--hp-radius-modern-sm));
        box-shadow: var(--hp-shadow-sm);
        min-width: 80px;

        span {
          font-size: var(--hp-font-size-xs);
          color: var(--hp-text-secondary);
        }
      }

      &__preview-card-icon {
        display: flex;
        padding: var(--hp-spacing-2);
        background: var(--hp-color-primary-100);
        border-radius: 50%;
        color: var(--preview-primary, var(--hp-color-primary));

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandingSettingsComponent {
  activeTab = 'logos';
  isSaving = false;
  isVerifying = false;
  selectedPreset = 'Default';
  headingFont = 'Inter';
  bodyFont = 'Inter';
  selectedRadius = 8;
  emailCategory = 'all';
  primaryLogoUrl: string | null = null;

  tabs = [
    { id: 'logos', label: 'Logo Suite', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
    { id: 'brand', label: 'Brand Kit', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>' },
    { id: 'emails', label: 'Email Templates', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' },
    { id: 'domain', label: 'Custom Domain', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>' }
  ];

  icons = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    brush: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"></path></svg>',
    plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path></svg>'
  };

  logoAssets: LogoAsset[] = [
    { id: 'primary', type: 'primary', label: 'Primary Logo', description: 'Main logo for light backgrounds', dimensions: 'Max 400×100px', url: null, formats: ['PNG', 'SVG'] },
    { id: 'secondary', type: 'secondary', label: 'Secondary Logo', description: 'Alternative logo for different contexts', dimensions: 'Max 400×100px', url: null, formats: ['PNG', 'SVG'] },
    { id: 'icon', type: 'icon', label: 'Logo Icon', description: 'Square icon version of your logo', dimensions: '256×256px', url: null, formats: ['PNG', 'SVG'] },
    { id: 'dark', type: 'dark', label: 'Dark Mode Logo', description: 'Logo for dark backgrounds', dimensions: 'Max 400×100px', url: null, formats: ['PNG', 'SVG'] },
    { id: 'favicon', type: 'favicon', label: 'Favicon', description: 'Browser tab icon', dimensions: '32×32px', url: null, formats: ['ICO', 'PNG'] }
  ];

  colorPresets: ColorPreset[] = [
    { name: 'Default', primary: '#2563EB', secondary: '#1E40AF', accent: '#F59E0B' },
    { name: 'Forest', primary: '#059669', secondary: '#047857', accent: '#10B981' },
    { name: 'Sunset', primary: '#EA580C', secondary: '#C2410C', accent: '#F97316' },
    { name: 'Ocean', primary: '#0891B2', secondary: '#0E7490', accent: '#22D3EE' },
    { name: 'Berry', primary: '#7C3AED', secondary: '#6D28D9', accent: '#A855F7' },
    { name: 'Slate', primary: '#475569', secondary: '#334155', accent: '#64748B' },
    { name: 'Rose', primary: '#E11D48', secondary: '#BE123C', accent: '#FB7185' },
    { name: 'Emerald', primary: '#10B981', secondary: '#059669', accent: '#34D399' }
  ];

  fonts: FontOption[] = [
    { name: 'Inter', family: 'Inter, sans-serif', weights: [400, 500, 600, 700], category: 'sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif', weights: [400, 500, 700], category: 'sans-serif' },
    { name: 'Open Sans', family: 'Open Sans, sans-serif', weights: [400, 600, 700], category: 'sans-serif' },
    { name: 'Lato', family: 'Lato, sans-serif', weights: [400, 700], category: 'sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif', weights: [400, 500, 600, 700], category: 'sans-serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', weights: [400, 500, 600, 700], category: 'sans-serif' },
    { name: 'Playfair Display', family: 'Playfair Display, serif', weights: [400, 700], category: 'serif' },
    { name: 'Merriweather', family: 'Merriweather, serif', weights: [400, 700], category: 'serif' }
  ];

  radiusOptions = [
    { label: 'None', value: 0 },
    { label: 'Small', value: 4 },
    { label: 'Medium', value: 8 },
    { label: 'Large', value: 12 },
    { label: 'Extra', value: 16 },
    { label: 'Full', value: 24 }
  ];

  emailCategories = [
    { id: 'all', label: 'All Templates' },
    { id: 'customer', label: 'Customer' },
    { id: 'internal', label: 'Internal' },
    { id: 'marketing', label: 'Marketing' }
  ];

  emailTemplates: EmailTemplate[] = [
    { id: '1', name: 'Booking Confirmation', description: 'Sent when a customer books a service', category: 'customer', lastModified: new Date('2024-12-10'), enabled: true },
    { id: '2', name: 'Appointment Reminder', description: 'Sent 24 hours before scheduled appointment', category: 'customer', lastModified: new Date('2024-12-08'), enabled: true },
    { id: '3', name: 'Service Completed', description: 'Sent after service is marked complete', category: 'customer', lastModified: new Date('2024-12-05'), enabled: true },
    { id: '4', name: 'Invoice', description: 'Sent with invoice after service', category: 'customer', lastModified: new Date('2024-11-28'), enabled: true },
    { id: '5', name: 'Review Request', description: 'Request for customer feedback', category: 'customer', lastModified: new Date('2024-11-20'), enabled: true },
    { id: '6', name: 'New Assignment', description: 'Sent to technician when assigned a job', category: 'internal', lastModified: new Date('2024-12-01'), enabled: true },
    { id: '7', name: 'Daily Schedule', description: 'Daily job schedule for technicians', category: 'internal', lastModified: new Date('2024-11-15'), enabled: true },
    { id: '8', name: 'Welcome Email', description: 'New customer welcome message', category: 'marketing', lastModified: new Date('2024-10-20'), enabled: true },
    { id: '9', name: 'Seasonal Promotion', description: 'Seasonal discount offers', category: 'marketing', lastModified: new Date('2024-09-15'), enabled: false }
  ];

  customDomain = {
    domain: 'portal.acmehandyman.com',
    verified: false
  };

  defaultDomain = 'acme.truztpro.app';
  verificationToken = 'truztpro-verify-abc123xyz789';
  sslExpiry = new Date('2025-12-15');

  colorForm: FormGroup;
  domainForm: FormGroup;
  emailFooterForm: FormGroup;

  generatedShades = [
    { name: '50', color: '#EFF6FF', isLight: true },
    { name: '100', color: '#DBEAFE', isLight: true },
    { name: '200', color: '#BFDBFE', isLight: true },
    { name: '300', color: '#93C5FD', isLight: true },
    { name: '400', color: '#60A5FA', isLight: false },
    { name: '500', color: '#3B82F6', isLight: false },
    { name: '600', color: '#2563EB', isLight: false },
    { name: '700', color: '#1D4ED8', isLight: false },
    { name: '800', color: '#1E40AF', isLight: false },
    { name: '900', color: '#1E3A8A', isLight: false }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.colorForm = this.fb.group({
      primaryColor: ['#2563EB'],
      secondaryColor: ['#1E40AF'],
      accentColor: ['#F59E0B']
    });

    this.domainForm = this.fb.group({
      domain: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i)]]
    });

    this.emailFooterForm = this.fb.group({
      companyName: ['ABC Handyman Services'],
      supportEmail: ['support@acmehandyman.com'],
      address: ['123 Main Street, New York, NY 10001'],
      phone: ['(555) 123-4567'],
      website: ['https://acmehandyman.com']
    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getSelectedFont(type: 'heading' | 'body'): FontOption | undefined {
    const fontName = type === 'heading' ? this.headingFont : this.bodyFont;
    return this.fonts.find(f => f.name === fontName);
  }

  get filteredEmailTemplates(): EmailTemplate[] {
    if (this.emailCategory === 'all') {
      return this.emailTemplates;
    }
    return this.emailTemplates.filter(t => t.category === this.emailCategory);
  }

  getEmailCount(category: string): number {
    if (category === 'all') {
      return this.emailTemplates.length;
    }
    return this.emailTemplates.filter(t => t.category === category).length;
  }

  getSubdomain(domain: string): string {
    const parts = domain.split('.');
    return parts.length > 2 ? parts[0] : '@';
  }

  selectPreset(preset: ColorPreset): void {
    this.selectedPreset = preset.name;
    this.colorForm.patchValue({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
  }

  uploadLogo(logo: LogoAsset): void {
    console.log('Upload logo:', logo.type);
  }

  removeLogo(logo: LogoAsset): void {
    logo.url = null;
  }

  downloadLogo(logo: LogoAsset): void {
    console.log('Download logo:', logo.type);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, logo: LogoAsset): void {
    event.preventDefault();
    console.log('Dropped file for:', logo.type);
  }

  previewEmail(template: EmailTemplate): void {
    console.log('Preview email:', template.name);
  }

  editEmail(template: EmailTemplate): void {
    console.log('Edit email:', template.name);
  }

  verifyDomain(): void {
    if (this.domainForm.valid) {
      this.isVerifying = true;
      console.log('Verifying domain:', this.domainForm.value.domain);
      setTimeout(() => {
        this.isVerifying = false;
        this.customDomain.domain = this.domainForm.value.domain;
        this.cdr.markForCheck();
      }, 2000);
    }
  }

  refreshVerification(): void {
    console.log('Checking DNS status...');
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  previewBranding(): void {
    console.log('Opening branding preview...');
  }

  saveBranding(): void {
    this.isSaving = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
    }, 1500);
  }
}
