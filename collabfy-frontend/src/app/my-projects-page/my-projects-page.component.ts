/* =======================================================================
   MyProjectsPageComponent
   This component manages the "My Projects" page. It displays a list of projects
   for the logged-in user and provides functions to filter projects, update status,
   delete projects, leave projects, and manage comments.
   ======================================================================= */

   import { Component, OnInit } from '@angular/core';            // Provides component lifecycle hooks and metadata
   import { CommonModule } from '@angular/common';                 // Provides common directives (ngIf, ngFor, etc.)
   import { HeaderComponent } from '../header/header.component';   // Custom header component
   import { FooterComponent } from '../footer/footer.component';   // Custom footer component
   import { ApiService } from '../api.service';                    // Service to interact with the backend API
   import { Router } from '@angular/router';                       // Angular Router for navigation
   import { ChatComponent } from '../shared/chat/chat.component';  // Chat component integration
   import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // FontAwesome module for icons
   import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'; // Icons for modal actions
   
   @Component({
     selector: 'app-my-projects-page',
     standalone: true,
     imports: [
       HeaderComponent,
       FooterComponent,
       CommonModule,
       ChatComponent,
       FontAwesomeModule
     ],
     templateUrl: './my-projects-page.component.html',
     styleUrls: ['./my-projects-page.component.css']
   })
   export class MyProjectsPageComponent implements OnInit {
     projects: any[] = [];               // Array to hold all projects
     uid: string = '';                   // Logged-in user's ID from localStorage
     filterStatus: string | null = null; // Current filter applied (e.g., "In Progress", "Complete")
     projectToDelete: any = null;        // Holds project pending deletion (for confirmation modal)
     projectToLeave: any = null;         // Holds project pending leave action (for confirmation modal)
   
     // Properties to support comment functionality
     selectedProjectId: string = '';     // Project ID selected for comment operations
     comments: any[] = [];               // Array of comments for the selected project
     newComment: string = '';            // New comment text entered by the user
   
     // FontAwesome icons used in modal dialogs
     faCheck = faCheck;
     faCircleXmark = faCircleXmark;
   
     // -----------------------------------------------------------------------
     // Constructor: Injects the API service and Router.
     // -----------------------------------------------------------------------
     constructor(private apiService: ApiService, private router: Router) {}
   
     // -----------------------------------------------------------------------
     // ngOnInit: Called on component initialization.
     // Retrieves the user ID from localStorage and fetches projects.
     // -----------------------------------------------------------------------
     ngOnInit(): void {
       this.uid = localStorage.getItem('uid') || '';
       if (this.uid) {
         this.fetchProjects();
       } else {
         console.error("No UID found in localStorage.");
       }
     }
   
     // -----------------------------------------------------------------------
     // fetchProjects: Retrieves projects for the logged-in user via the API service.
     // -----------------------------------------------------------------------
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
   
     // -----------------------------------------------------------------------
     // currentUserIsOwner: Checks if the current user is the owner of a given project.
     // -----------------------------------------------------------------------
     currentUserIsOwner(project: any): boolean {
       return project.ownerId === this.uid;
     }
   
     // -----------------------------------------------------------------------
     // getDisplayedProjects: Returns the list of projects filtered based on the selected filter.
     // For filters like 'Deadline' and 'Alphabetical', sorts the projects accordingly.
     // -----------------------------------------------------------------------
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
   
     // -----------------------------------------------------------------------
     // updateProject: Navigates to the project update page if the current user is the owner.
     // -----------------------------------------------------------------------
     updateProject(project: any): void {
       if (this.currentUserIsOwner(project)) {
         this.router.navigate(['/create-project-page'], { queryParams: { projectId: project.projectId } });
       }
     }
   
     // -----------------------------------------------------------------------
     // openDeleteModal: Opens the confirmation modal for deleting a project.
     // Only the project owner can delete a project.
     // -----------------------------------------------------------------------
     openDeleteModal(project: any): void {
       if (this.currentUserIsOwner(project)) {
         this.projectToDelete = project;
       }
     }
   
     // -----------------------------------------------------------------------
     // confirmDelete: Calls the API to delete the project and then refreshes the project list.
     // FIX: Updated to include both projectId and requesterId (current user ID) in the payload.
     // -----------------------------------------------------------------------
     confirmDelete(): void {
       if (this.projectToDelete) {
         const payload = {
           projectId: this.projectToDelete.projectId,
           requesterId: this.uid
         };
         this.apiService.deleteProject(payload).subscribe({
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
   
     // -----------------------------------------------------------------------
     // cancelDelete: Cancels the deletion process by clearing the pending project.
     // -----------------------------------------------------------------------
     cancelDelete(): void {
       this.projectToDelete = null;
     }
   
     // -----------------------------------------------------------------------
     // openLeaveProjectModal: Opens the confirmation modal for leaving a project.
     // Only non-owners (collaborators) can leave a project.
     // -----------------------------------------------------------------------
     openLeaveProjectModal(project: any): void {
       if (!this.currentUserIsOwner(project)) {
         this.projectToLeave = project;
       }
     }
   
     // -----------------------------------------------------------------------
     // confirmLeaveProject: Calls the API to leave the project and then refreshes the project list.
     // -----------------------------------------------------------------------
     confirmLeaveProject(): void {
       if (this.projectToLeave) {
         this.apiService.leaveProject(this.projectToLeave.projectId, this.uid).subscribe({
           next: (response: any) => {
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
   
     // -----------------------------------------------------------------------
     // cancelLeaveProject: Cancels the leave project process.
     // -----------------------------------------------------------------------
     cancelLeaveProject(): void {
       this.projectToLeave = null;
     }
   
     // -----------------------------------------------------------------------
     // markStatusToggle: Toggles a project's status between 'Complete' and 'In Progress'.
     // This function is available only to the project owner.
     // -----------------------------------------------------------------------
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
   
     // -----------------------------------------------------------------------
     // Filter Methods: Set the filterStatus to filter projects based on different criteria.
     // -----------------------------------------------------------------------
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
   
     // ========================================================================
     // Comment Functions Section
     // These functions manage comment-related operations for the selected project.
     // ========================================================================
   
     // -----------------------------------------------------------------------
     // getComments: Fetches comments for the currently selected project.
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
     // addComment: Sends a new comment to the backend and refreshes the comment list.
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
     // Assumes that each comment object contains its document ID in the 'id' property.
     // -----------------------------------------------------------------------
     deleteCommentImmediate(comment: any): void {
       if (!this.selectedProjectId) { return; }
       const payload = {
         projectId: this.selectedProjectId,
         commentId: comment.id,
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
   