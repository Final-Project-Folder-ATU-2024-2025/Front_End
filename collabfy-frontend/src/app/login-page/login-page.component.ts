import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FooterComponent } from '../footer/footer.component';

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
    if (this.form.valid) {
      const { email, password } = this.form.value;
      
      // Call the login endpoint.
      this.http.post('http://127.0.0.1:5000/api/login', { email, password })
        .subscribe({
          next: (response: any) => {
            // Store token, firstName, surname, and uid in localStorage.
            localStorage.setItem('token', response.token || 'dummy-token');
            localStorage.setItem('firstName', response.firstName || 'John');
            localStorage.setItem('surname', response.surname || 'Doe');
            localStorage.setItem('uid', response.uid || 'user1');
            alert('Logged in successfully!');
            this.router.navigate(['/home-page']);
          },
          error: (error) => {
            alert('Error logging in: ' + (error.error?.message || error.message));
          }
        });
    }
  }

  onPasswordMouseDown(event: MouseEvent, input: HTMLInputElement): void {
    // Show password if left-click (button 0) is pressed
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
}
