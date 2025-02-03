// src/app/header/header.component.ts
// This header component is used on authenticated pages.
// It displays the logo on the left and a "Log Out" button on the right.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  // (For this header, we no longer need to conditionally show login/create account links.)
  // We always want the Log Out button to appear on authenticated pages.
  isAuthenticated = true; // We assume that on authenticated pages, the user is logged in.

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Optionally, you could check the auth status here.
    // For now, we assume this header is only used on pages where the user is logged in.
  }

  // logout() handles logging the user out.
  logout(): void {
    // Remove the token (or perform other logout operations)
    localStorage.removeItem('token');
    // Navigate to the login page.
    this.router.navigate(['/login']);
  }
}
