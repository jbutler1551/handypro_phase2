import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  category: 'payments' | 'accounting' | 'communication' | 'scheduling';
}

@Component({
  selector: 'hp-integrations-settings',
  template: `
    <div class="hp-integrations-settings">
      <!-- Connected Integrations -->
      <hp-card *ngIf="connectedIntegrations.length > 0" class="hp-integrations-settings__section">
        <h2 class="hp-integrations-settings__section-title">Connected Integrations</h2>
        <p class="hp-integrations-settings__section-description">
          Manage your connected apps and services.
        </p>

        <div class="hp-integrations-settings__list">
          <div
            *ngFor="let integration of connectedIntegrations"
            class="hp-integrations-settings__item"
          >
            <div class="hp-integrations-settings__item-icon" [innerHTML]="sanitizeHtml(integration.icon)"></div>
            <div class="hp-integrations-settings__item-info">
              <span class="hp-integrations-settings__item-name">{{ integration.name }}</span>
              <span class="hp-integrations-settings__item-description">{{ integration.description }}</span>
            </div>
            <div class="hp-integrations-settings__item-actions">
              <hp-badge variant="success" size="sm">Connected</hp-badge>
              <hp-button variant="outline" size="sm" (click)="configure(integration)">
                Configure
              </hp-button>
              <hp-button variant="ghost" size="sm" (click)="disconnect(integration)">
                Disconnect
              </hp-button>
            </div>
          </div>
        </div>
      </hp-card>

      <!-- Available Integrations -->
      <hp-card class="hp-integrations-settings__section">
        <h2 class="hp-integrations-settings__section-title">Available Integrations</h2>
        <p class="hp-integrations-settings__section-description">
          Connect more apps and services to enhance your workflow.
        </p>

        <!-- Category Filter -->
        <div class="hp-integrations-settings__categories">
          <button
            *ngFor="let category of categories"
            type="button"
            class="hp-integrations-settings__category"
            [class.hp-integrations-settings__category--active]="selectedCategory === category.value"
            (click)="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>

        <div class="hp-integrations-settings__grid">
          <div
            *ngFor="let integration of filteredIntegrations"
            class="hp-integrations-settings__card"
          >
            <div class="hp-integrations-settings__card-icon" [innerHTML]="sanitizeHtml(integration.icon)"></div>
            <h3 class="hp-integrations-settings__card-name">{{ integration.name }}</h3>
            <p class="hp-integrations-settings__card-description">{{ integration.description }}</p>
            <hp-button variant="outline" size="sm" [fullWidth]="true" (click)="connect(integration)">
              Connect
            </hp-button>
          </div>
        </div>
      </hp-card>

      <!-- API Access -->
      <hp-card class="hp-integrations-settings__section">
        <h2 class="hp-integrations-settings__section-title">API Access</h2>
        <p class="hp-integrations-settings__section-description">
          Use our API to build custom integrations.
        </p>

        <div class="hp-integrations-settings__api">
          <div class="hp-integrations-settings__api-key">
            <label>API Key</label>
            <div class="hp-integrations-settings__api-input">
              <input
                [type]="showApiKey ? 'text' : 'password'"
                [value]="apiKey"
                readonly
              />
              <button type="button" (click)="showApiKey = !showApiKey">
                <svg *ngIf="!showApiKey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showApiKey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
              <hp-button variant="outline" size="sm" (click)="copyApiKey()">
                Copy
              </hp-button>
            </div>
          </div>
          <div class="hp-integrations-settings__api-actions">
            <hp-button variant="outline" size="sm" (click)="regenerateKey()">
              Regenerate Key
            </hp-button>
            <a href="#" class="hp-integrations-settings__api-docs">
              View API Documentation
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </hp-card>
    </div>
  `,
  styles: [`
    .hp-integrations-settings {
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

      &__list {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__item {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-4);
        background-color: var(--hp-color-neutral-50);
        border-radius: var(--hp-radius-lg);

        @media (max-width: 767px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      &__item-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--hp-color-neutral-0);
        border-radius: var(--hp-radius-md);
        flex-shrink: 0;

        svg {
          width: 28px;
          height: 28px;
          color: var(--hp-color-neutral-600);
        }
      }

      &__item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
      }

      &__item-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
      }

      &__item-description {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
      }

      &__item-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);

        @media (max-width: 767px) {
          width: 100%;
          justify-content: flex-start;
        }
      }

      &__categories {
        display: flex;
        flex-wrap: wrap;
        gap: var(--hp-spacing-2);
        margin-bottom: var(--hp-spacing-6);
      }

      &__category {
        padding: var(--hp-spacing-2) var(--hp-spacing-4);
        background: none;
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-full);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-neutral-600);
        cursor: pointer;
        transition: all 150ms;

        &:hover {
          border-color: var(--hp-color-neutral-400);
        }

        &--active {
          background-color: var(--hp-color-primary);
          border-color: var(--hp-color-primary);
          color: white;
        }
      }

      &__grid {
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

      &__card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-5);
        border: 1px solid var(--hp-color-neutral-200);
        border-radius: var(--hp-radius-lg);
        text-align: center;
        transition: border-color 150ms, box-shadow 150ms;

        &:hover {
          border-color: var(--hp-color-primary-200);
          box-shadow: 0 0 0 3px var(--hp-color-primary-50);
        }
      }

      &__card-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--hp-spacing-3);

        svg {
          width: 32px;
          height: 32px;
          color: var(--hp-color-neutral-600);
        }
      }

      &__card-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-color-neutral-900);
        margin: 0 0 var(--hp-spacing-2);
      }

      &__card-description {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-color-neutral-500);
        margin: 0 0 var(--hp-spacing-4);
        flex: 1;
      }

      &__api {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-4);
      }

      &__api-key {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-2);

        label {
          font-size: var(--hp-font-size-sm);
          font-weight: var(--hp-font-weight-medium);
          color: var(--hp-color-neutral-700);
        }
      }

      &__api-input {
        display: flex;
        align-items: stretch;
        gap: var(--hp-spacing-2);

        input {
          flex: 1;
          padding: var(--hp-spacing-2) var(--hp-spacing-3);
          border: 1px solid var(--hp-color-neutral-300);
          border-radius: var(--hp-radius-md);
          font-family: var(--hp-font-family-mono);
          font-size: var(--hp-font-size-sm);
          background-color: var(--hp-color-neutral-50);
        }

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          padding: 0;
          background: none;
          border: 1px solid var(--hp-color-neutral-300);
          border-radius: var(--hp-radius-md);
          cursor: pointer;

          svg {
            width: 18px;
            height: 18px;
            color: var(--hp-color-neutral-500);
          }

          &:hover {
            background-color: var(--hp-color-neutral-50);
          }
        }
      }

      &__api-actions {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-4);
      }

      &__api-docs {
        display: inline-flex;
        align-items: center;
        gap: var(--hp-spacing-1);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-color-primary);
        text-decoration: none;

        svg {
          width: 16px;
          height: 16px;
        }

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationsSettingsComponent {
  selectedCategory: string = 'all';
  showApiKey = false;
  apiKey = 'hp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  constructor(private sanitizer: DomSanitizer) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  categories = [
    { label: 'All', value: 'all' },
    { label: 'Payments', value: 'payments' },
    { label: 'Accounting', value: 'accounting' },
    { label: 'Communication', value: 'communication' },
    { label: 'Scheduling', value: 'scheduling' }
  ];

  integrations: Integration[] = [
    {
      id: '1', name: 'Stripe', description: 'Accept payments and manage subscriptions',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>',
      connected: true, category: 'payments'
    },
    {
      id: '2', name: 'QuickBooks', description: 'Sync invoices and expenses automatically',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.638 0 8.4 3.762 8.4 8.4s-3.762 8.4-8.4 8.4-8.4-3.762-8.4-8.4 3.762-8.4 8.4-8.4zm-1.2 3.6v9.6h2.4V7.2h-2.4z"/></svg>',
      connected: true, category: 'accounting'
    },
    {
      id: '3', name: 'Twilio', description: 'Send SMS notifications to customers',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.381 0 0 5.381 0 12s5.381 12 12 12 12-5.381 12-12S18.619 0 12 0zm0 4.8a7.2 7.2 0 110 14.4 7.2 7.2 0 010-14.4zm-2.4 4.8a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm4.8 0a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg>',
      connected: false, category: 'communication'
    },
    {
      id: '4', name: 'Google Calendar', description: 'Sync your job schedule',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>',
      connected: false, category: 'scheduling'
    },
    {
      id: '5', name: 'Mailchimp', description: 'Email marketing and campaigns',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.8 16.8H7.2v-2.4h9.6v2.4zm0-4.8H7.2V9.6h9.6V12z"/></svg>',
      connected: false, category: 'communication'
    },
    {
      id: '6', name: 'Xero', description: 'Alternative accounting platform',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 13.2h-4.8V18h-2.4v-4.8H6v-2.4h4.8V6h2.4v4.8H18v2.4z"/></svg>',
      connected: false, category: 'accounting'
    }
  ];

  get connectedIntegrations(): Integration[] {
    return this.integrations.filter(i => i.connected);
  }

  get filteredIntegrations(): Integration[] {
    const available = this.integrations.filter(i => !i.connected);
    if (this.selectedCategory === 'all') {
      return available;
    }
    return available.filter(i => i.category === this.selectedCategory);
  }

  connect(integration: Integration): void {
    console.log('Connect', integration.name);
  }

  configure(integration: Integration): void {
    console.log('Configure', integration.name);
  }

  disconnect(integration: Integration): void {
    integration.connected = false;
  }

  copyApiKey(): void {
    navigator.clipboard.writeText(this.apiKey);
  }

  regenerateKey(): void {
    console.log('Regenerate API key');
  }
}
