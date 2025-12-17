import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { ScheduleComponent } from './schedule.component';

const routes: Routes = [{ path: '', component: ScheduleComponent }];

@NgModule({
  declarations: [ScheduleComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ScheduleModule {}
