import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantService } from '../services/tenant.service';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  constructor(private tenantService: TenantService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip tenant header for certain endpoints
    if (this.shouldSkipTenant(request.url)) {
      return next.handle(request);
    }

    // Add tenant ID to request headers
    const tenant = this.tenantService.tenant;
    if (tenant) {
      request = request.clone({
        setHeaders: {
          'X-Tenant-ID': tenant.id,
          'X-Tenant-Slug': tenant.slug
        }
      });
    }

    return next.handle(request);
  }

  /**
   * Check if endpoint should skip tenant header
   */
  private shouldSkipTenant(url: string): boolean {
    const skipEndpoints = [
      '/auth/',
      '/plans',
      '/platform/' // Super admin endpoints
    ];

    return skipEndpoints.some(endpoint => url.includes(endpoint));
  }
}
