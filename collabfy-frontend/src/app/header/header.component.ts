import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faUser, faGear } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  userSurname: string = '';
  currentRoute: string = '';
  showAccountDropdown: boolean = false;

  faUser = faUser;
  faGear = faGear;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('firstName') || '';
    this.userSurname = localStorage.getItem('surname') || '';
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  onCreateProjectButtonClick(): void {
    if (this.currentRoute === '/create-project-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/create-project-page']);
    }
  }

  onMyProjectsButtonClick(): void {
    if (this.currentRoute === '/my-projects-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/my-projects-page']);
    }
  }

  onKanbanBoardButtonClick(): void {
    if (this.currentRoute === '/kanban-board-page') {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/kanban-board-page']);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('surname');
    this.router.navigate(['/']);
  }

  toggleAccountDropdown(): void {
    this.showAccountDropdown = !this.showAccountDropdown;
  }

  goToAccountSettings(event: MouseEvent): void {
    // Prevent default link behavior and stop propagation so the dropdown doesn’t toggle again
    event.preventDefault();
    event.stopPropagation();
    // Navigate to the account settings page
    this.router.navigate(['/account-settings']);
    // Optionally, close the dropdown
    this.showAccountDropdown = false;
  }
}
