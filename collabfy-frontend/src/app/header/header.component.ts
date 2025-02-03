// header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',  // Using external HTML template
  styleUrls: ['./header.component.css'],     // Using external CSS styles
})
export class HeaderComponent {}
