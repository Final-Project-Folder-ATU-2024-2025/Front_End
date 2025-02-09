// src/app/header/header.component.ts
// This header component is used on authenticated pages.
// It displays the logo on the left, a "Log Out" button on the right,
// and below the button, it displays an emoji icon along with the user's first name and surname.
// A new "Create project" button has been added which navigates to the Create Project page.
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
  isAuthenticated = true;
  userName: string = '';
  userSurname: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Retrieve the user's first name and surname from localStorage.
    // If nothing is stored, these remain empty.
    this.userName = localStorage.getItem('firstName') || '';
    this.userSurname = localStorage.getItem('surname') || '';
  }

  // Navigates to the Create Project page.
  goToCreateProject(): void {
    this.router.navigate(['/create-project-page']);
  }

  // Handles logging out the user.
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('surname');
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }
}
