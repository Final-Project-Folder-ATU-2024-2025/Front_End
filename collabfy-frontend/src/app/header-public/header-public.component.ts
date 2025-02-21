import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-header-public',
    imports: [CommonModule, RouterLink],
    templateUrl: './header-public.component.html',
    styleUrls: ['./header-public.component.css']
})
export class HeaderPublicComponent implements OnInit {
  currentUrl: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set the current URL initially
    this.currentUrl = this.router.url;
    // Subscribe to router events to update currentUrl on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
  }
}
