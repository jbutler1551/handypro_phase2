import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TenantService } from '../services/tenant.service';

@Injectable({
  providedIn: 'root'
})
export class TenantGuard implements CanActivate, CanActivateChild {
  constructor(
    private tenantService: TenantService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkTenant();
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkTenant();
  }

  private checkTenant(): Observable<boolean | UrlTree> {
    return this.tenantService.tenant$.pipe(
      take(1),
      map(tenant => {
        if (tenant) {
          // Check if tenant is active
          if (tenant.status === 'suspended') {
            return this.router.createUrlTree(['/suspended']);
          }
          if (tenant.status === 'cancelled') {
            return this.router.createUrlTree(['/cancelled']);
          }
          return true;
        }

        // No tenant loaded - redirect to login
        return this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}
