import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `<header><h1>Collabfy</h1></header>`,
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {}
