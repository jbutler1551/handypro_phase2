import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TenantThemeService } from '@core/services/tenant-theme.service';

@Component({
  selector: 'hp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(private tenantThemeService: TenantThemeService) {}

  ngOnInit(): void {
    // Initialize tenant theme on app startup
    this.tenantThemeService.applyTheme();
  }
}
