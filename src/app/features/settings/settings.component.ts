import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hp-settings',
  template: `
    <div class="hp-settings">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .hp-settings {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {}
