import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';  // <-- add this
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // ← Magic line!
        anchorScrolling: 'enabled'
      })
    ),
    provideAnimationsAsync(),
    importProvidersFrom(HttpClientModule)  // <-- connect to backend
  ]
};
