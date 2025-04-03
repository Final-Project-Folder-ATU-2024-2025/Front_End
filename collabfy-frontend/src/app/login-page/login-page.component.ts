// =======================================================================
// Import Angular modules and core functionalities.
// -----------------------------------------------------------------------
import { Component } from '@angular/core';                 // For component declaration
import { CommonModule } from '@angular/common';              // Common directives (ngIf, etc.)
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';  // Reactive forms
import { FormsModule } from '@angular/forms';                // For template-driven features (ngModel)
import { Router } from '@angular/router';                    // Routing for navigation
import { HttpClient } from '@angular/common/http';           // HTTP client for API calls

// =======================================================================
// Import custom components.
// -----------------------------------------------------------------------
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FooterComponent } from '../footer/footer.component';

// =======================================================================
// Import Firebase modules for authentication functionality.
// -----------------------------------------------------------------------
import { getAuth, signInWithEmailAndPassword, getIdToken, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase.config';  // Firebase configuration (ensure this file exists)

// =======================================================================
// LoginPageComponent:
// This component manages the login form, including authentication via Firebase,
// handling error messages, and the forgot password functionality.
// =======================================================================
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderPublicComponent, FooterComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  // Reactive form for login fields (email and password)
  form: FormGroup;
  // String for displaying error messages if login fails
  errorMessage: string = '';
  
  // Properties to control the forgot password flow
  showResetPasswordForm: boolean = false;
  resetPasswordMessage: string = '';
  resetEmail: string = '';

  // API URL for backend calls (if needed)
  private apiUrl = 'http://127.0.0.1:5000/api';

  // -----------------------------------------------------------------------
  // Constructor: Initializes the reactive form and injects necessary services.
  // -----------------------------------------------------------------------
  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    // Define form controls with validators
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // -----------------------------------------------------------------------
  // onSubmit: Called when the login form is submitted.
  // Validates the form and then attempts to sign in via Firebase.
  // -----------------------------------------------------------------------
  onSubmit(): void {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.errorMessage = "Please enter a valid email and password.";
      return;
    }
    const { email, password } = this.form.value;
    const auth = getAuth(app);
    // Sign in with Firebase authentication
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => getIdToken(userCredential.user))  // Retrieve the ID token
      .then((idToken) => {
        // Store the ID token locally
        localStorage.setItem('idToken', idToken);
        // Call backend login endpoint with the token to retrieve additional user details
        return this.http.post(`${this.apiUrl}/login`, { idToken }).toPromise();
      })
      .then((response: any) => {
        // Store user details from response into localStorage
        localStorage.setItem('firstName', response.firstName || '');
        localStorage.setItem('surname', response.surname || '');
        localStorage.setItem('uid', response.uid || '');
        localStorage.setItem('email', response.email || '');
        // Navigate to the home page after successful login
        this.router.navigate(['/home-page']);
      })
      .catch((error: any) => {
        console.error(error);
        // If Firebase returns an invalid credential error, show a specific message
        if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
          this.errorMessage = "Password incorrect";
        } else {
          this.errorMessage = error.message;
        }
      });
  }

  // -----------------------------------------------------------------------
  // onPasswordMouseDown: Temporarily changes input type to text to show password.
  // -----------------------------------------------------------------------
  onPasswordMouseDown(event: MouseEvent, input: HTMLInputElement): void {
    if (event.button === 0) {
      input.type = 'text';
      event.preventDefault();
    }
  }

  // -----------------------------------------------------------------------
  // onPasswordMouseUp: Reverts input type back to password to hide it.
  // -----------------------------------------------------------------------
  onPasswordMouseUp(event: MouseEvent, input: HTMLInputElement): void {
    if (event.button === 0) {
      input.type = 'password';
      event.preventDefault();
    }
  }

  // -----------------------------------------------------------------------
  // toggleResetPasswordForm: Shows or hides the forgot password form.
  // -----------------------------------------------------------------------
  toggleResetPasswordForm(): void {
    this.showResetPasswordForm = !this.showResetPasswordForm;
    this.resetPasswordMessage = '';
  }

  // -----------------------------------------------------------------------
  // resetPassword: Sends a password reset email using Firebase authentication.
  // -----------------------------------------------------------------------
  resetPassword(): void {
    const auth = getAuth(app);
    if (!this.resetEmail) {
      this.resetPasswordMessage = "Please enter your registered email address.";
      return;
    }
    sendPasswordResetEmail(auth, this.resetEmail)
      .then(() => {
        this.resetPasswordMessage = "Check your email to reset your password.";
      })
      .catch((error: any) => {
        if (error.code === 'auth/user-not-found') {
          this.resetPasswordMessage = "Email address not registered.";
        } else {
          this.resetPasswordMessage = "Error: " + error.message;
        }
      });
  }
}
