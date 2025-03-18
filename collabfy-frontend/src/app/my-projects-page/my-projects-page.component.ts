import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-projects-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './my-projects-page.component.html',
  styleUrls: ['./my-projects-page.component.css']
})
export class MyProjectsPageComponent implements OnInit {
  projects: any[] = [];
  uid: string = '';

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

  updateProject(project: any): void {
    // Navigate to the Create Project page with the projectId as a query parameter.
    this.router.navigate(['/create-project-page'], { queryParams: { projectId: project.projectId } });
  }

  deleteProject(project: any): void {
    if (confirm(`Are you sure you want to delete the project "${project.projectName}"?`)) {
      this.apiService.deleteProject(project.projectId).subscribe({
        next: (response: any) => {
          alert(response.message);
          // Refresh the project list after deletion.
          this.fetchProjects();
        },
        error: (error: any) => {
          console.error("Error deleting project:", error);
          alert("Error deleting project: " + (error.error?.error || error.message));
        }
      });
    }
  }

  toggleProjectStatus(project: any): void {
    // Determine new status based on current status (default "In Progress")
    const currentStatus = project.status || 'In Progress';
    const newStatus = currentStatus === 'Complete' ? 'In Progress' : 'Complete';

    // Prepare the payload with projectId and new status.
    const payload = {
      projectId: project.projectId,
      status: newStatus
    };

    // Call the update-project endpoint via the API service.
    this.apiService.updateProject(payload).subscribe({
      next: (response: any) => {
        alert(`Project status updated to ${newStatus}.`);
        // Update the local project status.
        project.status = newStatus;
      },
      error: (error: any) => {
        console.error("Error updating project status:", error);
        alert("Error updating project status: " + (error.error?.error || error.message));
      }
    });
  }
}
