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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

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

  // Variables for comments
  newComment: string = '';
  comments: any[] = [];

  // Current user's UID from localStorage
  currentUserId: string = localStorage.getItem('uid') || '';

  // FontAwesome icons
  faCheck = faCheck;
  faCircleXmark = faCircleXmark;

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

  addMilestone(): void {
    if (!this.newMilestone.trim()) { return; }
    const newMilestoneObj = { text: this.newMilestone.trim(), status: 'todo' };
    this.milestones.push(newMilestoneObj);
    this.newMilestone = '';
    this.refreshMilestoneColumns();
    this.updateMilestonesOnServer();
  }

  refreshMilestoneColumns(): void {
    this.todoMilestones = this.milestones.filter(m => m.status === 'todo');
    this.inProgressMilestones = this.milestones.filter(m => m.status === 'in-progress');
    this.doneMilestones = this.milestones.filter(m => m.status === 'done');
  }

  clearMilestoneColumns(): void {
    this.todoMilestones = [];
    this.inProgressMilestones = [];
    this.doneMilestones = [];
  }

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
    this.milestones = [...this.todoMilestones, ...this.inProgressMilestones, ...this.doneMilestones];
    this.updateMilestonesOnServer();
  }

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

  deleteMilestone(milestoneToDelete: { text: string; status: string }): void {
    this.milestones = this.milestones.filter(m => m !== milestoneToDelete);
    this.refreshMilestoneColumns();
    this.updateMilestonesOnServer();
  }

  // COMMENT FUNCTIONS

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

  // Immediately delete the comment when the X icon is clicked.
  deleteCommentImmediate(comment: any): void {
    if (!this.selectedProjectId) { return; }
    const payload = {
      projectId: this.selectedProjectId,
      commentId: comment.id, // Assumes each comment object has its document ID as 'id'
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
