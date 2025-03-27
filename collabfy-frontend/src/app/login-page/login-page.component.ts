import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FooterComponent } from '../footer/footer.component';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase.config';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    HeaderPublicComponent,
    FooterComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  form: FormGroup;
  errorMessage: string = '';  // New property for error messages

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize the login form with email and password.
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    // Clear previous error message.
    this.errorMessage = '';
    
    // Check if password field is empty
    if (!this.form.get('password')?.value) {
      this.errorMessage = "Password must be entered";
      return;
    }
    
    if (this.form.valid) {
      const { email, password } = this.form.value;
      
      // Call the login endpoint.
      this.http.post('http://127.0.0.1:5000/api/login', { email, password })
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('token', response.token || 'dummy-token');
            localStorage.setItem('firstName', response.firstName || 'John');
            localStorage.setItem('surname', response.surname || 'Doe');
            localStorage.setItem('uid', response.uid || 'user1');
            // On success, navigate without showing a pop-up
            this.router.navigate(['/home-page']);
          },
          error: (error) => {
            // Instead of an alert, set errorMessage to show on the page.
            this.errorMessage = "Password incorrect";
          }
        });
    }
  }

  onPasswordMouseDown(event: MouseEvent, input: HTMLInputElement): void {
    // Show password when left-click (button 0) is pressed
    if (event.button === 0) {
      input.type = 'text';
      event.preventDefault();
    }
  }

  onPasswordMouseUp(event: MouseEvent, input: HTMLInputElement): void {
    // Hide password when left-click is released or mouse leaves the icon
    if (event.button === 0) {
      input.type = 'password';
      event.preventDefault();
    }
  }

  // NEW: Reset password function using Firebase client SDK.
  resetPassword(): void {
    const auth = getAuth(app);
    const email = prompt("Please enter your registered email address:");
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Check your email to reset your password.");
        })
        .catch((error) => {
          if (error.code === 'auth/user-not-found') {
            alert("Email address not registered.");
          } else {
            alert("Error: " + error.message);
          }
        });
    }
  }
}
