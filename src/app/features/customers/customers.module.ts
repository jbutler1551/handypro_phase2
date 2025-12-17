import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { CustomersListComponent } from './customers-list.component';
import { CustomerDetailComponent } from './customer-detail.component';

const routes: Routes = [
  { path: '', component: CustomersListComponent },
  { path: ':id', component: CustomerDetailComponent }
];

@NgModule({
  declarations: [
    CustomersListComponent,
    CustomerDetailComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class CustomersModule {}
