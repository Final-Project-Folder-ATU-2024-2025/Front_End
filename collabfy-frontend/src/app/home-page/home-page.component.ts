// src/app/home-page/home-page.component.ts
// This component displays one option (card) at a time from an array of options.
// It provides left/right arrow navigation with an animated transition.
// When the "Connections" option is active, it shows two inner squares:
//  - One for creating a new connection (search bar with results).
//  - One that displays the number of persons in your connections list.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  // Options for the slider
  options = [
    'Create a New Project',
    'My Projects',
    'Project Deadlines',
    'Notifications',
    'Connections'
  ];

  // Slider state
  currentIndex: number = 0;
  isAnimating: boolean = false;
  direction: 'next' | 'prev' = 'next';

  // Connections-specific properties
  connectionsCount: number = 3; // Dummy value; replace with actual count as needed
  searchQuery: string = '';
  searchResults: any[] = [];

  constructor(private http: HttpClient) {}

  // Called when the "Search" button is pressed in the Connections slide.
  searchConnections(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    // Call the backend endpoint to search for users.
    this.http.post('http://127.0.0.1:5000/api/search-users', { query: this.searchQuery })
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.results || [];
          console.log('Search results:', this.searchResults);
        },
        error: (error) => {
          console.error('Error searching connections:', error);
        }
      });
  }

  // Navigation methods (unchanged)
  next() {
    this.direction = 'next';
    this.isAnimating = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.options.length;
      this.isAnimating = false;
    }, 500);
  }

  previous() {
    this.direction = 'prev';
    this.isAnimating = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
      this.isAnimating = false;
    }, 500);
  }
}
