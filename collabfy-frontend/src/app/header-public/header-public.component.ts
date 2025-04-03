// =======================================================================
// Import Angular core functionalities and modules
// -----------------------------------------------------------------------
import { Component, OnInit } from '@angular/core'; // Core Angular functionality
import { Router, NavigationEnd, RouterLink } from '@angular/router'; // Router for navigation and routing events
import { CommonModule } from '@angular/common'; // Common directives like ngIf, ngFor
import { filter } from 'rxjs/operators'; // RxJS operator to filter router events

// =======================================================================
// HeaderPublicComponent:
// This component represents the public header for pages such as login, create account, etc.
// It displays the logo and dynamic authentication links based on the current URL.
// =======================================================================
@Component({
  selector: 'app-header-public',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-public.component.html',
  styleUrls: ['./header-public.component.css']
})
export class HeaderPublicComponent implements OnInit {
  // Property to hold the current URL
  currentUrl: string = '';

  // Inject the Angular Router
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize the current URL from the router
    this.currentUrl = this.router.url;
    // Subscribe to navigation events to update the current URL dynamically
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
  }
}
