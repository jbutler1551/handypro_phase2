import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';

import { SuperAdminComponent } from './super-admin.component';
import { TenantListComponent } from './components/tenant-list/tenant-list.component';
import { TenantDetailComponent } from './components/tenant-detail/tenant-detail.component';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { ImpersonationComponent } from './components/impersonation/impersonation.component';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'tenants', component: TenantListComponent },
      { path: 'tenants/:id', component: TenantDetailComponent },
      { path: 'impersonation', component: ImpersonationComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SuperAdminComponent,
    TenantListComponent,
    TenantDetailComponent,
    AdminDashboardComponent,
    ImpersonationComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SuperAdminModule {}
