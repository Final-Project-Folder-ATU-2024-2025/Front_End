import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Needed for ngModel and ngForm
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // For fa-icon
import { Router } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { ApiService } from '../api.service';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-account-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './account-settings-page.component.html',
  styleUrls: ['./account-settings-page.component.css']
})
export class AccountSettingsPageComponent implements OnInit {
  // Fields for user's current data
  firstName: string = '';
  surname: string = '';
  telephone: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';

  // Arrow icon for the Back Home button
  faArrowLeft = faArrowLeft;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Pre-fill form fields with the current user data from localStorage.
    // (Alternatively, you can fetch these values from an API.)
    this.firstName = localStorage.getItem('firstName') || '';
    this.surname = localStorage.getItem('surname') || '';
    this.telephone = localStorage.getItem('telephone') || '';
  }

  updateSettings(): void {
    this.message = '';

    // Validate that first name and surname are provided.
    if (!this.firstName || !this.surname) {
      this.message = 'First name and surname are required.';
      return;
    }

    // If the user is attempting to update the password, verify:
    // a) The current password is provided.
    // b) The new passwords match.
    if (this.newPassword || this.confirmPassword) {
      if (!this.oldPassword) {
        this.message = 'Current password is required to change password.';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.message = 'New passwords do not match.';
        return;
      }
      // Verify the current password by calling the login endpoint.
      const email = localStorage.getItem('email'); // Assumes email is stored in localStorage.
      if (!email) {
        this.message = 'User email not found.';
        return;
      }
      this.apiService.login({ email, password: this.oldPassword }).subscribe({
        next: (res: any) => {
          // If login is successful, proceed to update settings.
          this.proceedUpdate();
        },
        error: (err: any) => {
          console.error(err);
          this.message = 'Current password is incorrect.';
        }
      });
    } else {
      // No password change; proceed directly.
      this.proceedUpdate();
    }
  }

  proceedUpdate(): void {
    // Build payload with all provided fields.
    const payload: any = {
      userId: localStorage.getItem('uid') || '',
      firstName: this.firstName,
      surname: this.surname
    };
    if (this.telephone) {
      payload.telephone = this.telephone;
    }
    if (this.newPassword) {
      payload.newPassword = this.newPassword;
    }
    this.apiService.updateUser(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        this.message = 'Settings updated successfully.';
        // Optionally update localStorage with new values.
        localStorage.setItem('firstName', this.firstName);
        localStorage.setItem('surname', this.surname);
        localStorage.setItem('telephone', this.telephone);
      },
      error: (err: any) => {
        console.error(err);
        this.message = 'Error updating settings.';
      }
    });
  }

  // Navigate back home when the Back Home button is clicked.
  goHome(): void {
    this.router.navigate(['/home-page']);
  }
}
