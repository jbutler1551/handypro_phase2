import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { SettingsComponent } from './settings.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { BrandingSettingsComponent } from './components/branding-settings/branding-settings.component';
import { TeamSettingsComponent } from './components/team-settings/team-settings.component';
import { NotificationsSettingsComponent } from './components/notifications-settings/notifications-settings.component';
import { IntegrationsSettingsComponent } from './components/integrations-settings/integrations-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'account', pathMatch: 'full' },
      { path: 'account', component: AccountSettingsComponent },
      { path: 'branding', component: BrandingSettingsComponent },
      { path: 'franchises', component: TeamSettingsComponent },
      { path: 'notifications', component: NotificationsSettingsComponent },
      { path: 'integrations', component: IntegrationsSettingsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SettingsComponent,
    AccountSettingsComponent,
    BrandingSettingsComponent,
    TeamSettingsComponent,
    NotificationsSettingsComponent,
    IntegrationsSettingsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SettingsModule {}
