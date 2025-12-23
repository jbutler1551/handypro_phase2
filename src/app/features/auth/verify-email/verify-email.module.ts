import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { VerifyEmailComponent } from './verify-email.component';

const routes: Routes = [
  { path: '', component: VerifyEmailComponent }
];

@NgModule({
  declarations: [VerifyEmailComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class VerifyEmailModule {}
