import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, HeaderPublicComponent, FooterComponent, FontAwesomeModule],
  templateUrl: './create-account-page.component.html',
  styleUrls: ['./create-account-page.component.css']
})
export class CreateAccountPageComponent {
  form: FormGroup;
  // New property to control display of our custom modal
  showAccountCreatedModal: boolean = false;
  // FontAwesome icon for the modal
  faCheck = faCheck;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      telephone: ['', [Validators.pattern(/^(?:[0-9\+\-\(\) ]{6,15})?$/)]],
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
        // Instead of an alert, show our custom modal
        this.showAccountCreatedModal = true;
      },
      error: (error) => {
        console.error('Error creating account:', error);
        alert('Error creating account: ' + (error.error?.message || error.message));
      },
    });
  }

  // Press-and-hold functionality to temporarily show password text.
  onPasswordMouseDown(event: MouseEvent, input: HTMLInputElement): void {
    if (event.button === 0) {
      input.type = 'text';
      event.preventDefault();
    }
  }

  onPasswordMouseUp(event: MouseEvent, input: HTMLInputElement): void {
    if (event.button === 0) {
      input.type = 'password';
      event.preventDefault();
    }
  }

  // When the user clicks the check icon in the modal, close the modal, reset the form, and navigate to login.
  confirmAccountCreated(): void {
    this.showAccountCreatedModal = false;
    this.form.reset();
    this.router.navigate(['/login']);
  }
}
