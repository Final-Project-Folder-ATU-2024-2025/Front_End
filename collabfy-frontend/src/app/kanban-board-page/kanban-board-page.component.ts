import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
    selector: 'app-kanban-board-page',
    imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
    templateUrl: './kanban-board-page.component.html',
    styleUrls: ['./kanban-board-page.component.css']
})
export class KanbanBoardPageComponent implements OnInit {
  projects: any[] = [];
  tasks: any[] = [];
  milestones: string[] = [];
  newMilestone: string = '';
  selectedProjectId: string = '';
  selectedTaskId: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.apiService.getMyProjects(uid).subscribe({
        next: (response: any) => {
          if (response.projects) {
            this.projects = response.projects;
          } else {
            console.error("No projects found in response:", response);
          }
        },
        error: (error: any) => {
          console.error("Error retrieving projects", error);
        }
      });
    } else {
      console.error("No UID found in localStorage.");
    }
  }

  onProjectChange(event: any): void {
    this.selectedProjectId = event.target.value;
    console.log("Selected project:", this.selectedProjectId);
    // Find the selected project in the projects array and set its tasks
    const project = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (project && project.tasks) {
      this.tasks = project.tasks;
    } else {
      this.tasks = [];
    }
    // Reset task and milestones when project changes
    this.selectedTaskId = '';
    this.milestones = [];
    this.newMilestone = '';
  }

  onTaskChange(event: any): void {
    this.selectedTaskId = event.target.value;
    console.log("Selected task:", this.selectedTaskId);
    const project = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (project && project.tasks) {
      // Explicitly type 't' as any to avoid implicit any error.
      const task = project.tasks.find((t: any) => t.taskName === this.selectedTaskId);
      if (task && task.milestones) {
        this.milestones = task.milestones;
      } else {
        this.milestones = [];
      }
    } else {
      this.milestones = [];
    }
  }

  addMilestone(): void {
    if (this.newMilestone.trim() === '') {
      return;
    }
    // Add the new milestone to the local array
    this.milestones.push(this.newMilestone.trim());
    console.log("Milestone added:", this.newMilestone);
    this.newMilestone = '';

    // Optionally, update the selected project's task milestones (in local projects array)
    const projectIndex = this.projects.findIndex(p => p.projectId === this.selectedProjectId);
    if (projectIndex > -1) {
      const project = this.projects[projectIndex];
      const taskIndex = project.tasks.findIndex((t: any) => t.taskName === this.selectedTaskId);
      if (taskIndex > -1) {
        // Ensure the milestones array exists for the task
        if (!project.tasks[taskIndex].milestones) {
          project.tasks[taskIndex].milestones = [];
        }
        project.tasks[taskIndex].milestones = this.milestones;
      }
    }
  }
}
