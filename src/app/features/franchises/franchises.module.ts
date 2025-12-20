import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { FranchisesComponent } from './franchises.component';
import { FranchiseDetailComponent } from './components/franchise-detail.component';

const routes: Routes = [
  { path: '', component: FranchisesComponent },
  { path: ':id', component: FranchiseDetailComponent },
  { path: ':id/edit', component: FranchiseDetailComponent }
];

@NgModule({
  declarations: [
    FranchisesComponent,
    FranchiseDetailComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class FranchisesModule {}
