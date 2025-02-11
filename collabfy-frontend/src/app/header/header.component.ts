import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = true;
  userName: string = '';
  userSurname: string = '';
  
  // Underline animation states for both buttons
  createProjectUnderlineState: 'none' | 'grow' | 'shrink' = 'none';
  myProjectsUnderlineState: 'none' | 'grow' | 'shrink' = 'none';

  // Holds the current route URL
  currentRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('firstName') || '';
    this.userSurname = localStorage.getItem('surname') || '';

    this.currentRoute = this.router.url;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  // Create Project button click handler – unchanged
  onCreateProjectButtonClick(): void {
    if (this.currentRoute === '/create-project-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/create-project-page']);
    }
  }

  onMouseEnterCreateProject(): void {
    this.createProjectUnderlineState = 'grow';
  }

  onMouseLeaveCreateProject(): void {
    this.createProjectUnderlineState = 'shrink';
    setTimeout(() => {
      this.createProjectUnderlineState = 'none';
    }, 200);
  }

  // New My Projects button click handler
  onMyProjectsButtonClick(): void {
    if (this.currentRoute === '/my-projects-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/my-projects-page']);
    }
  }

  onMouseEnterMyProjects(): void {
    this.myProjectsUnderlineState = 'grow';
  }

  onMouseLeaveMyProjects(): void {
    this.myProjectsUnderlineState = 'shrink';
    setTimeout(() => {
      this.myProjectsUnderlineState = 'none';
    }, 200);
  }

  // Log out function remains unchanged
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('surname');
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }
}
