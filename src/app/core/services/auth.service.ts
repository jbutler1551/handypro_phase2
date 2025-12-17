import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TenantService } from './tenant.service';
import {
  User,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse
} from '../models';

const TOKEN_KEY = 'hp_access_token';
const REFRESH_TOKEN_KEY = 'hp_refresh_token';
const USER_KEY = 'hp_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private tenantService: TenantService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored tokens
   * For demo: Auto-login with mock data
   */
  private initializeAuth(): void {
    const token = this.getAccessToken();
    const storedUser = this.getStoredUser();

    if (token && storedUser) {
      this.currentUserSubject.next(storedUser);
      this.isAuthenticatedSubject.next(true);
    } else {
      // Demo mode: Auto-login with mock user
      this.setupDemoUser();
    }

    this.isLoadingSubject.next(false);
  }

  /**
   * Setup demo user for development/preview
   */
  private setupDemoUser(): void {
    const demoUser: User = {
      id: 'demo-1',
      email: 'demo@handypro.app',
      firstName: 'John',
      lastName: 'Doe',
      role: 'TENANT_OWNER',
      tenantId: 'tenant-demo',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const demoTenant = {
      id: 'tenant-demo',
      name: 'Acme Plumbing Co.',
      slug: 'acme-plumbing',
      status: 'active' as const,
      plan: {
        id: 'professional',
        name: 'Professional',
        tier: 'professional' as const,
        monthlyPrice: 149,
        annualPrice: 119,
        features: [
          { id: 'f1', name: 'Unlimited jobs', description: 'Create unlimited jobs', included: true },
          { id: 'f2', name: 'Team management', description: 'Manage your team', included: true },
          { id: 'f3', name: 'Invoicing', description: 'Professional invoicing', included: true },
          { id: 'f4', name: 'Reports', description: 'Detailed reports', included: true }
        ],
        limits: {
          adminSeats: 3,
          technicianSeats: 10,
          locations: 3,
          smsCredits: 1000,
          storageGb: 25
        }
      },
      theme: {
        primaryColor: '#2563EB',
        secondaryColor: '#059669',
        logoUrl: '/assets/images/handypro-logo.svg',
        faviconUrl: '/assets/images/favicon.ico',
        companyName: 'Acme Plumbing Co.'
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
          saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
          sunday: { isOpen: false }
        }
      },
      subscription: {
        id: 'sub-demo',
        planId: 'professional',
        status: 'active' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set demo tokens
    sessionStorage.setItem(TOKEN_KEY, 'demo-token');
    sessionStorage.setItem(USER_KEY, JSON.stringify(demoUser));

    this.currentUserSubject.next(demoUser);
    this.isAuthenticatedSubject.next(true);
    this.tenantService.setTenant(demoTenant);
  }

  /**
   * Get current user value
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // For development/demo: Return mock data
    // In production, replace with actual API call
    return this.mockLogin(credentials);

    // Production implementation:
    // return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
    //   map(response => {
    //     if (response.status === 'success' && response.data) {
    //       this.handleLoginSuccess(response.data, credentials.rememberMe);
    //       return response.data;
    //     }
    //     throw new Error(response.message || 'Login failed');
    //   })
    // );
  }

  /**
   * Mock login for development
   */
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Simulate API delay
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
      role: credentials.email.includes('admin') ? 'SUPER_ADMIN' : 'TENANT_OWNER',
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockResponse: LoginResponse = {
      user: mockUser,
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      },
      tenant: {
        id: 'tenant-1',
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
      }
    };

    return of(mockResponse).pipe(
      delay(500), // Simulate network delay
      tap(response => {
        this.handleLoginSuccess(response, credentials.rememberMe);
      })
    );
  }

  /**
   * Handle successful login
   */
  private handleLoginSuccess(response: LoginResponse, rememberMe?: boolean): void {
    this.setTokens(response.tokens, rememberMe);
    this.setStoredUser(response.user, rememberMe);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);

    if (response.tenant) {
      this.tenantService.setTenant(response.tenant);
    }
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<ApiResponse<LoginResponse>> {
    return this.apiService.post<LoginResponse>('/auth/register', data);
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearTokens();
    this.clearStoredUser();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.tenantService.clearTenant();
    this.router.navigate(['/login']);
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<ApiResponse<void>> {
    // Mock implementation
    return of({ status: 'success' as const }).pipe(delay(500));
    // Production: return this.apiService.post<void>('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, password: string): Observable<ApiResponse<void>> {
    // Mock implementation
    return of({ status: 'success' as const }).pipe(delay(500));
    // Production: return this.apiService.post<void>('/auth/reset-password', { token, password });
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.apiService.post<AuthTokens>('/auth/refresh', { refreshToken }).pipe(
      map(response => {
        if (response.status === 'success' && response.data) {
          this.setTokens(response.data);
          return response.data;
        }
        throw new Error('Token refresh failed');
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string | string[]): boolean {
    const user = this.currentUser;
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  /**
   * Check if user is tenant owner or admin
   */
  isTenantAdmin(): boolean {
    return this.hasRole(['TENANT_OWNER', 'TENANT_ADMIN']);
  }

  // ==========================================================================
  // TOKEN MANAGEMENT
  // ==========================================================================

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setTokens(tokens: AuthTokens, remember: boolean = false): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, tokens.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private setStoredUser(user: User, remember: boolean = false): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearStoredUser(): void {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}
