// create-account-page.component.ts
// This component handles account creation. After successfully creating an account,
// it redirects the user to the Login page.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';  // Import Router for navigation

@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FooterComponent, HeaderComponent],
  templateUrl: './create-account-page.component.html',
  styleUrls: ['./create-account-page.component.css'],
})
export class CreateAccountPageComponent {
  form: FormGroup;

  // Inject FormBuilder, HttpClient, and Router in the constructor
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // If you want to allow 6-digit telephone numbers, change the regex to allow {6,15} digits.
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{6,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
    console.log('CreateAccountPageComponent initialized');
  }

  onSubmit() {
    console.log('onSubmit called');

    // If the form is invalid, log the error and exit
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.value);
      return;
    }

    const { firstName, surname, telephone, email, password, confirmPassword } = this.form.value;
    console.log('Form values:', this.form.value);

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Sending POST request to create user at http://127.0.0.1:5000/api/create-user');
    this.http.post('http://127.0.0.1:5000/api/create-user', {
      firstName,
      surname,
      telephone,
      email,
      password
    }).subscribe({
      next: (response) => {
        console.log('Response from create-user:', response);
        alert('Account created successfully!');
        this.form.reset();
        // Redirect to the Login page after account creation
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error creating account:', error);
        alert('Error creating account: ' + (error.error?.message || error.message));
      },
    });
  }

  // goToLogin() method to navigate back to the Login page when the "Back to Login" button is clicked.
  goToLogin() {
    console.log('Navigating back to Login page');
    this.router.navigate(['/login']);
  }
}
