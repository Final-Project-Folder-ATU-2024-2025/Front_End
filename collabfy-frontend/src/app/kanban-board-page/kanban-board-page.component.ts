// =======================================================================
// Import Angular core and common modules, and necessary services.
// -----------------------------------------------------------------------
import { Component, OnInit } from '@angular/core';  // Component decorator and OnInit lifecycle hook
import { CommonModule } from '@angular/common';       // Common directives (ngIf, ngFor, etc.)
import { FormsModule } from '@angular/forms';         // Template-driven forms (ngModel)
import { HttpClientModule } from '@angular/common/http';// HTTP client for API calls
import { Router } from '@angular/router';             // Router for navigation

// =======================================================================
// Import custom components and services used in this component.
// -----------------------------------------------------------------------
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatComponent } from '../shared/chat/chat.component';
import { ApiService } from '../api.service';

// =======================================================================
// Import Angular CDK Drag & Drop module and functions for drag operations.
// -----------------------------------------------------------------------
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// =======================================================================
// Import FontAwesome module and specific icons used in the template.
// -----------------------------------------------------------------------
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

// =======================================================================
// KanbanBoardPageComponent:
// This component handles the Kanban board interface, including projects,
// tasks, milestones, and comments. It supports drag-and-drop for milestone
// reordering, project/task selection, and comment management.
// =======================================================================
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
    ChatComponent,
    FontAwesomeModule
  ],
  templateUrl: './kanban-board-page.component.html',
  styleUrls: ['./kanban-board-page.component.css']
})
export class KanbanBoardPageComponent implements OnInit {
  // Project and Task data arrays
  projects: any[] = [];
  tasks: any[] = [];
  // All milestones and separated arrays for different status categories
  milestones: { text: string; status: string }[] = [];
  todoMilestones: { text: string; status: string }[] = [];
  inProgressMilestones: { text: string; status: string }[] = [];
  doneMilestones: { text: string; status: string }[] = [];
  newMilestone: string = '';
  selectedProjectId: string = '';
  selectedTaskId: string = '';

  // Comment functionality variables
  newComment: string = '';
  comments: any[] = [];

  // Get the current user's ID from localStorage
  currentUserId: string = localStorage.getItem('uid') || '';

  // FontAwesome icons for use in the template
  faCheck = faCheck;
  faCircleXmark = faCircleXmark;

  // -----------------------------------------------------------------------
  // Constructor: Injects the ApiService and Router
  // -----------------------------------------------------------------------
  constructor(private apiService: ApiService, private router: Router) {}

  // -----------------------------------------------------------------------
  // ngOnInit: Lifecycle hook called once the component is initialized.
  // Retrieves projects for the current user.
  // -----------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  // onProjectChange: Triggered when a new project is selected.
  // Updates the tasks list and resets milestone data.
  // -----------------------------------------------------------------------
  onProjectChange(event: any): void {
    this.selectedProjectId = event.target.value;
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
    this.getComments();
  }

  // -----------------------------------------------------------------------
  // onTaskChange: Triggered when a task is selected.
  // Updates the milestones list based on the selected task.
  // -----------------------------------------------------------------------
  onTaskChange(event: any): void {
    this.selectedTaskId = event.target.value;
    const project = this.projects.find(p => p.projectId === this.selectedProjectId);
    if (project && project.tasks) {
      const task = project.tasks.find((t: any) => t.taskName === this.selectedTaskId);
      this.milestones = task && task.milestones ? task.milestones : [];
    } else {
      this.milestones = [];
    }
    this.refreshMilestoneColumns();
  }

  // -----------------------------------------------------------------------
  // addMilestone: Adds a new milestone to the milestones array.
  // -----------------------------------------------------------------------
  addMilestone(): void {
    if (!this.newMilestone.trim()) { return; }
    const newMilestoneObj = { text: this.newMilestone.trim(), status: 'todo' };
    this.milestones.push(newMilestoneObj);
    this.newMilestone = '';
    this.refreshMilestoneColumns();
    this.updateMilestonesOnServer();
  }

