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
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './kanban-board-page.component.html',
  styleUrls: ['./kanban-board-page.component.css']
})
export class KanbanBoardPageComponent implements OnInit {
  projects: any[] = [];
  tasks: any[] = [];
  // Milestones is now an array of objects with "text" and "status"
  milestones: { text: string; status: string }[] = [];
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
    // Find the selected project in the projects array and set its tasks.
    const project = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (project && project.tasks) {
      this.tasks = project.tasks;
    } else {
      this.tasks = [];
    }
    // Reset task selection and milestones when project changes.
    this.selectedTaskId = '';
    this.milestones = [];
    this.newMilestone = '';
  }

  onTaskChange(event: any): void {
    this.selectedTaskId = event.target.value;
    console.log("Selected task:", this.selectedTaskId);
    const project = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (project && project.tasks) {
      const task = project.tasks.find((t: any) => t.taskName === this.selectedTaskId);
      if (task) {
        this.milestones = task.milestones ? task.milestones : [];
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
    // Create a milestone object with "text" and default "status" set to 'todo'.
    const newMilestoneObj = { text: this.newMilestone.trim(), status: 'todo' };
    this.milestones.push(newMilestoneObj);
    console.log("Milestone added:", newMilestoneObj);
    this.newMilestone = '';

    // Update the local projects array for the selected task.
    const projectIndex = this.projects.findIndex(p => p.projectId === this.selectedProjectId);
    if (projectIndex > -1) {
      const project = this.projects[projectIndex];
      const taskIndex = project.tasks.findIndex((t: any) => t.taskName === this.selectedTaskId);
      if (taskIndex > -1) {
        if (!project.tasks[taskIndex].milestones) {
          project.tasks[taskIndex].milestones = [];
        }
        project.tasks[taskIndex].milestones = this.milestones;
      }
    }

    // Call the API to update the milestones on the server.
    this.updateMilestonesOnServer();
  }

  updateMilestonesOnServer(): void {
    if (!this.selectedProjectId || !this.selectedTaskId) {
      return;
    }
    const payload = {
      projectId: this.selectedProjectId,
      taskName: this.selectedTaskId,
      milestones: this.milestones
    };
    this.apiService.updateTaskMilestones(payload).subscribe({
      next: (response: any) => {
        console.log("Milestones updated successfully on server", response);
      },
      error: (error: any) => {
        console.error("Error updating milestones on server", error);
      }
    });
  }

  // New method: cycle milestone status on click.
  cycleMilestoneStatus(index: number): void {
    const statuses = ['todo', 'in-progress', 'done'];
    const currentStatus = this.milestones[index].status;
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    this.milestones[index].status = nextStatus;
    console.log(`Milestone at index ${index} status updated to ${nextStatus}`);
    this.updateMilestonesOnServer();

    // Also update the local projects array for consistency.
    const projectIndex = this.projects.findIndex(p => p.projectId === this.selectedProjectId);
    if (projectIndex > -1) {
      const project = this.projects[projectIndex];
      const taskIndex = project.tasks.findIndex((t: any) => t.taskName === this.selectedTaskId);
      if (taskIndex > -1) {
        project.tasks[taskIndex].milestones = this.milestones;
      }
    }
  }
}
