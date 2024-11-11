import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Import RouterModule to recognize router-outlet
  template: `
    <router-outlet></router-outlet> <!-- Renders routed components here -->
  `,
})
export class AppComponent {}
