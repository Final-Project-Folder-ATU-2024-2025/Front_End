// =======================================================================
// Import necessary Angular modules and FontAwesome icons.
// -----------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';   // Used for navigation and tracking current route
import { CommonModule } from '@angular/common';              // Common directives
import { faUser, faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'; // FontAwesome icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';  // FontAwesome Angular module

// =======================================================================
// HeaderComponent:
// This component displays the application header including logo, 
// navigation buttons, and user authentication info with a dropdown for account settings.
// =======================================================================
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // User details from localStorage
  userName: string = '';
  userSurname: string = '';
  
  // Track the current route to apply active styles on navigation buttons
  currentRoute: string = '';
  
  // Flag to control the display of the account settings dropdown
  showAccountDropdown: boolean = false;

  // FontAwesome icons for display in the template
  faUser = faUser;
  faGear = faGear;
  faRightFromBracket = faRightFromBracket;

  // Inject the Router to navigate and subscribe to route changes
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Get user name and surname from localStorage
    this.userName = localStorage.getItem('firstName') || '';
    this.userSurname = localStorage.getItem('surname') || '';

    // Initialize currentRoute with the current URL
    this.currentRoute = this.router.url;

    // Subscribe to router events to update currentRoute on navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  // Navigate to Create Project or Home based on current route
  onCreateProjectButtonClick(): void {
    if (this.currentRoute === '/create-project-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/create-project-page']);
    }
  }

  // Navigate to My Projects or Home based on current route
  onMyProjectsButtonClick(): void {
    if (this.currentRoute === '/my-projects-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/my-projects-page']);
    }
  }

  // Navigate to Kanban Board or Home based on current route
  onKanbanBoardButtonClick(): void {
    if (this.currentRoute === '/kanban-board-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/kanban-board-page']);
    }
  }

  // Logout the user by removing tokens and navigating to the root page
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('surname');
    this.router.navigate(['/']);
  }

  // Toggle the visibility of the account settings dropdown
  toggleAccountDropdown(): void {
    this.showAccountDropdown = !this.showAccountDropdown;
  }

  // Navigate to the Account Settings page; prevent default link behavior
  goToAccountSettings(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/account-settings']);
    this.showAccountDropdown = false;
  }
}
