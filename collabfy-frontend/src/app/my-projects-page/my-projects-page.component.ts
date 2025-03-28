import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ChatComponent } from '../shared/chat/chat.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-my-projects-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, ChatComponent, FontAwesomeModule],
  templateUrl: './my-projects-page.component.html',
  styleUrls: ['./my-projects-page.component.css']
})
export class MyProjectsPageComponent implements OnInit {
  projects: any[] = [];
  uid: string = '';
  filterStatus: string | null = null; // "In Progress", "Complete", "Deadline", "Alphabetical", or null
  projectToDelete: any = null; // Holds the project pending deletion
  projectToLeave: any = null; // Holds the project pending leave action

  faCheck = faCheck;
  faCircleXmark = faCircleXmark;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.uid = localStorage.getItem('uid') || '';
    if (this.uid) {
      this.fetchProjects();
    } else {
      console.error("No UID found in localStorage.");
    }
  }

  fetchProjects(): void {
    this.apiService.getMyProjects(this.uid).subscribe({
      next: (response: any) => {
        if (response.projects) {
          this.projects = response.projects;
        } else {
          console.error("No projects found in response:", response);
        }
      },
      error: (error: any) => {
        console.error("Error fetching projects:", error);
      }
    });
  }

  // Helper method: returns true if the logged-in user is the owner of the project.
  currentUserIsOwner(project: any): boolean {
    return project.ownerId === this.uid;
  }

  // Returns projects filtered based on the selected filter.
  getDisplayedProjects(): any[] {
    if (!this.filterStatus) {
      return this.projects;
    }
    if (this.filterStatus === 'Deadline') {
      return this.projects.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    if (this.filterStatus === 'Alphabetical') {
      return this.projects.slice().sort((a, b) => a.projectName.localeCompare(b.projectName));
    }
    return this.projects.filter(project => (project.status || 'In Progress') === this.filterStatus);
  }

  updateProject(project: any): void {
    if (this.currentUserIsOwner(project)) {
      this.router.navigate(['/create-project-page'], { queryParams: { projectId: project.projectId } });
    }
  }

  openDeleteModal(project: any): void {
    if (this.currentUserIsOwner(project)) {
      this.projectToDelete = project;
    }
  }

  confirmDelete(): void {
    if (this.projectToDelete) {
      this.apiService.deleteProject(this.projectToDelete.projectId).subscribe({
        next: (response: any) => {
          this.fetchProjects();
          this.projectToDelete = null;
        },
        error: (error: any) => {
          console.error("Error deleting project:", error);
          alert("Error deleting project: " + (error.error?.error || error.message));
          this.projectToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.projectToDelete = null;
  }

  // New: Open Leave Project modal (for collaborators only)
  openLeaveProjectModal(project: any): void {
    if (!this.currentUserIsOwner(project)) {
      this.projectToLeave = project;
    }
  }

  confirmLeaveProject(): void {
    if (this.projectToLeave) {
      this.apiService.leaveProject(this.projectToLeave.projectId, this.uid).subscribe({
        next: (response: any) => {
          // Refresh the projects list and hide the modal without an alert
          this.fetchProjects();
          this.projectToLeave = null;
        },
        error: (error: any) => {
          console.error("Error leaving project:", error);
          alert("Error leaving project: " + (error.error?.error || error.message));
          this.projectToLeave = null;
        }
      });
    }
  }
  

  // New: Cancel Leave Project modal
  cancelLeaveProject(): void {
    this.projectToLeave = null;
  }

  markStatusToggle(project: any): void {
    if (this.currentUserIsOwner(project)) {
      const currentStatus = project.status || 'In Progress';
      const newStatus = currentStatus === 'Complete' ? 'In Progress' : 'Complete';
      const payload = {
        projectId: project.projectId,
        status: newStatus,
        requesterId: this.uid
      };
      this.apiService.updateProject(payload).subscribe({
        next: (response: any) => {
          project.status = newStatus;
        },
        error: (error: any) => {
          console.error('Error updating project status:', error);
          alert('Error updating project status: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  // Filter methods.
  filterInProgress(): void {
    this.filterStatus = 'In Progress';
  }
  filterComplete(): void {
    this.filterStatus = 'Complete';
  }
  filterDeadline(): void {
    this.filterStatus = 'Deadline';
  }
  filterAlphabetical(): void {
    this.filterStatus = 'Alphabetical';
  }
  viewAllProjects(): void {
    this.filterStatus = null;
  }
}
