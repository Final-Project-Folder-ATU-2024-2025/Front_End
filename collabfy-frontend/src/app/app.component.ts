import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Import RouterModule to recognize router-outlet
  template: `
    <router-outlet></router-outlet> <!-- Renders routed components here -->
  `,
})

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Enables Routing
    provideHttpClient(), // Enables HTTP Requests
  ]
};
