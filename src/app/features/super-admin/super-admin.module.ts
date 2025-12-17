import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { SuperAdminComponent } from './super-admin.component';
import { TenantListComponent } from './components/tenant-list/tenant-list.component';
import { TenantDetailComponent } from './components/tenant-detail/tenant-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminComponent,
    children: [
      { path: '', redirectTo: 'tenants', pathMatch: 'full' },
      { path: 'tenants', component: TenantListComponent },
      { path: 'tenants/:id', component: TenantDetailComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SuperAdminComponent,
    TenantListComponent,
    TenantDetailComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SuperAdminModule {}
