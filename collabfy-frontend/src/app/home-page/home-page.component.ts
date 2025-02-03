// home-page.component.ts
// This component displays a single “card” (option) at a time with left/right arrow navigation.
// When navigating, the current card animates (scaling down briefly) before the next card is shown.

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
  // Array of options to display (each option is a “card”)
  options = [
    'Create a New Project',
    'My Projects',
    'Project Deadlines',
    'Notifications'
  ];

  // The index of the currently visible option
  currentIndex: number = 0;

  // Flag to trigger the scale (animation) effect
  isAnimating: boolean = false;

  // Navigate to the next option with an animation effect
  next() {
    // Start the animation: set flag to true (which will scale down the card)
    this.isAnimating = true;
    setTimeout(() => {
      // After 500ms (duration of the CSS transition), update the index
      this.currentIndex = (this.currentIndex + 1) % this.options.length;
      // Reset the animation flag so the card returns to normal scale
      this.isAnimating = false;
    }, 500);
  }

  // Navigate to the previous option with an animation effect
  previous() {
    // Start the animation: set flag to true
    this.isAnimating = true;
    setTimeout(() => {
      // Update the index (wrap around if at the beginning)
      this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
      // Reset the animation flag to restore normal scale
      this.isAnimating = false;
    }, 500);
  }
}
