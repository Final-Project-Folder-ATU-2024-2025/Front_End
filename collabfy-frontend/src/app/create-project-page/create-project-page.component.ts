import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatComponent } from '../shared/chat/chat.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-project-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule, ChatComponent, FontAwesomeModule],
  templateUrl: './create-project-page.component.html',
  styleUrls: ['./create-project-page.component.css']
})
export class CreateProjectPageComponent implements OnInit {
  projectName: string = '';
  description: string = '';
  // Deadline remains as DD-MM-YYYY format from the date picker
  deadline: string = '';
  tasks: { taskName: string; taskDescription: string }[] = [{ taskName: '', taskDescription: '' }];
  connections: any[] = [];
  invitedCollaborators: any[] = [];
  // Array of UIDs of users already in the project
  currentTeamIds: string[] = [];
  uid: string = '';
  projectId: string = '';

  // Property for pending removal of a collaborator
  pendingRemovalCollaborator: any = null;
  
  // Properties for showing custom modals
  showDeadlineErrorModal: boolean = false;
  deadlineErrorMessage: string = '';
  showProjectCreatedModal: boolean = false; // New property for project created modal

  // Define icons for use in the template
  faCheck = faCheck;
  faCircleXmark = faCircleXmark;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.uid = localStorage.getItem('uid') || '';
    this.fetchConnections();

    // If projectId exists in query params, we are in update mode.
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.projectId = params['projectId'];
        this.loadProjectData(this.projectId);
      }
    });
  }

  loadProjectData(projectId: string): void {
    this.http.post('http://127.0.0.1:5000/api/get-project', { projectId })
      .subscribe({
        next: (response: any) => {
          if (response.project) {
            const proj = response.project;
            this.projectName = proj.projectName;
            this.description = proj.description;
            if (proj.deadline && proj.deadline.seconds) {
              // Convert Firestore timestamp to DD-MM-YYYY format
              const d = new Date(proj.deadline.seconds * 1000);
              const day = ('0' + d.getDate()).slice(-2);
              const month = ('0' + (d.getMonth() + 1)).slice(-2);
              const year = d.getFullYear();
              this.deadline = `${day}-${month}-${year}`;
            } else {
              this.deadline = proj.deadline;
            }
            this.tasks = proj.tasks || [];
            // Load current team IDs from project data
            this.currentTeamIds = proj.teamIds || [];
          }
        },
        error: (error: any) => {
          console.error("Error loading project data", error);
        }
      });
  }

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

  isCollaboratorInvited(member: any): boolean {
    return this.invitedCollaborators.some(m => m.uid === member.uid);
  }

  toggleCollaborator(member: any): void {
    if (this.isCollaboratorInvited(member)) {
      this.invitedCollaborators = this.invitedCollaborators.filter(m => m.uid !== member.uid);
    } else {
      this.invitedCollaborators.push(member);
    }
  }

  addTask(): void {
    this.tasks.push({ taskName: '', taskDescription: '' });
  }

  removeTask(index: number): void {
    if (this.tasks.length > 1) {
      this.tasks.splice(index, 1);
    }
  }

  createProject(): void {
    const ownerId = this.uid;
    const projectData: any = {
      projectName: this.projectName,
      description: this.description,
      deadline: this.deadline,
      tasks: this.tasks,
      ownerId: ownerId,
      team: []  // For new projects, team is updated via invitations
    };

    if (this.projectId) {
      // Update mode
      projectData.projectId = this.projectId;
      this.http.post('http://127.0.0.1:5000/api/update-project', projectData)
        .subscribe({
          next: (response: any) => {
            alert('Project updated successfully!');
            // For each invited collaborator, send invitation
            this.invitedCollaborators.forEach(member => {
              const invitationData = {
                projectId: this.projectId,
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
            if (error.error && error.error.error && error.error.error.includes("Deadline must be in")) {
              this.deadlineErrorMessage = error.error.error;
              this.showDeadlineErrorModal = true;
            } else {
              alert('Error updating project: ' + (error.error?.error || error.message));
            }
          }
        });
    } else {
      // Create mode
      this.http.post('http://127.0.0.1:5000/api/create-project', projectData)
        .subscribe({
          next: (response: any) => {
            // Show the custom "Project created" modal instead of an alert.
            this.showProjectCreatedModal = true;
            const newProjectId = response.projectId;
            // For each invited collaborator, send invitation
            this.invitedCollaborators.forEach(member => {
              const invitationData = {
                projectId: newProjectId,
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
            // After a 2-second delay, navigate to the home page.
            setTimeout(() => {
              this.router.navigate(['/home-page']);
            }, 2000);
          },
          error: (error) => {
            if (error.error && error.error.error && error.error.error.includes("Deadline must be in")) {
              this.deadlineErrorMessage = error.error.error;
              this.showDeadlineErrorModal = true;
            } else {
              alert('Error creating project: ' + (error.error?.error || error.message));
            }
          }
        });
    }
  }

  // Methods for Remove Collaborator confirmation modal
  openRemoveCollaboratorModal(member: any): void {
    this.pendingRemovalCollaborator = member;
  }

  confirmRemoveCollaborator(): void {
    if (this.pendingRemovalCollaborator && this.projectId) {
      const payload = {
        projectId: this.projectId,
        collaboratorId: this.pendingRemovalCollaborator.uid,
        ownerId: this.uid
      };
      this.http.post('http://127.0.0.1:5000/api/remove-collaborator', payload)
        .subscribe({
          next: (response: any) => {
            alert('Collaborator removed successfully.');
            // Update currentTeamIds by removing the removed collaborator
            this.currentTeamIds = this.currentTeamIds.filter(uid => uid !== this.pendingRemovalCollaborator.uid);
            this.pendingRemovalCollaborator = null;
          },
          error: (error: any) => {
            console.error('Error removing collaborator:', error);
            this.pendingRemovalCollaborator = null;
          }
        });
    }
  }

  cancelRemoveCollaborator(): void {
    this.pendingRemovalCollaborator = null;
  }

  closeDeadlineErrorModal(): void {
    this.showDeadlineErrorModal = false;
    this.deadlineErrorMessage = '';
  }

  goToHomePage(): void {
    this.router.navigate(['/home-page']);
  }
}
