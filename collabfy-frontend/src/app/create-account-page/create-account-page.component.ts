// ========================================================
// Angular and External Module Imports
// ========================================================

// Core Angular modules for building the component
import { Component } from '@angular/core'; // Provides the Component decorator and other core functionality
import { CommonModule } from '@angular/common'; // Common directives (e.g., *ngIf, *ngFor)
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'; // For building reactive forms and form validation
import { HttpClientModule, HttpClient } from '@angular/common/http'; // For making HTTP requests

// ========================================================
// Custom Component and Service Imports
// ========================================================

// Import custom components for header and footer; these are reusable UI components.
import { FooterComponent } from '../footer/footer.component';
import { HeaderPublicComponent } from '../header-public/header-public.component';
// Import the Angular Router for navigation between pages
import { Router } from '@angular/router';
// Import the ApiService which handles HTTP requests to the backend API
import { ApiService } from '../api.service';

// ========================================================
// FontAwesome Module and Icon Imports
// ========================================================

// Import FontAwesomeModule to use <fa-icon> in templates
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Import the specific FontAwesome icon used for confirmation in the modal
import { faCheck } from '@fortawesome/free-solid-svg-icons';

// ========================================================
// Component Declaration
// ========================================================

@Component({
  selector: 'app-create-account-page',
  // Standalone component declaration
  standalone: true,
  // Declare imported modules and components that this component uses in its template
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    HeaderPublicComponent,
    FooterComponent,
    FontAwesomeModule
  ],
  // Reference to the external HTML template
  templateUrl: './create-account-page.component.html',
  // Reference to the external CSS file for component styling
  styleUrls: ['./create-account-page.component.css']
})
export class CreateAccountPageComponent {
  // ========================================================
  // Component Properties
  // ========================================================

  // Reactive form group for the create account form
  form: FormGroup;
  // Flag to control whether the account created modal is shown
  showAccountCreatedModal: boolean = false;
  // FontAwesome icon for the modal confirmation icon
  faCheck = faCheck;
  // Flag for inline error message if password and confirm password do not match
  passwordMismatch: boolean = false;
  // Holds any other error messages for the form
  formError: string = '';

  // ========================================================
  // Constructor: Dependency Injection and Form Initialization
  // ========================================================
  constructor(
    private fb: FormBuilder,    // FormBuilder to construct the reactive form
    private http: HttpClient,   // HttpClient for making HTTP requests
    private router: Router      // Router for navigating between pages
  ) {
    // Initialize the reactive form with validators
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      telephone: ['', [Validators.pattern(/^(?:[0-9\+\-\(\) ]{6,15})?$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          // Password pattern: at least 10 characters, one capital letter, one number, one special character
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{10,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]],
    });
    
    console.log('CreateAccountPageComponent initialized');
  }

  // ========================================================
  // onSubmit: Called when the create account form is submitted.
  // It performs validation checks and, if valid, sends the data to the backend.
  // ========================================================
  onSubmit() {
    console.log('onSubmit called');
    // Clear previous inline errors.
    this.passwordMismatch = false;
    this.formError = '';

    // Check if the form is invalid.
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.value);
      const passwordControl = this.form.get('password');
      if (passwordControl && passwordControl.errors) {
        if (passwordControl.errors['pattern']) {
          this.formError = 'Password must be at least 10 characters long, include one capital letter, one number, and one special character.';
        } else {
          this.formError = 'Please fill in all required fields correctly.';
        }
      } else {
        this.formError = 'Please fill in all required fields correctly.';
      }
      return;
    }

    // Destructure form values for easy access.
    const { firstName, surname, telephone, email, password, confirmPassword } = this.form.value;
    console.log('Form values:', this.form.value);

    // Check if the password and confirm password fields match.
    if (password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    console.log('Sending POST request to create user at http://127.0.0.1:5000/api/create-user');
    // Send the POST request to the backend to create the user account.
    this.http.post('http://127.0.0.1:5000/api/create-user', {
      firstName,
      surname,
      telephone,
      email,
      password
    }).subscribe({
      next: (response) => {
        console.log('Response from create-user:', response);
        // If account creation is successful, show the account created modal.
        this.showAccountCreatedModal = true;
      },
      error: (error) => {
        console.error('Error creating account:', error);
        // Display the error message from the backend.
        this.formError = 'Error creating account: ' + (error.error?.message || error.message);
      },
    });
  }

  // ========================================================
  // onPasswordMouseDown / onPasswordMouseUp: 
  // These methods implement the press-and-hold functionality to temporarily show the password.
  // ========================================================
  onPasswordMouseDown(event: MouseEvent, input: HTMLInputElement): void {
    if (event.button === 0) {
      // Change input type to text so the password is visible
      input.type = 'text';
      event.preventDefault();
    }
  }

  onPasswordMouseUp(event: MouseEvent, input: HTMLInputElement): void {
    if (event.button === 0) {
      // Change input type back to password to hide it
      input.type = 'password';
      event.preventDefault();
    }
  }

  // ========================================================
  // confirmAccountCreated: 
  // Called when the user clicks the confirmation icon in the modal.
  // It closes the modal, resets the form, and navigates to the login page.
  // ========================================================
  confirmAccountCreated(): void {
    // Hide the account created modal.
    this.showAccountCreatedModal = false;
    // Reset the form fields.
    this.form.reset();
    // Navigate to the login page.
    this.router.navigate(['/login']);
  }
}
