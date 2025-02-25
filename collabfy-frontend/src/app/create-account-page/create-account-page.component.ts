import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { HeaderPublicComponent } from '../header-public/header-public.component';

@Component({
    selector: 'app-create-account-page',
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderPublicComponent, FooterComponent],
    templateUrl: './create-account-page.component.html',
    styleUrls: ['./create-account-page.component.css']
})
export class CreateAccountPageComponent {
  form: FormGroup;

  // Inject FormBuilder, HttpClient, and Router
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize the reactive form with validation rules.
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

  // Called when the form is submitted.
  onSubmit() {
    console.log('onSubmit called');

    // Check if the form is valid.
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.value);
      return;
    }

    // Destructure the form values.
    const { firstName, surname, telephone, email, password, confirmPassword } = this.form.value;
    console.log('Form values:', this.form.value);

    // Ensure password and confirmPassword match.
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Sending POST request to create user at http://127.0.0.1:5000/api/create-user');
    // Call the backend endpoint to create the user.
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
        // Redirect to the Login page after successful account creation.
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error creating account:', error);
        alert('Error creating account: ' + (error.error?.message || error.message));
      },
    });
  }
}
