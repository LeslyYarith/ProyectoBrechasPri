import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly darkModeKey = 'dark-mode';
  private isBrowser: boolean;
  private darkTheme = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // 👉 Revisa si el usuario ya guardó una preferencia
      const savedTheme = localStorage.getItem(this.darkModeKey);

      if (savedTheme !== null) {
        this.darkTheme = savedTheme === 'dark';
      } else {
        // 👉 Si no hay preferencia, usamos la del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.darkTheme = prefersDark;
      }

      this.applyTheme();
    }
  }

  /** Alternar entre claro y oscuro */
  toggleTheme() {
    if (!this.isBrowser) return;

    this.darkTheme = !this.darkTheme;
    localStorage.setItem(this.darkModeKey, this.darkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  /** Saber si el tema actual es oscuro */
  isDarkTheme(): boolean {
    return this.darkTheme;
  }

  /** Aplica el tema al <body> */
  private applyTheme() {
    if (!this.isBrowser) return;

    if (this.darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
