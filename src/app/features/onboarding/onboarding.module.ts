import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { OnboardingComponent } from './onboarding.component';
import { StepPlanComponent } from './components/step-plan/step-plan.component';
import { StepAccountComponent } from './components/step-account/step-account.component';
import { StepCompanyComponent } from './components/step-company/step-company.component';
import { StepServicesComponent } from './components/step-services/step-services.component';
import { StepTeamComponent } from './components/step-team/step-team.component';
import { StepPaymentComponent } from './components/step-payment/step-payment.component';
import { StepConfirmationComponent } from './components/step-confirmation/step-confirmation.component';

const routes: Routes = [
  { path: '', component: OnboardingComponent }
];

@NgModule({
  declarations: [
    OnboardingComponent,
    StepPlanComponent,
    StepAccountComponent,
    StepCompanyComponent,
    StepServicesComponent,
    StepTeamComponent,
    StepPaymentComponent,
    StepConfirmationComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class OnboardingModule {}
