import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component'; 
import { FooterComponent } from '../footer/footer.component';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-account',
  standalone: true, 
  imports: [
    CommonModule,
    HeaderComponent,  
    FooterComponent,  
    ReactiveFormsModule, 
    HttpClientModule  
  ],
  templateUrl: './create-account-page.component.html',
  styleUrls: ['./create-account-page.component.css'], // Styling remains unchanged
})
export class CreateAccountPageComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { firstName, surname, telephone, email, password, confirmPassword } = this.form.value;

      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      this.http.post('http://127.0.0.1:5000/api/create-user', {
        firstName,
        surname,
        telephone,
        email,
        password
      }).subscribe({
        next: (response: any) => {
          alert('Account created successfully!');
          this.form.reset();
        },
        error: (error) => {
          alert('Error creating account: ' + (error.error?.message || error.message));
        },
      });
    }
  }
}
