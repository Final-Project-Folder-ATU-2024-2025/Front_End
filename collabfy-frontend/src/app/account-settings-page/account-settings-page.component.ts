import { Component } from '@angular/core';
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
export class AccountSettingsPageComponent {
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  telephone: string = '';
  message: string = '';

  // Arrow icon for the Back Home button
  faArrowLeft = faArrowLeft;

  constructor(private apiService: ApiService, private router: Router) {}

  updateSettings(): void {
    this.message = '';

    // Validate new passwords match
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'New passwords do not match.';
      return;
    }

    // Build payload with only fields that have been provided.
    const payload: { userId: string, telephone?: string, newPassword?: string } = {
      userId: localStorage.getItem('uid') || ''
    };

    if (this.telephone) {
      payload.telephone = this.telephone;
    }

    if (this.newPassword) {
      payload.newPassword = this.newPassword;
    }

    this.apiService.updateUser(payload).subscribe({
      next: res => {
        console.log(res);
        this.message = 'Settings updated successfully.';
      },
      error: err => {
        console.error(err);
        this.message = 'Error updating settings.';
      }
    });
  }

  // Navigate back home when the Back Home button is clicked.
  goHome(): void {
    this.router.navigate(['/home-page']); // Change this route if necessary.
  }
}
