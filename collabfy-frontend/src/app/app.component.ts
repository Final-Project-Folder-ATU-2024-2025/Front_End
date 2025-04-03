// =======================================================================
// AppComponent
// -----------------------------------------------------------------------
// This is the root component for the Angular application.
// It uses the Angular Router to display the routed components via RouterOutlet.
// =======================================================================

import { Component } from '@angular/core';  // Import Angular's Component decorator
import { RouterOutlet } from '@angular/router';  // Import RouterOutlet to support routing in the template

@Component({
  selector: 'app-root',        // The custom HTML tag used to embed this component
  standalone: true,            // This component is standalone and does not belong to any NgModule
  // The template simply renders the routed component inside the RouterOutlet.
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet]       // Declare RouterOutlet as an imported dependency for the component template
})
export class AppComponent {
  // The AppComponent acts as a shell for the application.
  // It doesn't hold any logic itself; all routing is handled by Angular's Router.
}
