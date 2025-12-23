import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { PricingComponent } from './pricing.component';

const routes: Routes = [
  { path: '', component: PricingComponent }
];

@NgModule({
  declarations: [PricingComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PricingModule {}
