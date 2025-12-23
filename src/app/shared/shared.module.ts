import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { ButtonComponent } from './components/button';
import { InputComponent } from './components/input';
import { CardComponent } from './components/card';
import { AlertComponent } from './components/alert';
import { ModalComponent } from './components/modal';
import { SpinnerComponent } from './components/spinner';
import { BadgeComponent } from './components/badge';
import { AvatarComponent } from './components/avatar';
import { SkeletonComponent } from './components/skeleton';
import { CheckboxComponent } from './components/checkbox';
import { EmptyStateComponent } from './components/empty-state';
import { StatCardComponent } from './components/stat-card';
import { BreadcrumbsComponent } from './components/breadcrumbs';
import { PaginationComponent } from './components/pagination';
import { DividerComponent } from './components/divider';
import { TenantLogoComponent } from './components/tenant-logo';
import { PoweredByComponent } from './components/powered-by';
import { TrialBannerComponent } from './components/trial-banner';
import { UsageMeterComponent } from './components/usage-meter';
import { PasswordStrengthComponent } from './components/password-strength';

const COMPONENTS = [
  ButtonComponent,
  InputComponent,
  CardComponent,
  AlertComponent,
  ModalComponent,
  SpinnerComponent,
  BadgeComponent,
  AvatarComponent,
  SkeletonComponent,
  CheckboxComponent,
  EmptyStateComponent,
  StatCardComponent,
  BreadcrumbsComponent,
  PaginationComponent,
  DividerComponent,
  TenantLogoComponent,
  PoweredByComponent,
  TrialBannerComponent,
  UsageMeterComponent,
  PasswordStrengthComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    // Re-export Angular modules for convenience
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Export all components
    ...COMPONENTS
  ]
})
export class SharedModule {}
