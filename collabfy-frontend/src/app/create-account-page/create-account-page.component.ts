import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { HeaderPublicComponent } from '../header-public/header-public.component';

@Component({
  selector: 'app-create-account-page',
  standalone: true,           
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderPublicComponent, FooterComponent],
  templateUrl: './create-account-page.component.html',
  styleUrls: ['./create-account-page.component.css']
})
export class CreateAccountPageComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{6,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{10,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]],
    });
    
    console.log('CreateAccountPageComponent initialized');
  }

  onSubmit() {
    console.log('onSubmit called');
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.value);
      // Check for password errors and show a specific alert if needed:
    const passwordControl = this.form.get('password');
    if (passwordControl && passwordControl.errors) {
      if (passwordControl.errors['pattern']) {
        alert('Password must be at least 10 characters long, include one capital letter, one number, and one special character.');
      } else {
        alert('Please fill in all required fields correctly.');
      }
    } else {
      alert('Please fill in all required fields correctly.');
    }
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
