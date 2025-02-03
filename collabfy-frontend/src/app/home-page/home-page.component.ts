// home-page.component.ts
// This component displays one option (card) at a time from an array of options.
// It provides left/right arrow navigation with an animated transition (translateX, translateY, and scale).
// Pagination dots (transparent balls) are displayed directly beneath the card.
// The card is sized to nearly fill the vertical space between the header and footer (with a 25px gap).

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  // Array of options to display as cards
  options = [
    'Create a New Project',
    'My Projects',
    'Project Deadlines',
    'Notifications',
    'Connections'
  ];

  // Index of the currently displayed option
  currentIndex: number = 0;

  // Flag to trigger the animation effect (scaling and vertical translation)
  isAnimating: boolean = false;

  // Indicates the navigation direction ('next' or 'prev') to set vertical translation accordingly
  direction: 'next' | 'prev' = 'next';

  // Navigate to the next option with an animation effect
  next() {
    this.direction = 'next'; // Set animation direction to "next"
    this.isAnimating = true; // Trigger the animation effect
    setTimeout(() => {
      // After 500ms (animation duration), update the current index
      this.currentIndex = (this.currentIndex + 1) % this.options.length;
      this.isAnimating = false; // Reset animation flag to restore normal scale/position
    }, 500);
  }

  // Navigate to the previous option with an animation effect
  previous() {
    this.direction = 'prev'; // Set animation direction to "prev"
    this.isAnimating = true; // Trigger the animation effect
    setTimeout(() => {
      // Update the index (wrap around if necessary)
      this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
      this.isAnimating = false; // Reset animation flag
    }, 500);
  }
}
