import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'hp-theme-mode';
  private readonly DARK_CLASS = 'hp-theme-dark';

  private themeModeSubject = new BehaviorSubject<ThemeMode>(this.getStoredTheme());
  private isDarkSubject = new BehaviorSubject<boolean>(false);

  themeMode$: Observable<ThemeMode> = this.themeModeSubject.asObservable();
  isDark$: Observable<boolean> = this.isDarkSubject.asObservable();

  private mediaQuery: MediaQueryList | null = null;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initializeTheme();
  }

  /**
   * Initialize theme based on stored preference or system setting
   */
  private initializeTheme(): void {
    // Set up system preference listener
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', (e) => {
        if (this.themeModeSubject.value === 'system') {
          this.applyTheme(e.matches);
        }
      });
    }

    // Apply initial theme
    const storedTheme = this.getStoredTheme();
    this.setTheme(storedTheme);
  }

  /**
   * Get stored theme from localStorage
   */
  private getStoredTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored;
      }
    }
    return 'light';
  }

  /**
   * Get current theme mode
   */
  get currentTheme(): ThemeMode {
    return this.themeModeSubject.value;
  }

  /**
   * Check if current effective theme is dark
   */
  get isDark(): boolean {
    return this.isDarkSubject.value;
  }

  /**
   * Set theme mode
   */
  setTheme(mode: ThemeMode): void {
    this.themeModeSubject.next(mode);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, mode);
    }

    let isDark: boolean;
    if (mode === 'system') {
      isDark = this.mediaQuery?.matches ?? false;
    } else {
      isDark = mode === 'dark';
    }

    this.applyTheme(isDark);
  }

  /**
   * Toggle between light and dark modes
   */
  toggleTheme(): void {
    const current = this.themeModeSubject.value;
    if (current === 'system') {
      // If on system, switch to opposite of current system preference
      this.setTheme(this.isDark ? 'light' : 'dark');
    } else {
      this.setTheme(current === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(isDark: boolean): void {
    this.isDarkSubject.next(isDark);

    const root = this.document.documentElement;

    if (isDark) {
      root.classList.add(this.DARK_CLASS);
    } else {
      root.classList.remove(this.DARK_CLASS);
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(isDark);
  }

  /**
   * Update meta theme-color tag
   */
  private updateMetaThemeColor(isDark: boolean): void {
    let meta = this.document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = this.document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      this.document.head.appendChild(meta);
    }

    meta.setAttribute('content', isDark ? '#1F2937' : '#FFFFFF');
  }
}
