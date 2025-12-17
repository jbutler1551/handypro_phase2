import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { JobsListComponent } from './jobs-list.component';
import { JobDetailComponent } from './job-detail.component';

const routes: Routes = [
  { path: '', component: JobsListComponent },
  { path: ':id', component: JobDetailComponent }
];

@NgModule({
  declarations: [
    JobsListComponent,
    JobDetailComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class JobsModule {}
