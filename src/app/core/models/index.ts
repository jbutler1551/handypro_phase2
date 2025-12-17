// ============================================================================
// Core Models / Interfaces
// ============================================================================

// ==========================================================================
// USER & AUTH
// ==========================================================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_OWNER'
  | 'TENANT_ADMIN'
  | 'LOCATION_MANAGER'
  | 'PROCREW'
  | 'CRAFTSMAN'
  | 'CLIENT';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  tenant?: Tenant;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  planId: string;
}

// ==========================================================================
// TENANT
// ==========================================================================
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
  theme: TenantTheme;
  settings: TenantSettings;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  businessHours: BusinessHours;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

// ==========================================================================
// SUBSCRIPTION & BILLING
// ==========================================================================
export interface Subscription {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  limits: PlanLimits;
}

export type PlanTier = 'essentials' | 'professional' | 'enterprise';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface PlanLimits {
  adminSeats: number;
  technicianSeats: number;
  locations: number;
  smsCredits: number;
  storageGb: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
  createdAt: Date;
  paidAt?: Date;
  pdfUrl?: string;
}

export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'void';

export interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// ==========================================================================
// NAVIGATION
// ==========================================================================
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number | string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

// ==========================================================================
// API RESPONSE
// ==========================================================================
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================================================
// TABLE
// ==========================================================================
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  template?: any;
}

// ==========================================================================
// ONBOARDING
// ==========================================================================
export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: OnboardingData;
}

export interface OnboardingData {
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  account?: AccountFormData;
  company?: CompanyFormData;
  services?: ServiceFormData;
  team?: TeamFormData;
  payment?: PaymentFormData;
}

export interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  termsAccepted: boolean;
}

export interface CompanyFormData {
  companyName: string;
  businessType: string;
  industries: string[];
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceAreaType: 'zip' | 'radius';
  serviceZipCodes?: string[];
  serviceRadius?: number;
}

export interface ServiceFormData {
  services: ServiceCategory[];
  minimumJobFee: number;
  estimateFee: number;
  cancellationPolicy: string;
  serviceTaxRate: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  enabled: boolean;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  name: string;
  enabled: boolean;
  rate?: number;
}

export interface TeamFormData {
  invitations: TeamInvitation[];
}

export interface TeamInvitation {
  email: string;
  role: UserRole;
  message?: string;
}

export interface PaymentFormData {
  cardComplete: boolean;
  billingAddress: BillingAddress;
  couponCode?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
