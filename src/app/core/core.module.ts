import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { TenantService } from './services/tenant.service';
import { TenantThemeService } from './services/tenant-theme.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { TenantGuard } from './guards/tenant.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { RoleGuard } from './guards/role.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Services
    ApiService,
    AuthService,
    TenantService,
    TenantThemeService,

    // Guards
    AuthGuard,
    TenantGuard,
    SuperAdminGuard,
    RoleGuard,

    // Interceptors (order matters!)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  /**
   * Prevent multiple imports of CoreModule
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.'
      );
    }
  }
}
