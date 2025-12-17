import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { OnboardingState, OnboardingData, SubscriptionPlan } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private stateSubject = new BehaviorSubject<OnboardingState>({
    currentStep: 1,
    completedSteps: [],
    data: {}
  });

  state$ = this.stateSubject.asObservable();

  readonly totalSteps = 7;

  readonly plans: SubscriptionPlan[] = [
    {
      id: 'essentials',
      name: 'Essentials',
      tier: 'essentials',
      monthlyPrice: 149,
      annualPrice: 119,
      features: [
        { id: 'f1', name: 'Job Management', description: 'Basic job scheduling and tracking', included: true },
        { id: 'f2', name: 'Customer CRM', description: 'Customer management', included: true },
        { id: 'f3', name: 'Invoicing', description: 'Basic invoicing', included: true },
        { id: 'f4', name: 'Mobile App', description: 'iOS and Android apps', included: true },
        { id: 'f5', name: 'Team Management', description: 'Manage your team', included: false },
        { id: 'f6', name: 'Advanced Reports', description: 'Advanced analytics', included: false },
        { id: 'f7', name: 'API Access', description: 'API integrations', included: false },
        { id: 'f8', name: 'White Label', description: 'Custom branding', included: false }
      ],
      limits: {
        adminSeats: 1,
        technicianSeats: 1,
        locations: 1,
        smsCredits: 100,
        storageGb: 5
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      tier: 'professional',
      monthlyPrice: 299,
      annualPrice: 239,
      features: [
        { id: 'f1', name: 'Job Management', description: 'Advanced job scheduling', included: true },
        { id: 'f2', name: 'Customer CRM', description: 'Customer management with history', included: true },
        { id: 'f3', name: 'Invoicing', description: 'Advanced invoicing with payments', included: true },
        { id: 'f4', name: 'Mobile App', description: 'iOS and Android apps', included: true },
        { id: 'f5', name: 'Team Management', description: 'Manage your team', included: true },
        { id: 'f6', name: 'Advanced Reports', description: 'Advanced analytics', included: true },
        { id: 'f7', name: 'API Access', description: 'API integrations', included: false },
        { id: 'f8', name: 'White Label', description: 'Custom branding', included: false }
      ],
      limits: {
        adminSeats: 3,
        technicianSeats: 3,
        locations: 1,
        smsCredits: 1000,
        storageGb: 10
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      monthlyPrice: 599,
      annualPrice: 479,
      features: [
        { id: 'f1', name: 'Job Management', description: 'Enterprise job scheduling', included: true },
        { id: 'f2', name: 'Customer CRM', description: 'Full CRM suite', included: true },
        { id: 'f3', name: 'Invoicing', description: 'Complete billing suite', included: true },
        { id: 'f4', name: 'Mobile App', description: 'iOS and Android apps', included: true },
        { id: 'f5', name: 'Team Management', description: 'Advanced team management', included: true },
        { id: 'f6', name: 'Advanced Reports', description: 'Enterprise analytics', included: true },
        { id: 'f7', name: 'API Access', description: 'Full API access', included: true },
        { id: 'f8', name: 'White Label', description: 'Full white label', included: true }
      ],
      limits: {
        adminSeats: 10,
        technicianSeats: 50,
        locations: 5,
        smsCredits: 5000,
        storageGb: 50
      }
    }
  ];

  get state(): OnboardingState {
    return this.stateSubject.value;
  }

  get currentStep(): number {
    return this.state.currentStep;
  }

  get data(): OnboardingData {
    return this.state.data;
  }

  setStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.stateSubject.next({
        ...this.state,
        currentStep: step
      });
    }
  }

  nextStep(): void {
    const current = this.state.currentStep;
    if (current < this.totalSteps) {
      const completedSteps = [...this.state.completedSteps];
      if (!completedSteps.includes(current)) {
        completedSteps.push(current);
      }
      this.stateSubject.next({
        ...this.state,
        currentStep: current + 1,
        completedSteps
      });
    }
  }

  previousStep(): void {
    const current = this.state.currentStep;
    if (current > 1) {
      this.stateSubject.next({
        ...this.state,
        currentStep: current - 1
      });
    }
  }

  updateData(data: Partial<OnboardingData>): void {
    this.stateSubject.next({
      ...this.state,
      data: {
        ...this.state.data,
        ...data
      }
    });
  }

  isStepComplete(step: number): boolean {
    return this.state.completedSteps.includes(step);
  }

  canAccessStep(step: number): boolean {
    if (step === 1) return true;
    return this.state.completedSteps.includes(step - 1);
  }

  getSelectedPlan(): SubscriptionPlan | undefined {
    return this.plans.find(p => p.id === this.state.data.planId);
  }

  submitOnboarding(): Observable<{ success: boolean }> {
    // Mock API call
    return of({ success: true }).pipe(
      delay(1500),
      tap(() => {
        // Reset state after successful submission
        this.reset();
      })
    );
  }

  reset(): void {
    this.stateSubject.next({
      currentStep: 1,
      completedSteps: [],
      data: {}
    });
  }
}
