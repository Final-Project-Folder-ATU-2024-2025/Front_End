import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngFor and other directives
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-my-projects-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],  // Added CommonModule here
  templateUrl: './my-projects-page.component.html',
  styleUrls: ['./my-projects-page.component.css']
})
export class MyProjectsPageComponent {
  // Dummy projects array – replace with API data as needed
  projects = [
    { name: 'Project Alpha', description: 'Description for Project Alpha', deadline: '2025-01-01' },
    { name: 'Project Beta', description: 'Description for Project Beta', deadline: '2025-02-01' },
    { name: 'Project Gamma', description: 'Description for Project Gamma', deadline: '2025-03-01' }
  ];
}
