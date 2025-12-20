import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { ComplianceComponent } from './compliance.component';

const routes: Routes = [
  { path: '', component: ComplianceComponent }
];

@NgModule({
  declarations: [ComplianceComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ComplianceModule {}
