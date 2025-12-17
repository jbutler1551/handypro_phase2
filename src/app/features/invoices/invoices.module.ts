import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { InvoicesListComponent } from './invoices-list.component';
import { InvoiceDetailComponent } from './invoice-detail.component';

const routes: Routes = [
  { path: '', component: InvoicesListComponent },
  { path: ':id', component: InvoiceDetailComponent }
];

@NgModule({
  declarations: [InvoicesListComponent, InvoiceDetailComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class InvoicesModule {}
