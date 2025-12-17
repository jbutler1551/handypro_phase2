import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@layouts/auth/auth-layout.module').then(m => m.AuthLayoutModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('@layouts/onboarding/onboarding-layout.module').then(m => m.OnboardingLayoutModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('@features/super-admin/super-admin.module').then(m => m.SuperAdminModule)
  },
  {
    path: '',
    loadChildren: () => import('@layouts/main/main-layout.module').then(m => m.MainLayoutModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
