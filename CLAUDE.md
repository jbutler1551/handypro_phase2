# TruztPro Admin Portal - Project Context

## Overview
TruztPro Admin Portal is a **frontend-only** Angular SaaS application for franchise compliance management. This is a demo/prototype platform - no backend integration exists. All data is mock/hardcoded in components.

**Repository:** https://github.com/jbutler1551/handypro_phase2
**Secondary Remote (Zach/Kyros):** https://github.com/Kyros-Digital/handypro_phase2

## Tech Stack
- **Framework:** Angular 14
- **Styling:** SCSS with BEM naming, CSS custom properties (design tokens in `src/styles/_variables.scss`)
- **State:** Component-level state, some RxJS observables
- **Routing:** Lazy-loaded feature modules
- **Change Detection:** OnPush strategy throughout

## Project Structure

```
src/app/
├── core/                    # Guards, services, interceptors
│   ├── guards/              # AuthGuard, TenantGuard, SuperAdminGuard
│   └── services/            # AuthService, TenantService
├── shared/                  # Reusable components
│   └── components/          # hp-button, hp-badge, hp-card, hp-modal, etc.
├── layouts/
│   └── main/                # MainLayoutComponent with sidebar, header, mobile-nav
├── features/
│   ├── dashboard/           # Main dashboard with stats, activity, alerts
│   ├── compliance/          # Insurance, Licenses, Certifications, Audit Trail tabs
│   ├── documents/           # Library, Version Control, E-Signatures, Templates tabs
│   ├── franchises/          # Directory list + Detail view with compliance/docs per franchise
│   ├── reports/             # Billing, Franchise, Compliance, Usage report tabs
│   ├── billing/             # Plans, Payment Methods, Invoices, Usage dashboard
│   ├── settings/            # Account, Team, Branding, Notifications, Integrations
│   └── super-admin/         # Platform admin (separate layout, dark theme)
```

## Key Features Built

### Main App (Tenant-facing)
| Route | Module | Description |
|-------|--------|-------------|
| `/dashboard` | DashboardModule | Stats cards, activity feed, alerts, quick actions |
| `/compliance` | ComplianceModule | 4 tabs: Insurance, Licenses, Certifications, Audit Trail |
| `/documents` | DocumentsModule | 4 tabs: Library, Version Control, E-Signatures, Templates |
| `/franchises` | FranchisesModule | Directory grid + detail view (`/franchises/:id`) |
| `/reports` | ReportsModule | 4 tabs: Billing, Franchise, Compliance, Usage |
| `/billing` | BillingModule | 5 tabs: Overview, Plans, Payment Methods, Invoices, Usage |
| `/settings/*` | SettingsModule | Account, Team, Branding, Notifications, Integrations |

### Super Admin (Platform owner)
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | AdminDashboardComponent | Platform-wide metrics, MRR charts, tenant distribution |
| `/admin/tenants` | TenantListComponent | All tenants with search/filter |
| `/admin/tenants/:id` | TenantDetailComponent | Deep dive into single tenant |
| `/admin/analytics` | AdminAnalyticsComponent | Revenue trends, growth, geographic distribution |
| `/admin/feature-flags` | FeatureFlagsComponent | Toggle features, rollout percentages, target plans |
| `/admin/impersonation` | ImpersonationComponent | Login as tenant for support |
| `/admin/system` | SystemComponent | Maintenance mode, cache, security, backups |

## Design System

### Components (in `src/app/shared/components/`)
- `hp-button` - variants: primary, secondary, outline, ghost, danger, link, glass
- `hp-badge` - variants: primary, secondary, success, warning, error, info
- `hp-card` - standard card wrapper
- `hp-modal` - modal dialogs
- `hp-tenant-logo` - displays tenant logo with fallback initials
- `hp-powered-by` - "Powered by TruztPro" footer

### CSS Variables (in `src/styles/_variables.scss`)
- Colors: `--hp-color-primary`, `--hp-color-neutral-*`, `--hp-color-error`, etc.
- Spacing: `--hp-spacing-1` through `--hp-spacing-12`
- Typography: `--hp-font-size-*`, `--hp-font-weight-*`
- Borders: `--hp-radius-*`, `--hp-glass-border`
- Shadows: `--hp-shadow-*`, `--hp-glow-*`

## Branding
- **Platform Name:** TruztPro (not HandyPro)
- **Logos:** `src/assets/images/truztpro-wide-logo.png`, `truztpro-square-logo.jpeg`
- **Theme:** Glass morphism with blur effects, gradient buttons, dark mode support

## Important Notes

1. **No Backend** - All data is mock. Components have hardcoded arrays of sample data.

2. **Lazy Loading** - Each feature module is lazy-loaded via `loadChildren` in routing.

3. **FormsModule** - Some modules need `FormsModule` for `[(ngModel)]` bindings.

4. **Badge Variants** - Use `error` not `danger` for the badge component.

5. **Button Variants** - Available: `primary`, `secondary`, `outline`, `ghost`, `danger`, `link`, `glass`

6. **Super Admin** - Completely separate layout with its own dark theme, accessed via `/admin/*`

## Run Commands

```bash
# Development server
npm run dev        # or ng serve

# Build
npm run build      # or ng build

# The app runs on http://localhost:4200
```

## Git Remotes

```bash
origin  https://github.com/jbutler1551/handypro_phase2.git
zach    https://github.com/Kyros-Digital/handypro_phase2.git
```

## Last Updated
December 20, 2024 - Major expansion completed:
- All main modules (Dashboard, Compliance, Documents, Franchises, Reports, Billing, Settings)
- Full Super Admin section (Dashboard, Analytics, Feature Flags, Impersonation, System)
- 36 files changed, 14,674 lines added