  // -----------------------------------------------------------------------
  // refreshMilestoneColumns: Updates the separate arrays for each milestone status.
  // -----------------------------------------------------------------------
  refreshMilestoneColumns(): void {
    this.todoMilestones = this.milestones.filter(m => m.status === 'todo');
    this.inProgressMilestones = this.milestones.filter(m => m.status === 'in-progress');
    this.doneMilestones = this.milestones.filter(m => m.status === 'done');
  }

  // -----------------------------------------------------------------------
  // clearMilestoneColumns: Clears all milestone status arrays.
  // -----------------------------------------------------------------------
  clearMilestoneColumns(): void {
    this.todoMilestones = [];
    this.inProgressMilestones = [];
    this.doneMilestones = [];
  }

  // -----------------------------------------------------------------------
  // drop: Handles drag-and-drop events for milestones.
  // Updates milestone status based on drop target.
  // -----------------------------------------------------------------------
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
    // Merge status-specific arrays back into the main milestones array
    this.milestones = [...this.todoMilestones, ...this.inProgressMilestones, ...this.doneMilestones];
    this.updateMilestonesOnServer();
  }

  // -----------------------------------------------------------------------
  // updateMilestonesOnServer: Sends the updated milestones data to the server.
  // -----------------------------------------------------------------------
  updateMilestonesOnServer(): void {
    if (!this.selectedProjectId || !this.selectedTaskId) { return; }
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

  // -----------------------------------------------------------------------
  // deleteMilestone: Deletes a milestone from the array and updates the server.
  // -----------------------------------------------------------------------
  deleteMilestone(milestoneToDelete: { text: string; status: string }): void {
    this.milestones = this.milestones.filter(m => m !== milestoneToDelete);
    this.refreshMilestoneColumns();
    this.updateMilestonesOnServer();
  }

  // =======================================================================
  // COMMENT FUNCTIONS
  // =======================================================================

  // -----------------------------------------------------------------------
  // getComments: Retrieves comments for the selected project from the server.
  // -----------------------------------------------------------------------
  getComments(): void {
    if (!this.selectedProjectId) { return; }
    this.apiService.getComments({ projectId: this.selectedProjectId }).subscribe({
      next: (response: any) => {
        this.comments = response.comments || [];
      },
      error: (error: any) => {
        console.error("Error fetching comments", error);
      }
    });
  }

  // -----------------------------------------------------------------------
  // addComment: Adds a new comment by sending data to the server.
  // -----------------------------------------------------------------------
  addComment(): void {
    if (!this.newComment.trim() || !this.selectedProjectId) { return; }
    const payload = {
      projectId: this.selectedProjectId,
      userId: localStorage.getItem('uid'),
      commentText: this.newComment.trim()
    };
    this.apiService.addComment(payload).subscribe({
      next: (response: any) => {
        console.log("Comment added successfully", response);
        this.newComment = '';
        this.getComments();
      },
      error: (error: any) => {
        console.error("Error adding comment", error);
      }
    });
  }

  // -----------------------------------------------------------------------
  // deleteCommentImmediate: Deletes a comment immediately when the delete icon is clicked.
  // -----------------------------------------------------------------------
  deleteCommentImmediate(comment: any): void {
    if (!this.selectedProjectId) { return; }
    const payload = {
      projectId: this.selectedProjectId,
      commentId: comment.id,  // Assumes each comment object includes its document ID as 'id'
      userId: localStorage.getItem('uid')
    };
    this.apiService.deleteComment(payload).subscribe({
      next: (response: any) => {
        console.log("Comment deleted successfully", response);
        this.getComments();
      },
      error: (error: any) => {
        console.error("Error deleting comment", error);
      }
    });
  }
}
