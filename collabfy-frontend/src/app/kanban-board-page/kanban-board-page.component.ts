import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChatComponent } from '../shared/chat/chat.component';

@Component({
  selector: 'app-kanban-board-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    ChatComponent 
  ],
  templateUrl: './kanban-board-page.component.html',
  styleUrls: ['./kanban-board-page.component.css']
})
export class KanbanBoardPageComponent implements OnInit {
  // Variables for projects, tasks, and milestones
  projects: any[] = [];
  tasks: any[] = [];
  milestones: { text: string; status: string }[] = [];
  todoMilestones: { text: string; status: string }[] = [];
  inProgressMilestones: { text: string; status: string }[] = [];
  doneMilestones: { text: string; status: string }[] = [];
  newMilestone: string = '';
  selectedProjectId: string = '';
  selectedTaskId: string = '';

  // NEW variables for comments
  newComment: string = '';
  comments: any[] = [];

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

  // Updated onProjectChange method to fetch comments when a new project is selected
  onProjectChange(event: any): void {
    this.selectedProjectId = event.target.value;
    console.log("Selected project:", this.selectedProjectId);
    const project = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (project && project.tasks) {
      this.tasks = project.tasks;
    } else {
      this.tasks = [];
    }
    this.selectedTaskId = '';
    this.milestones = [];
    this.clearMilestoneColumns();
    this.newMilestone = '';
    // NEW: Fetch comments for the selected project
    this.getComments();
  }

  // onTaskChange method to update task and milestones
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
    this.refreshMilestoneColumns();
  }

  // addMilestone method to create a new milestone
  addMilestone(): void {
    if (this.newMilestone.trim() === '') {
      return;
    }
    const newMilestoneObj = { text: this.newMilestone.trim(), status: 'todo' };
    this.milestones.push(newMilestoneObj);
    this.newMilestone = '';
    this.refreshMilestoneColumns();
    this.updateMilestonesOnServer();
  }

  // refreshMilestoneColumns method to update separate milestone arrays
  refreshMilestoneColumns(): void {
    this.todoMilestones = this.milestones.filter(m => m.status === 'todo');
    this.inProgressMilestones = this.milestones.filter(m => m.status === 'in-progress');
    this.doneMilestones = this.milestones.filter(m => m.status === 'done');
  }

  // clearMilestoneColumns helper method
  clearMilestoneColumns(): void {
    this.todoMilestones = [];
    this.inProgressMilestones = [];
    this.doneMilestones = [];
  }

  // drop method for drag-and-drop functionality
  drop(event: CdkDragDrop<{ text: string; status: string }[]>): void {
    let newStatus = '';
    if (event.container.id === 'todo') {
      newStatus = 'todo';
    } else if (event.container.id === 'in-progress') {
      newStatus = 'in-progress';
    } else if (event.container.id === 'done') {
      newStatus = 'done';
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedMilestone = event.previousContainer.data[event.previousIndex];
      movedMilestone.status = newStatus;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    // Merge the columns back into the full milestones array.
    this.milestones = [...this.todoMilestones, ...this.inProgressMilestones, ...this.doneMilestones];
    this.updateMilestonesOnServer();
  }

  // updateMilestonesOnServer method to sync milestones with the backend
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

  // deleteMilestone method to remove a milestone
  deleteMilestone(milestoneToDelete: { text: string; status: string }): void {
    this.milestones = this.milestones.filter(m => m !== milestoneToDelete);
    this.refreshMilestoneColumns();
    this.updateMilestonesOnServer();
  }

  // NEW: Method to fetch comments for the selected project
  getComments(): void {
    if (!this.selectedProjectId) {
      return;
    }
    this.apiService.getComments({ projectId: this.selectedProjectId }).subscribe({
      next: (response: any) => {
        this.comments = response.comments || [];
      },
      error: (error: any) => {
        console.error("Error fetching comments", error);
      }
    });
  }

  // NEW: Method to add a comment
  addComment(): void {
    if (!this.newComment.trim() || !this.selectedProjectId) {
      return;
    }
    const payload = {
      projectId: this.selectedProjectId,
      userId: localStorage.getItem('uid'),
      commentText: this.newComment.trim()
    };
    this.apiService.addComment(payload).subscribe({
      next: (response: any) => {
        console.log("Comment added successfully", response);
        this.newComment = '';
        this.getComments(); // Refresh the comments list after adding
      },
      error: (error: any) => {
        console.error("Error adding comment", error);
      }
    });
  }
}
