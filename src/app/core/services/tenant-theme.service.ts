import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TenantTheme } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TenantThemeService {
  private readonly DEFAULT_THEME: TenantTheme = {
    primaryColor: '#2196F3',
    secondaryColor: '#4CAF50',
    logoUrl: '/assets/images/handypro-logo.svg',
    faviconUrl: '/assets/images/favicon.ico',
    companyName: 'HandyPro'
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Apply tenant theme to document
   */
  applyTheme(theme: Partial<TenantTheme> = {}): void {
    const mergedTheme = { ...this.DEFAULT_THEME, ...theme };
    const root = this.document.documentElement;

    // Apply primary color and variants
    root.style.setProperty('--hp-color-primary', mergedTheme.primaryColor);
    root.style.setProperty('--hp-color-primary-50', this.lighten(mergedTheme.primaryColor, 0.95));
    root.style.setProperty('--hp-color-primary-100', this.lighten(mergedTheme.primaryColor, 0.85));
    root.style.setProperty('--hp-color-primary-200', this.lighten(mergedTheme.primaryColor, 0.70));
    root.style.setProperty('--hp-color-primary-300', this.lighten(mergedTheme.primaryColor, 0.50));
    root.style.setProperty('--hp-color-primary-400', this.lighten(mergedTheme.primaryColor, 0.25));
    root.style.setProperty('--hp-color-primary-600', this.darken(mergedTheme.primaryColor, 0.10));
    root.style.setProperty('--hp-color-primary-700', this.darken(mergedTheme.primaryColor, 0.20));
    root.style.setProperty('--hp-color-primary-800', this.darken(mergedTheme.primaryColor, 0.30));
    root.style.setProperty('--hp-color-primary-900', this.darken(mergedTheme.primaryColor, 0.40));

    // Apply secondary color and variants
    root.style.setProperty('--hp-color-secondary', mergedTheme.secondaryColor);
    root.style.setProperty('--hp-color-secondary-50', this.lighten(mergedTheme.secondaryColor, 0.95));
    root.style.setProperty('--hp-color-secondary-100', this.lighten(mergedTheme.secondaryColor, 0.85));
    root.style.setProperty('--hp-color-secondary-200', this.lighten(mergedTheme.secondaryColor, 0.70));
    root.style.setProperty('--hp-color-secondary-300', this.lighten(mergedTheme.secondaryColor, 0.50));
    root.style.setProperty('--hp-color-secondary-400', this.lighten(mergedTheme.secondaryColor, 0.25));
    root.style.setProperty('--hp-color-secondary-600', this.darken(mergedTheme.secondaryColor, 0.10));
    root.style.setProperty('--hp-color-secondary-700', this.darken(mergedTheme.secondaryColor, 0.20));
    root.style.setProperty('--hp-color-secondary-800', this.darken(mergedTheme.secondaryColor, 0.30));
    root.style.setProperty('--hp-color-secondary-900', this.darken(mergedTheme.secondaryColor, 0.40));

    // Update favicon
    this.updateFavicon(mergedTheme.faviconUrl);

    // Update page title
    this.document.title = mergedTheme.companyName;
  }

  /**
   * Reset theme to defaults
   */
  resetTheme(): void {
    this.applyTheme(this.DEFAULT_THEME);
  }

  /**
   * Get default theme
   */
  getDefaultTheme(): TenantTheme {
    return { ...this.DEFAULT_THEME };
  }

  /**
   * Lighten a hex color
   */
  private lighten(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.round(rgb.r + (255 - rgb.r) * amount);
    const g = Math.round(rgb.g + (255 - rgb.g) * amount);
    const b = Math.round(rgb.b + (255 - rgb.b) * amount);

    return this.rgbToHex(r, g, b);
  }

  /**
   * Darken a hex color
   */
  private darken(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.round(rgb.r * (1 - amount));
    const g = Math.round(rgb.g * (1 - amount));
    const b = Math.round(rgb.b * (1 - amount));

    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert hex to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex
   */
  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.max(0, Math.min(255, n)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Update favicon
   */
  private updateFavicon(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel*='icon']");

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }

    link.href = url;
  }

  /**
   * Get contrast color (black or white) for a given background color
   */
  getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Check if color meets WCAG AA contrast ratio
   */
  meetsContrastRequirement(foreground: string, background: string, largeText: boolean = false): boolean {
    const fgRgb = this.hexToRgb(foreground);
    const bgRgb = this.hexToRgb(background);

    if (!fgRgb || !bgRgb) return false;

    const fgLuminance = this.getRelativeLuminance(fgRgb);
    const bgLuminance = this.getRelativeLuminance(bgRgb);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    const contrastRatio = (lighter + 0.05) / (darker + 0.05);

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    const requiredRatio = largeText ? 3 : 4.5;
    return contrastRatio >= requiredRatio;
  }

  /**
   * Calculate relative luminance
   */
  private getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    const [r, g, b] = sRGB.map(val =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}
