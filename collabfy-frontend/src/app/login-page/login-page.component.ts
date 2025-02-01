// login-page.component.ts
// This component implements the Login page where a user can enter their email and password.
// It uses a reactive form for validation, shows the header and footer for consistency,
// and navigates to the Home page upon a successful login.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  // Import necessary modules and shared components.
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderComponent, FooterComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  // Define a reactive form for login.
  form: FormGroup;

  constructor(
    private fb: FormBuilder,    // For building the reactive form.
    private http: HttpClient,   // For making HTTP requests.
    private router: Router      // For navigating after login.
  ) {
    // Initialize the form with two controls: email and password.
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],         // Email field with validation.
      password: ['', [Validators.required, Validators.minLength(6)]]    // Password field with validation.
    });
  }

  // onSubmit() is called when the form is submitted.
  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      
      // In a real application, you would call your backend's login endpoint.
      // Replace the URL with your actual authentication endpoint.
      this.http.post('http://127.0.0.1:5000/api/login', { email, password })
        .subscribe({
          next: () => {
            // On a successful login, show an alert and navigate to the Home page.
            alert('Logged in successfully!');
            this.router.navigate(['/']);  // Redirect to the Home page.
          },
          error: (error) => {
            // If an error occurs, display an error message.
            alert('Error logging in: ' + (error.error?.message || error.message));
          }
        });
    }
  }
}
