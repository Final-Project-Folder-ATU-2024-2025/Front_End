// =======================================================================
// app.config.ts
// -----------------------------------------------------------------------
// This file provides the global configuration for the Angular application.
// It sets up the router and HTTP client providers to be available throughout
// the application.
// =======================================================================

import { ApplicationConfig } from '@angular/core'; // Core Angular functionality for application configuration
import { provideRouter } from '@angular/router';       // Function to register the router with application routes
import { provideHttpClient } from '@angular/common/http'; // Function to register the HttpClient globally
import { routes } from './app.routes';                  // Import the application routes from app.routes.ts

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),    // Set up the Angular Router with the defined routes
    provideHttpClient()       // Register HttpClient globally so it can be injected in any service/component
  ]
};
