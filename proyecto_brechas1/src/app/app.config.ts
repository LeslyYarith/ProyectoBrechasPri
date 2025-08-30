import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),                      // ✅ HTTP listo
    provideRouter(routes),                    // ✅ Rutas
    provideZoneChangeDetection({ eventCoalescing: true }), // ✅ CD
    provideClientHydration(withEventReplay()) // ✅ Hydration SSR
  ]
};
