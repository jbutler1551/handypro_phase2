import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AuthGuard } from '@core/guards/auth.guard';
import { TenantGuard } from '@core/guards/tenant.guard';

import { MainLayoutComponent } from './main-layout.component';
import { SidebarComponent } from './components/sidebar';
import { HeaderComponent } from './components/header';
import { MobileNavComponent } from './components/mobile-nav';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, TenantGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('@features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('@features/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('@features/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'compliance',
        loadChildren: () => import('@features/compliance/compliance.module').then(m => m.ComplianceModule)
      },
      {
        path: 'documents',
        loadChildren: () => import('@features/documents/documents.module').then(m => m.DocumentsModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('@features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'franchises',
        loadChildren: () => import('@features/franchises/franchises.module').then(m => m.FranchisesModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    MobileNavComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class MainLayoutModule {}
