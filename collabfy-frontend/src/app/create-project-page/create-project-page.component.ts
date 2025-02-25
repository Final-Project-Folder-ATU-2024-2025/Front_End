import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-project-page',
    standalone: true, 
    imports: [CommonModule, 
              HeaderComponent, 
              FooterComponent, 
              FormsModule, 
              HttpClientModule],
    templateUrl: './create-project-page.component.html',
    styleUrls: ['./create-project-page.component.css']
})
export class CreateProjectPageComponent implements OnInit {
  projectName: string = '';
  description: string = '';
  deadline: string = ''; // Expected format: YYYY-MM-DD

  // Dynamic tasks: each task has a taskName and taskDescription
  tasks: { taskName: string; taskDescription: string }[] = [];

  // For collaborators: list of available connections and invited collaborators.
  connections: any[] = [];
  invitedCollaborators: any[] = [];

  // Current user ID
  uid: string = '';

  constructor(private http: HttpClient, private router: Router) {
    // Start with one empty task by default.
    this.tasks.push({ taskName: '', taskDescription: '' });
  }

  ngOnInit(): void {
    this.uid = localStorage.getItem('uid') || 'user1';
    this.fetchConnections();
  }

  // Fetch the current user's connections from the backend.
  fetchConnections(): void {
    this.http.post('http://127.0.0.1:5000/api/user-connections', { userId: this.uid })
      .subscribe({
        next: (response: any) => {
          this.connections = response.connections || [];
        },
        error: (error: any) => {
          console.error("Error fetching connections:", error);
        }
      });
  }

  // Helper to check if a connection is already invited.
  isCollaboratorInvited(member: any): boolean {
    return this.invitedCollaborators.some(m => m.uid === member.uid);
  }

  // Toggle a connection’s invitation status.
  toggleCollaborator(member: any): void {
    if (this.isCollaboratorInvited(member)) {
      this.invitedCollaborators = this.invitedCollaborators.filter(m => m.uid !== member.uid);
    } else {
      this.invitedCollaborators.push(member);
    }
  }

  // Add a new empty task.
  addTask(): void {
    this.tasks.push({ taskName: '', taskDescription: '' });
  }

  // Remove a task at the specified index.
  removeTask(index: number): void {
    if (this.tasks.length > 1) {
      this.tasks.splice(index, 1);
    }
  }

  // Create the project and send invitations to invited collaborators.
  createProject(): void {
    const ownerId = this.uid;
    // IMPORTANT: Do not auto-add collaborators into the project team.
    const projectData = {
      projectName: this.projectName,
      description: this.description,
      deadline: this.deadline,
      tasks: this.tasks,
      ownerId: ownerId,
      team: []  // Initially empty; collaborators must accept invitation.
    };

    this.http.post('http://127.0.0.1:5000/api/create-project', projectData)
      .subscribe({
        next: (response: any) => {
          alert('Project created successfully!');
          const projectId = response.projectId;
          // For each invited collaborator, send an invitation.
          this.invitedCollaborators.forEach(member => {
            const invitationData = {
              projectId: projectId,
              projectName: this.projectName,
              deadline: this.deadline,
              ownerId: ownerId,
              invitedUserId: member.uid
            };
            this.http.post('http://127.0.0.1:5000/api/invite-to-project', invitationData)
              .subscribe({
                next: (resp: any) => {
                  console.log(`Invitation sent to ${member.firstName} ${member.surname}`);
                },
                error: (err) => {
                  console.error(`Error inviting ${member.firstName} ${member.surname}:`, err);
                }
              });
          });
          this.router.navigate(['/home-page']);
        },
        error: (error) => {
          alert('Error creating project: ' + (error.error?.error || error.message));
        }
      });
  }

  // Navigate back to the Home page.
  goToHomePage(): void {
    this.router.navigate(['/home-page']);
  }
}
