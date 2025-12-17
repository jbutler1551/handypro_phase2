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
        path: 'jobs',
        loadChildren: () => import('@features/jobs/jobs.module').then(m => m.JobsModule)
      },
      {
        path: 'customers',
        loadChildren: () => import('@features/customers/customers.module').then(m => m.CustomersModule)
      },
      {
        path: 'schedule',
        loadChildren: () => import('@features/schedule/schedule.module').then(m => m.ScheduleModule)
      },
      {
        path: 'invoices',
        loadChildren: () => import('@features/invoices/invoices.module').then(m => m.InvoicesModule)
      },
      {
        path: 'team',
        loadChildren: () => import('@features/team/team.module').then(m => m.TeamModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('@features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('@features/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('@features/settings/settings.module').then(m => m.SettingsModule)
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
