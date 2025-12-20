import { Component, ChangeDetectionStrategy } from '@angular/core';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'training' | 'marketing' | 'legal' | 'template';
  size: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: string;
  franchises: string[];
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

@Component({
  selector: 'hp-documents',
  template: `
    <div class="hp-documents">
      <div class="hp-documents__header">
        <div>
          <h1 class="hp-documents__title">Document Library</h1>
          <p class="hp-documents__subtitle">Manage contracts, training materials, and franchise documents.</p>
        </div>
        <div class="hp-documents__header-actions">
          <hp-button variant="outline" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-documents__btn-icon">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
            New Folder
          </hp-button>
          <hp-button variant="primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-documents__btn-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload Document
          </hp-button>
        </div>
      </div>

      <div class="hp-documents__content">
        <!-- Folders Sidebar -->
        <hp-card class="hp-documents__sidebar">
          <h3 class="hp-documents__sidebar-title">Folders</h3>
          <div class="hp-documents__folders">
            <button
              *ngFor="let folder of folders"
              class="hp-documents__folder"
              [class.hp-documents__folder--active]="selectedFolder === folder.id"
              (click)="selectFolder(folder.id)"
            >
              <div class="hp-documents__folder-icon" [style.background]="folder.color + '20'" [style.color]="folder.color">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span class="hp-documents__folder-name">{{ folder.name }}</span>
              <span class="hp-documents__folder-count">{{ folder.count }}</span>
            </button>
          </div>

          <div class="hp-documents__storage">
            <span class="hp-documents__storage-title">Storage Used</span>
            <div class="hp-documents__storage-bar">
              <div class="hp-documents__storage-progress" style="width: 35%"></div>
            </div>
            <span class="hp-documents__storage-text">3.5 GB of 10 GB used</span>
          </div>
        </hp-card>

        <!-- Documents List -->
        <hp-card class="hp-documents__main">
          <div class="hp-documents__toolbar">
            <div class="hp-documents__search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder="Search documents..." [(ngModel)]="searchTerm" />
            </div>
            <div class="hp-documents__view-toggle">
              <button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
          </div>

          <!-- List View -->
          <div *ngIf="viewMode === 'list'" class="hp-documents__list">
            <div class="hp-documents__list-header">
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Uploaded</span>
              <span>Version</span>
              <span>Actions</span>
            </div>
            <div *ngFor="let doc of documents" class="hp-documents__list-row">
              <div class="hp-documents__doc-name">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hp-documents__doc-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>{{ doc.name }}</span>
              </div>
              <span><hp-badge [variant]="getTypeBadge(doc.type)" size="sm">{{ getTypeLabel(doc.type) }}</hp-badge></span>
              <span class="hp-documents__doc-size">{{ doc.size }}</span>
              <span class="hp-documents__doc-date">{{ doc.uploadedAt | date:'MMM d, yyyy' }}</span>
              <span class="hp-documents__doc-version">v{{ doc.version }}</span>
              <div class="hp-documents__doc-actions">
                <button class="hp-documents__action-btn" title="Download">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
                <button class="hp-documents__action-btn" title="Share">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                <button class="hp-documents__action-btn" title="More">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Grid View -->
          <div *ngIf="viewMode === 'grid'" class="hp-documents__grid">
            <div *ngFor="let doc of documents" class="hp-documents__grid-item">
              <div class="hp-documents__grid-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <span class="hp-documents__grid-name">{{ doc.name }}</span>
              <span class="hp-documents__grid-meta">{{ doc.size }} • v{{ doc.version }}</span>
            </div>
          </div>
        </hp-card>
      </div>
    </div>
  `,
  styles: [`
    .hp-documents {
      display: flex;
      flex-direction: column;
      gap: var(--hp-spacing-6);

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--hp-spacing-4);
        flex-wrap: wrap;
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
        width: 16px;
        height: 16px;
        margin-right: var(--hp-spacing-2);
      }

      &__content {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: var(--hp-spacing-6);

        @media (max-width: 1024px) {
          grid-template-columns: 1fr;
        }
      }

      &__sidebar-title {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 var(--hp-spacing-4);
      }

      &__folders {
        display: flex;
        flex-direction: column;
        gap: var(--hp-spacing-1);
        margin-bottom: var(--hp-spacing-6);
      }

      &__folder {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: transparent;
        border: none;
        border-radius: var(--hp-radius-modern-sm);
        cursor: pointer;
        transition: all 150ms ease;
        width: 100%;
        text-align: left;

        &:hover {
          background: var(--hp-glass-bg-subtle);
        }

        &--active {
          background: var(--hp-glass-bg);
          border: 1px solid var(--hp-glass-border);
        }
      }

      &__folder-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--hp-radius-modern-xs);
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &__folder-name {
        flex: 1;
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
      }

      &__folder-count {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
        background: var(--hp-glass-bg-subtle);
        padding: 2px 8px;
        border-radius: var(--hp-radius-full);
      }

      &__storage {
        padding-top: var(--hp-spacing-4);
        border-top: 1px solid var(--hp-glass-border);
      }

      &__storage-title {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-secondary);
        display: block;
        margin-bottom: var(--hp-spacing-2);
      }

      &__storage-bar {
        height: 6px;
        background: var(--hp-glass-bg);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: var(--hp-spacing-2);
      }

      &__storage-progress {
        height: 100%;
        background: var(--hp-gradient-primary);
        border-radius: 3px;
      }

      &__storage-text {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }

      &__toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--hp-spacing-4);
        margin-bottom: var(--hp-spacing-4);
      }

      &__search {
        flex: 1;
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-2);
        padding: var(--hp-spacing-2) var(--hp-spacing-3);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);

        svg {
          width: 18px;
          height: 18px;
          color: var(--hp-text-tertiary);
        }

        input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: var(--hp-font-size-sm);
          color: var(--hp-text-primary);
          outline: none;

          &::placeholder {
            color: var(--hp-text-tertiary);
          }
        }
      }

      &__view-toggle {
        display: flex;
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);

        button {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--hp-text-tertiary);
          cursor: pointer;
          transition: all 150ms ease;

          svg {
            width: 18px;
            height: 18px;
          }

          &:first-child {
            border-radius: var(--hp-radius-modern-sm) 0 0 var(--hp-radius-modern-sm);
          }

          &:last-child {
            border-radius: 0 var(--hp-radius-modern-sm) var(--hp-radius-modern-sm) 0;
          }

          &:hover {
            color: var(--hp-text-primary);
          }

          &.active {
            background: var(--hp-glass-bg);
            color: var(--hp-color-primary);
          }
        }
      }

      &__list-header {
        display: grid;
        grid-template-columns: 2fr 1fr 80px 120px 80px 100px;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border-radius: var(--hp-radius-modern-sm);
        font-size: var(--hp-font-size-xs);
        font-weight: var(--hp-font-weight-semibold);
        color: var(--hp-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__list-row {
        display: grid;
        grid-template-columns: 2fr 1fr 80px 120px 80px 100px;
        gap: var(--hp-spacing-4);
        padding: var(--hp-spacing-3) var(--hp-spacing-4);
        border-bottom: 1px solid var(--hp-glass-border);
        align-items: center;

        &:hover {
          background: var(--hp-glass-bg-subtle);
        }
      }

      &__doc-name {
        display: flex;
        align-items: center;
        gap: var(--hp-spacing-3);
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-primary);
      }

      &__doc-icon {
        width: 20px;
        height: 20px;
        color: var(--hp-color-primary);
      }

      &__doc-size, &__doc-date, &__doc-version {
        font-size: var(--hp-font-size-sm);
        color: var(--hp-text-secondary);
      }

      &__doc-actions {
        display: flex;
        gap: var(--hp-spacing-2);
      }

      &__action-btn {
        width: 28px;
        height: 28px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-xs);
        color: var(--hp-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;

        svg {
          width: 14px;
          height: 14px;
        }

        &:hover {
          background: var(--hp-glass-bg);
          color: var(--hp-color-primary);
          border-color: var(--hp-color-primary);
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--hp-spacing-4);
      }

      &__grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--hp-spacing-4);
        background: var(--hp-glass-bg-subtle);
        border: 1px solid var(--hp-glass-border);
        border-radius: var(--hp-radius-modern-sm);
        text-align: center;
        cursor: pointer;
        transition: all 150ms ease;

        &:hover {
          border-color: var(--hp-color-primary);
          transform: translateY(-2px);
        }
      }

      &__grid-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--hp-spacing-3);
        color: var(--hp-color-primary);

        svg {
          width: 100%;
          height: 100%;
        }
      }

      &__grid-name {
        font-size: var(--hp-font-size-sm);
        font-weight: var(--hp-font-weight-medium);
        color: var(--hp-text-primary);
        margin-bottom: var(--hp-spacing-1);
        word-break: break-word;
      }

      &__grid-meta {
        font-size: var(--hp-font-size-xs);
        color: var(--hp-text-tertiary);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  searchTerm = '';
  selectedFolder = 'all';
  viewMode: 'list' | 'grid' = 'list';

  folders: Folder[] = [
    { id: 'all', name: 'All Documents', icon: 'folder', count: 24, color: '#6B7280' },
    { id: 'contracts', name: 'Contracts', icon: 'folder', count: 8, color: '#3B82F6' },
    { id: 'training', name: 'Training Materials', icon: 'folder', count: 6, color: '#10B981' },
    { id: 'marketing', name: 'Marketing Assets', icon: 'folder', count: 4, color: '#F59E0B' },
    { id: 'legal', name: 'Legal Documents', icon: 'folder', count: 3, color: '#EF4444' },
    { id: 'templates', name: 'Templates', icon: 'folder', count: 3, color: '#8B5CF6' }
  ];

  documents: Document[] = [
    { id: '1', name: 'Franchise Agreement Template.pdf', type: 'contract', size: '2.4 MB', uploadedBy: 'Admin', uploadedAt: new Date('2024-12-01'), version: '2.1', franchises: [] },
    { id: '2', name: 'Technician Training Manual.pdf', type: 'training', size: '15.8 MB', uploadedBy: 'Admin', uploadedAt: new Date('2024-11-15'), version: '3.0', franchises: [] },
    { id: '3', name: 'Brand Guidelines 2024.pdf', type: 'marketing', size: '8.2 MB', uploadedBy: 'Admin', uploadedAt: new Date('2024-10-20'), version: '1.5', franchises: [] },
    { id: '4', name: 'Privacy Policy.pdf', type: 'legal', size: '456 KB', uploadedBy: 'Legal', uploadedAt: new Date('2024-09-01'), version: '1.2', franchises: [] },
    { id: '5', name: 'Invoice Template.docx', type: 'template', size: '124 KB', uploadedBy: 'Admin', uploadedAt: new Date('2024-08-10'), version: '1.0', franchises: [] },
    { id: '6', name: 'Safety Procedures Guide.pdf', type: 'training', size: '4.2 MB', uploadedBy: 'Safety', uploadedAt: new Date('2024-07-22'), version: '2.3', franchises: [] }
  ];

  selectFolder(id: string): void {
    this.selectedFolder = id;
  }

  getTypeBadge(type: string): 'primary' | 'success' | 'warning' | 'error' | 'info' {
    switch (type) {
      case 'contract': return 'primary';
      case 'training': return 'success';
      case 'marketing': return 'warning';
      case 'legal': return 'error';
      case 'template': return 'info';
      default: return 'primary';
    }
  }

  getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
