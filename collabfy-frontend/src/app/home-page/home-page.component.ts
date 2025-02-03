// home-page.component.ts
// This component displays one option at a time from a list of options (e.g., Create a New Project, My Projects, etc.).
// Users can navigate between options using left and right arrow buttons.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  // Import shared components and CommonModule for structural directives
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  // List of options to be shown in the slider
  options: string[] = [
    'Create a New Project',
    'My Projects',
    'Project Deadlines',
    'Notifications'
  ];

  // Tracks the currently displayed option's index
  currentIndex: number = 0;

  // Method to navigate to the previous option in the list.
  // If at the beginning, it loops to the last option.
  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.options.length - 1;
    }
  }

  // Method to navigate to the next option in the list.
  // If at the end, it loops back to the first option.
  next(): void {
    if (this.currentIndex < this.options.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }
}
