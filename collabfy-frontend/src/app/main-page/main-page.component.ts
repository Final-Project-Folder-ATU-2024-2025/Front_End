// =======================================================================
// Import Angular modules and core functionalities.
// -----------------------------------------------------------------------
import { Component } from '@angular/core';         // Core Angular component functionality
import { CommonModule } from '@angular/common';      // Common directives such as ngIf, ngFor
import { HeaderPublicComponent } from '../header-public/header-public.component'; // Public header component
import { FooterComponent } from '../footer/footer.component'; // Footer component
import { FormsModule } from '@angular/forms';        // Template-driven forms (ngModel)
import { HttpClientModule } from '@angular/common/http'; // HTTP client for API requests
import { Router } from '@angular/router';            // Angular router for navigation

// =======================================================================
// MainPageComponent:
// This component defines the home page content, including two main content
// sections with text and images, and a join button that navigates to the 
// Create Account page.
// =======================================================================
@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, HeaderPublicComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  // -----------------------------------------------------------------------
  // Constructor: Injects the Angular Router service.
  // -----------------------------------------------------------------------
  constructor(private router: Router) {}

  // -----------------------------------------------------------------------
  // goToCreateAccount:
  // Navigates the user to the Create Account page when the join button is clicked.
  // -----------------------------------------------------------------------
  goToCreateAccount(): void {
    this.router.navigate(['/create-account']);
  }
}
