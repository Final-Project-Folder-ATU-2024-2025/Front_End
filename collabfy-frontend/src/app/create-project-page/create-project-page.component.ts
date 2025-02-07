// src/app/create-project-page/create-project-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-project-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './create-project-page.component.html',
  styleUrls: ['./create-project-page.component.css']
})
export class CreateProjectPageComponent {
  // Form fields
  projectName: string = '';
  description: string = '';
  deadline: string = ''; // Expected format: YYYY-MM-DD
  // Dynamic tasks: each task has a taskName and taskDescription
  tasks: { taskName: string; taskDescription: string }[] = [];

  constructor(private http: HttpClient, private router: Router) {
    // Start with one empty task by default.
    this.tasks.push({ taskName: '', taskDescription: '' });
  }

  // Add a new empty task row
  addTask(): void {
    this.tasks.push({ taskName: '', taskDescription: '' });
  }

  // Remove a task at a specified index
  removeTask(index: number): void {
    if (this.tasks.length > 1) {
      this.tasks.splice(index, 1);
    }
  }

  // Create the project by sending the form data to the backend endpoint
  createProject(): void {
    const ownerId = localStorage.getItem('uid') || 'user1'; // Replace with actual UID retrieval if needed

    const projectData = {
      projectName: this.projectName,
      description: this.description,
      deadline: this.deadline,
      tasks: this.tasks,
      ownerId: ownerId
    };

    this.http.post('http://127.0.0.1:5000/api/create-project', projectData)
      .subscribe({
        next: (response: any) => {
          alert('Project created successfully!');
          // Optionally redirect to home or project list page
          this.router.navigate(['/']);
        },
        error: (error) => {
          alert('Error creating project: ' + (error.error?.error || error.message));
        }
      });
  }
  goToHomePage() {
    console.log('Navigating back to Home Page');
    this.router.navigate(['/']);
  }
}
