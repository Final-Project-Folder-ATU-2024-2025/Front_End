import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ChatComponent } from '../shared/chat/chat.component';

@Component({
  selector: 'app-my-projects-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, ChatComponent],
  templateUrl: './my-projects-page.component.html',
  styleUrls: ['./my-projects-page.component.css']
})
export class MyProjectsPageComponent implements OnInit {
  projects: any[] = [];
  uid: string = '';
  filterStatus: string | null = null; // "In Progress", "Complete", "Deadline", or null (show all)

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

  // Returns projects filtered based on the selected filter.
  getDisplayedProjects(): any[] {
    if (!this.filterStatus) {
      return this.projects;
    }
    if (this.filterStatus === 'Deadline') {
      // Return all projects sorted by deadline ascending (closest deadline first)
      return this.projects.slice().sort((a, b) => {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }
    if (this.filterStatus === 'Alphabetical') {
      return this.projects.slice().sort((a, b) => {
        return a.projectName.localeCompare(b.projectName);
      });
    }
    // Otherwise, filter by status equality.
    return this.projects.filter(
      project => (project.status || 'In Progress') === this.filterStatus
    );
  }

  updateProject(project: any): void {
    this.router.navigate(['/create-project-page'], { queryParams: { projectId: project.projectId } });
  }

  deleteProject(project: any): void {
    if (confirm(`Are you sure you want to delete the project "${project.projectName}"?`)) {
      this.apiService.deleteProject(project.projectId).subscribe({
        next: (response: any) => {
          alert(response.message);
          this.fetchProjects();
        },
        error: (error: any) => {
          console.error("Error deleting project:", error);
          alert("Error deleting project: " + (error.error?.error || error.message));
        }
      });
    }
  }

  markStatusToggle(project: any): void {
    const currentStatus = project.status || 'In Progress';
    const newStatus = currentStatus === 'Complete' ? 'In Progress' : 'Complete';
    const payload = {
      projectId: project.projectId,
      status: newStatus
    };
    this.apiService.updateProject(payload).subscribe({
      next: (response: any) => {
        // Update the project status inline without showing an alert.
        project.status = newStatus;
      },
      error: (error: any) => {
        console.error('Error updating project status:', error);
        alert('Error updating project status: ' + (error.error?.error || error.message));
      }
    });
  }

  // Filter methods for the filter containers.
  filterInProgress(): void {
    this.filterStatus = 'In Progress';
  }

  filterComplete(): void {
    this.filterStatus = 'Complete';
  }

  filterDeadline(): void {
    this.filterStatus = 'Deadline';
  }

  viewAllProjects(): void {
    this.filterStatus = null;
  }

  filterAlphabetical(): void {
    this.filterStatus = 'Alphabetical';
  }
}
