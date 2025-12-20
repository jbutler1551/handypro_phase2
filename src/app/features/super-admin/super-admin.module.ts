import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';

import { SuperAdminComponent } from './super-admin.component';
import { TenantListComponent } from './components/tenant-list/tenant-list.component';
import { TenantDetailComponent } from './components/tenant-detail/tenant-detail.component';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminAnalyticsComponent } from './components/analytics/analytics.component';
import { FeatureFlagsComponent } from './components/feature-flags/feature-flags.component';
import { ImpersonationComponent } from './components/impersonation/impersonation.component';
import { SystemComponent } from './components/system/system.component';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'tenants', component: TenantListComponent },
      { path: 'tenants/:id', component: TenantDetailComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'feature-flags', component: FeatureFlagsComponent },
      { path: 'impersonation', component: ImpersonationComponent },
      { path: 'system', component: SystemComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SuperAdminComponent,
    TenantListComponent,
    TenantDetailComponent,
    AdminDashboardComponent,
    AdminAnalyticsComponent,
    FeatureFlagsComponent,
    ImpersonationComponent,
    SystemComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SuperAdminModule {}
