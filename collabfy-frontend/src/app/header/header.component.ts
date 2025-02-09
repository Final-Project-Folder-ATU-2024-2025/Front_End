// src/app/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

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

  // Track the current underline animation state for the button.
  createProjectUnderlineState: 'none' | 'grow' | 'shrink' = 'none';

  // Property to hold the current route (URL) so that we can toggle button text/behavior.
  currentRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Retrieve the user's first name and surname from localStorage.
    this.userName = localStorage.getItem('firstName') || '';
    this.userSurname = localStorage.getItem('surname') || '';

    // Initialize the current route and subscribe to navigation events.
    this.currentRoute = this.router.url;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  // When the button is clicked, navigate based on the current route.
  // If on the create project page, navigate to home; otherwise, navigate to create project.
  onCreateProjectButtonClick(): void {
    if (this.currentRoute === '/create-project-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/create-project-page']);
    }
  }

  // When the mouse enters the button, trigger the underline-grow animation.
  onMouseEnterCreateProject(): void {
    this.createProjectUnderlineState = 'grow';
  }

  // When the mouse leaves the button, trigger the underline-shrink animation.
  // After the animation completes, reset the state to 'none'.
  onMouseLeaveCreateProject(): void {
    this.createProjectUnderlineState = 'shrink';
    setTimeout(() => {
      this.createProjectUnderlineState = 'none';
    }, 200); // Duration matches the animation duration (200ms)
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
