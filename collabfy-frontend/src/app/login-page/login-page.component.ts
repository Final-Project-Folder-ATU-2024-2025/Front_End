// src/app/login-page/login-page.component.ts
// This component handles user login.
// It uses a reactive form for login validation and calls the backend's login endpoint.
// The public header is used here so that only the logo is displayed on the login page.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
// Import the public header component for use on this page.
import { HeaderPublicComponent } from '../header-public/header-public.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderPublicComponent, FooterComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  form: FormGroup;

  // Inject FormBuilder, HttpClient, and Router for form handling and navigation.
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize the login form with email and password fields.
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Called when the login form is submitted.
  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      
      // Call the backend's login endpoint.
      this.http.post('http://127.0.0.1:5000/api/login', { email, password })
        .subscribe({
          next: () => {
            // On successful login, display a message and navigate to the Home page.
            alert('Logged in successfully!');
            this.router.navigate(['/']);
          },
          error: (error) => {
            // Display an error message if login fails.
            alert('Error logging in: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  // Navigates to the Create Account page when the button is clicked.
  goToCreateAccount() {
    this.router.navigate(['/create-account']);
  }
}
