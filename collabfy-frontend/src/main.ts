// =======================================================================
// Import bootstrapApplication from Angular's platform-browser.
// This function bootstraps the root component of the application.
// =======================================================================
import { bootstrapApplication } from '@angular/platform-browser';

// =======================================================================
// Import the root AppComponent which is the starting point of the app.
// =======================================================================
import { AppComponent } from './app/app.component';

// =======================================================================
// Import global application configuration including providers (e.g., routes, HttpClient).
// =======================================================================
import { appConfig } from './app/app.config';

// =======================================================================
// Bootstrap the Angular application with the AppComponent and global configuration.
// Any errors during bootstrap will be logged to the console.
// =======================================================================
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
