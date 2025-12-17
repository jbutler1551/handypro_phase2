import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { OnboardingLayoutComponent } from './onboarding-layout.component';

const routes: Routes = [
  {
    path: '',
    component: OnboardingLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/onboarding/onboarding.module').then(m => m.OnboardingModule)
      }
    ]
  }
];

@NgModule({
  declarations: [OnboardingLayoutComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class OnboardingLayoutModule {}
