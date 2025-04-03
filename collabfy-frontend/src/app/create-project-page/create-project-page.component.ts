// =======================================================================
// Import necessary Angular core modules and utilities
// =======================================================================
import { Component, OnInit } from '@angular/core';       // Angular component functionality
import { CommonModule } from '@angular/common';            // Common directives
import { FormsModule } from '@angular/forms';              // Template-driven forms support
import { HttpClientModule, HttpClient } from '@angular/common/http'; // HTTP requests
import { Router, ActivatedRoute } from '@angular/router';  // Navigation and route handling

// =======================================================================
// Import custom components and FontAwesome for icons
// =======================================================================
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatComponent } from '../shared/chat/chat.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

// =======================================================================
// Component Decorator: Defines metadata for the Create Project page component
// =======================================================================
@Component({
  selector: 'app-create-project-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    HttpClientModule,
    ChatComponent,
    FontAwesomeModule
  ],
  templateUrl: './create-project-page.component.html',
  styleUrls: ['./create-project-page.component.css']
})
export class CreateProjectPageComponent implements OnInit {
  // =====================================================================
  // Properties for project details and form data
  // =====================================================================
  projectName: string = '';    // Name of the project
  description: string = '';    // Project description
  deadline: string = '';       // Project deadline (as returned from date picker, DD-MM-YYYY)
  tasks: { taskName: string; taskDescription: string }[] = [{ taskName: '', taskDescription: '' }]; // Array of tasks for the project
  connections: any[] = [];     // User connections available for invitations
  invitedCollaborators: any[] = []; // List of users invited to the project
  currentTeamIds: string[] = [];    // UIDs of users already in the project team
  uid: string = '';            // Current user's UID (owner)
  projectId: string = '';      // Project ID (used for updating an existing project)

  // =====================================================================
  // Properties for modal dialogs and collaborator removal
  // =====================================================================
  pendingRemovalCollaborator: any = null; // Temporarily holds the collaborator selected for removal
  showDeadlineErrorModal: boolean = false; // Flag to show deadline error modal
  deadlineErrorMessage: string = '';       // Message to display in the deadline error modal
  showProjectCreatedModal: boolean = false;  // Flag to show project creation success modal

  // =====================================================================
  // Icons used in the template
  // =====================================================================
  faCheck = faCheck;
  faCircleXmark = faCircleXmark;

  // =====================================================================
  // Constructor: Inject required services (HttpClient, Router, ActivatedRoute)
  // =====================================================================
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  // =====================================================================
  // ngOnInit: Initialization logic for the component
  // =====================================================================
  ngOnInit(): void {
    // Retrieve current user's UID from localStorage
    this.uid = localStorage.getItem('uid') || '';
    // Fetch user connections for inviting collaborators
    this.fetchConnections();

    // Check if projectId exists in query parameters to determine update mode
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.projectId = params['projectId'];
        this.loadProjectData(this.projectId);
      }
    });
  }

  // =====================================================================
  // loadProjectData: Load project data for editing an existing project.
  // =====================================================================
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
            // Save the current team IDs for display in the collaborators list
            this.currentTeamIds = proj.teamIds || [];
          }
        },
        error: (error: any) => {
          console.error("Error loading project data", error);
        }
      });
  }

  // =====================================================================
  // fetchConnections: Retrieve the current user's connections for inviting collaborators.
  // =====================================================================
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

  // =====================================================================
  // isCollaboratorInvited: Check if a member is already invited.
  // =====================================================================
  isCollaboratorInvited(member: any): boolean {
    return this.invitedCollaborators.some(m => m.uid === member.uid);
  }

  // =====================================================================
  // toggleCollaborator: Add or remove a collaborator from the invited list.
  // =====================================================================
  toggleCollaborator(member: any): void {
    if (this.isCollaboratorInvited(member)) {
      this.invitedCollaborators = this.invitedCollaborators.filter(m => m.uid !== member.uid);
    } else {
      this.invitedCollaborators.push(member);
    }
  }

  // =====================================================================
  // addTask: Append a new empty task to the tasks array.
  // =====================================================================
  addTask(): void {
    this.tasks.push({ taskName: '', taskDescription: '' });
  }

  // =====================================================================
  // removeTask: Remove a task from the tasks array by index.
  // =====================================================================
  removeTask(index: number): void {
    if (this.tasks.length > 1) {
      this.tasks.splice(index, 1);
    }
  }

  // =====================================================================
  // createProject: Create a new project or update an existing project.
  // =====================================================================
  createProject(): void {
    const ownerId = this.uid;
    // Prepare project data payload
    const projectData: any = {
      projectName: this.projectName,
      description: this.description,
      deadline: this.deadline,
      tasks: this.tasks,
      ownerId: ownerId,
      team: []  // Initially empty; collaborators will be added via invitations
    };

    if (this.projectId) {
      // Update mode: update an existing project
      projectData.projectId = this.projectId;
      this.http.post('http://127.0.0.1:5000/api/update-project', projectData)
        .subscribe({
          next: (response: any) => {
            // For each invited collaborator, send an invitation request
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
            this.router.navigate(['/my-projects-page']);
          },
          error: (error) => {
            // Check for deadline format error and display modal if needed
            if (error.error && error.error.error && error.error.error.includes("Deadline must be in")) {
              this.deadlineErrorMessage = error.error.error;
              this.showDeadlineErrorModal = true;
            } else {
              alert('Error updating project: ' + (error.error?.error || error.message));
            }
          }
        });
    } else {
      // Create mode: create a new project
      this.http.post('http://127.0.0.1:5000/api/create-project', projectData)
        .subscribe({
          next: (response: any) => {
            // Show the project created modal
            this.showProjectCreatedModal = true;
            const newProjectId = response.projectId;
            // Send invitation requests for each invited collaborator
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
            // Navigate to home page after a 2-second delay
            setTimeout(() => {
              this.router.navigate(['/home-page']);
            }, 2000);
          },
          error: (error) => {
            // Check for deadline error message and show modal if necessary
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

  // =====================================================================
  // Modal Methods for Collaborator Removal:
  // Open, confirm, and cancel removal of a collaborator.
  // =====================================================================
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
            // Update current team IDs by removing the removed collaborator
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

  // =====================================================================
  // closeDeadlineErrorModal:
  // Closes the deadline error modal and clears the error message.
  // =====================================================================
  closeDeadlineErrorModal(): void {
    this.showDeadlineErrorModal = false;
    this.deadlineErrorMessage = '';
  }

  // =====================================================================
  // goToHomePage:
  // Navigate to the home page.
  // =====================================================================
  goToHomePage(): void {
    this.router.navigate(['/home-page']);
  }
}
