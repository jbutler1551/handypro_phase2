import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { TeamListComponent } from './team-list.component';

const routes: Routes = [{ path: '', component: TeamListComponent }];

@NgModule({
  declarations: [TeamListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class TeamModule {}
