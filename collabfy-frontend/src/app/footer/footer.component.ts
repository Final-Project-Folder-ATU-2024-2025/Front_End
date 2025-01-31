import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `<footer><p>&copy; 2024 Collabfy</p></footer>`,
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {}
