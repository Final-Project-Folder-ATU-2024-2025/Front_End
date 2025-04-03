// ========================================================
// Angular and External Module Imports
// ========================================================

// Angular core functionalities for building components and handling initialization
import { Component, OnInit } from '@angular/core';
// CommonModule provides common directives such as ngIf and ngFor
import { CommonModule } from '@angular/common';
// FormsModule is required for template-driven forms (e.g., using ngModel and ngForm)
import { FormsModule } from '@angular/forms';
// FontAwesomeModule allows the use of <fa-icon> for displaying icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Router is used for navigation between different views/components
import { Router } from '@angular/router';

// ========================================================
// Custom Component and Service Imports
// ========================================================

// HeaderComponent and FooterComponent are custom UI components for the header and footer sections
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
// ApiService handles HTTP requests to the backend API
import { ApiService } from '../api.service';

// ========================================================
// Firebase Imports (Ensure these packages are installed)
// ========================================================

// Import Firebase authentication methods for verifying user credentials
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// Import your Firebase configuration from a custom config file. Make sure the file exists and is properly set up.
import { app } from '../firebase.config';

// ========================================================
// FontAwesome Icon Imports
// ========================================================

// Import the arrow left icon from FontAwesome for use in the Back Home button
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// ========================================================
// Component Declaration
// ========================================================

@Component({
  selector: 'app-account-settings-page',
  // Standalone component – no module file required.
  standalone: true,
  // List of modules and components used within this component’s template.
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    HeaderComponent,
    FooterComponent
  ],
  // External HTML template for the component's view.
  templateUrl: './account-settings-page.component.html',
  // External CSS file for styling the component.
  styleUrls: ['./account-settings-page.component.css']
})
export class AccountSettingsPageComponent implements OnInit {
  // ========================================================
  // Component Properties (Data Bindings for the Template)
  // ========================================================

  // User data fields to be updated via the settings form.
  firstName: string = '';
  surname: string = '';
  telephone: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  // Message field to display feedback (e.g., errors or success messages) to the user.
  message: string = '';

  // FontAwesome icon property for the Back Home button.
  faArrowLeft = faArrowLeft;

  // ========================================================
  // Constructor: Injects required services
  // ========================================================

  constructor(private apiService: ApiService, private router: Router) {}

  // ========================================================
  // ngOnInit: Lifecycle hook that runs after component initialization
  // ========================================================
  ngOnInit(): void {
    // Retrieve user data from localStorage to pre-fill the form fields.
    this.firstName = localStorage.getItem('firstName') || '';
    this.surname = localStorage.getItem('surname') || '';
    this.telephone = localStorage.getItem('telephone') || '';
  }

  // ========================================================
  // updateSettings: Validates form input and triggers an update
  // ========================================================
  updateSettings(): void {
    // Reset any previous messages.
    this.message = '';

    // Validate that both first name and surname are provided.
    if (!this.firstName || !this.surname) {
      this.message = 'First name and surname are required.';
      return;
    }

    // If the user is trying to update their password, perform additional validations.
    if (this.newPassword || this.confirmPassword) {
      // Ensure that the current password is provided.
      if (!this.oldPassword) {
        this.message = 'Current password is required to change password.';
        return;
      }
      // Check if the new password matches the confirmation.
      if (this.newPassword !== this.confirmPassword) {
        this.message = 'New passwords do not match.';
        return;
      }
      // Retrieve the email from localStorage; it's required for Firebase authentication.
      const email = localStorage.getItem('email');
      if (!email) {
        this.message = 'User email not found.';
        return;
      }

      // Use Firebase Auth to verify the current password.
      const auth = getAuth(app);
      signInWithEmailAndPassword(auth, email, this.oldPassword)
        .then(() => {
          // If verification succeeds, proceed with updating the settings.
          this.proceedUpdate();
        })
        .catch((error: any) => {
          // Log the error and display an error message.
          console.error(error);
          this.message = 'Current password is incorrect.';
        });
    } else {
      // If no password change is attempted, proceed directly with updating the settings.
      this.proceedUpdate();
    }
  }

  // ========================================================
  // proceedUpdate: Sends updated user data to the backend
  // ========================================================
  proceedUpdate(): void {
    // Build the payload with updated user information.
    const payload: any = {
      userId: localStorage.getItem('uid') || '',
      firstName: this.firstName,
      surname: this.surname
    };
    // Include telephone number if provided.
    if (this.telephone) {
      payload.telephone = this.telephone;
    }
    // Include new password if the user is updating their password.
    if (this.newPassword) {
      payload.newPassword = this.newPassword;
    }
    // Use the ApiService to send the update request to the backend.
    this.apiService.updateUser(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        this.message = 'Settings updated successfully.';
        // Update localStorage with the new values.
        localStorage.setItem('firstName', this.firstName);
        localStorage.setItem('surname', this.surname);
        localStorage.setItem('telephone', this.telephone);
      },
      error: (err: any) => {
        console.error(err);
        this.message = 'Error updating settings.';
      }
    });
  }

  // ========================================================
  // goHome: Navigates the user back to the home page
  // ========================================================
  goHome(): void {
    this.router.navigate(['/home-page']);
  }

  // ========================================================
  // onPasswordMouseDown: Temporarily displays password text on mousedown
  // ========================================================
  onPasswordMouseDown(event: MouseEvent, input: HTMLInputElement): void {
    // Check if the left mouse button is pressed.
    if (event.button === 0) {
      // Change the input type to text to show the password.
      input.type = 'text';
      event.preventDefault();
    }
  }

  // ========================================================
  // onPasswordMouseUp: Reverts password input type back to 'password'
  // ========================================================
  onPasswordMouseUp(event: MouseEvent, input: HTMLInputElement): void {
    // Check if the left mouse button is involved.
    if (event.button === 0) {
      // Change the input type back to 'password' to hide the password.
      input.type = 'password';
      event.preventDefault();
    }
  }
}
