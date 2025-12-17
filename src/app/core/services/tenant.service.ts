import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TenantThemeService } from './tenant-theme.service';
import { Tenant, TenantTheme, TenantSettings, ApiResponse } from '../models';

const TENANT_KEY = 'hp_tenant';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private tenantSubject = new BehaviorSubject<Tenant | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public tenant$ = this.tenantSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private themeService: TenantThemeService
  ) {
    this.initializeTenant();
  }

  /**
   * Initialize tenant from storage
   */
  private initializeTenant(): void {
    const storedTenant = this.getStoredTenant();
    if (storedTenant) {
      this.tenantSubject.next(storedTenant);
      this.themeService.applyTheme(storedTenant.theme);
    }
  }

  /**
   * Get current tenant value
   */
  get tenant(): Tenant | null {
    return this.tenantSubject.value;
  }

  /**
   * Set current tenant
   */
  setTenant(tenant: Tenant): void {
    this.tenantSubject.next(tenant);
    this.setStoredTenant(tenant);
    this.themeService.applyTheme(tenant.theme);
  }

  /**
   * Clear tenant data
   */
  clearTenant(): void {
    this.tenantSubject.next(null);
    this.clearStoredTenant();
    this.themeService.resetTheme();
  }

  /**
   * Load tenant by ID
   */
  loadTenant(tenantId: string): Observable<Tenant> {
    this.isLoadingSubject.next(true);

    // Mock implementation for development
    return this.mockLoadTenant(tenantId);

    // Production implementation:
    // return this.apiService.get<Tenant>(`/tenants/${tenantId}`).pipe(
    //   map(response => {
    //     if (response.status === 'success' && response.data) {
    //       this.setTenant(response.data);
    //       return response.data;
    //     }
    //     throw new Error(response.message || 'Failed to load tenant');
    //   }),
    //   finalize(() => this.isLoadingSubject.next(false))
    // );
  }

  /**
   * Mock load tenant for development
   */
  private mockLoadTenant(tenantId: string): Observable<Tenant> {
    const mockTenant: Tenant = {
      id: tenantId,
      name: 'Demo Company',
      slug: 'demo-company',
      status: 'active',
      plan: {
        id: 'professional',
        name: 'Professional',
        tier: 'professional',
        monthlyPrice: 299,
        annualPrice: 239,
        features: [],
        limits: {
          adminSeats: 3,
          technicianSeats: 3,
          locations: 1,
          smsCredits: 1000,
          storageGb: 10
        }
      },
      theme: {
        primaryColor: '#2196F3',
        secondaryColor: '#4CAF50',
        logoUrl: '/assets/images/handypro-logo.svg',
        faviconUrl: '/assets/images/favicon.ico',
        companyName: 'Demo Company'
      },
      settings: {
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        businessHours: {
          monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
          saturday: { isOpen: false },
          sunday: { isOpen: false }
        }
      },
      subscription: {
        id: 'sub-1',
        planId: 'professional',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(mockTenant).pipe(
      delay(300),
      tap(tenant => {
        this.setTenant(tenant);
        this.isLoadingSubject.next(false);
      })
    );
  }

  /**
   * Update tenant theme
   */
  updateTheme(theme: Partial<TenantTheme>): Observable<ApiResponse<Tenant>> {
    // Mock implementation
    const currentTenant = this.tenant;
    if (currentTenant) {
      const updatedTenant = {
        ...currentTenant,
        theme: { ...currentTenant.theme, ...theme }
      };
      this.setTenant(updatedTenant);
      return of({ status: 'success' as const, data: updatedTenant }).pipe(delay(300));
    }
    return of({ status: 'error' as const, message: 'No tenant loaded' });

    // Production:
    // return this.apiService.patch<Tenant>(`/tenants/${this.tenant?.id}/theme`, theme).pipe(
    //   tap(response => {
    //     if (response.status === 'success' && response.data) {
    //       this.setTenant(response.data);
    //     }
    //   })
    // );
  }

  /**
   * Update tenant settings
   */
  updateSettings(settings: Partial<TenantSettings>): Observable<ApiResponse<Tenant>> {
    // Mock implementation
    const currentTenant = this.tenant;
    if (currentTenant) {
      const updatedTenant = {
        ...currentTenant,
        settings: { ...currentTenant.settings, ...settings }
      };
      this.setTenant(updatedTenant);
      return of({ status: 'success' as const, data: updatedTenant }).pipe(delay(300));
    }
    return of({ status: 'error' as const, message: 'No tenant loaded' });

    // Production:
    // return this.apiService.patch<Tenant>(`/tenants/${this.tenant?.id}/settings`, settings);
  }

  /**
   * Check if tenant is on a specific plan
   */
  isPlan(tier: string): boolean {
    return this.tenant?.plan.tier === tier;
  }

  /**
   * Check if tenant is on enterprise plan
   */
  isEnterprise(): boolean {
    return this.isPlan('enterprise');
  }

  /**
   * Check if tenant is in trial
   */
  isTrialing(): boolean {
    return this.tenant?.subscription.status === 'trialing';
  }

  /**
   * Get days remaining in trial
   */
  getTrialDaysRemaining(): number {
    const trialEnd = this.tenant?.subscription.trialEnd;
    if (!trialEnd) return 0;
    const now = new Date();
    const end = new Date(trialEnd);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // ==========================================================================
  // STORAGE
  // ==========================================================================

  private getStoredTenant(): Tenant | null {
    const tenantJson = localStorage.getItem(TENANT_KEY);
    if (tenantJson) {
      try {
        return JSON.parse(tenantJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private setStoredTenant(tenant: Tenant): void {
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
  }

  private clearStoredTenant(): void {
    localStorage.removeItem(TENANT_KEY);
  }
}
