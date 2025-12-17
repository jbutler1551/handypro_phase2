import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AuthLayoutComponent } from './auth-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadChildren: () => import('@features/auth/login/login.module').then(m => m.LoginModule)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('@features/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
      },
      {
        path: 'reset-password',
        loadChildren: () => import('@features/auth/reset-password/reset-password.module').then(m => m.ResetPasswordModule)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [AuthLayoutComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthLayoutModule {}
