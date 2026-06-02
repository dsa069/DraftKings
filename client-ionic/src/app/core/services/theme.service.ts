import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme_dark_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDark = signal<boolean>(true);

  public readonly isDark = this._isDark.asReadonly();

  constructor() {
    this.restore();
  }

  toggle(): void {
    const newValue = !this._isDark();
    this._isDark.set(newValue);
    this.apply(newValue);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
  }

  private apply(dark: boolean): void {
    document.body.classList.toggle('ion-palette-dark', dark);
    document.body.classList.toggle('ion-palette-light', !dark);
  }

  private restore(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    const dark = stored !== null ? JSON.parse(stored) : true;
    this._isDark.set(dark);
    this.apply(dark);
  }
}
