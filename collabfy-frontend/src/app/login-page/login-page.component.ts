import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Needed for ngModel
import { Router } from '@angular/router';
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FooterComponent } from '../footer/footer.component';
import { getAuth, signInWithEmailAndPassword, getIdToken, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase.config';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderPublicComponent, FooterComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  form: FormGroup;
  errorMessage: string = '';
  // Properties for the forgot password flow
  showResetPasswordForm: boolean = false;
  resetPasswordMessage: string = '';
  resetEmail: string = '';

  // Update with your backend API URL if needed
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    // Clear previous error message.
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = "Please enter a valid email and password.";
      return;
    }

    const { email, password } = this.form.value;
    const auth = getAuth(app);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => getIdToken(userCredential.user))
      .then((idToken) => {
        // Store the token in localStorage.
        localStorage.setItem('idToken', idToken);
        // Now send the token to your backend login endpoint.
        return this.http.post(`${this.apiUrl}/login`, { idToken }).toPromise();
      })
      .then((response: any) => {
        // Save user info (firstName, surname, uid) to localStorage for the header.
        localStorage.setItem('firstName', response.firstName || '');
        localStorage.setItem('surname', response.surname || '');
        localStorage.setItem('uid', response.uid || '');
        // Navigate to the home page.
        this.router.navigate(['/home-page']);
      })
      .catch((error) => {
        console.error(error);
        this.errorMessage = error.message;
      });
  }

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

  toggleResetPasswordForm(): void {
    this.showResetPasswordForm = !this.showResetPasswordForm;
    this.resetPasswordMessage = '';
  }

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
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          this.resetPasswordMessage = "Email address not registered.";
        } else {
          this.resetPasswordMessage = "Error: " + error.message;
        }
      });
  }
}
