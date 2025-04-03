// =======================================================================
// Import necessary Angular modules
// =======================================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// =======================================================================
// FooterComponent:
// This component displays the footer content including copyright
// information and a link to the GitHub profile.
// =======================================================================
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {}
