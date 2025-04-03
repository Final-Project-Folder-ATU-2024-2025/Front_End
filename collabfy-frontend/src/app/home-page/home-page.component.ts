// =======================================================================
// Import necessary Angular core modules and utilities
// -----------------------------------------------------------------------
import { Component, OnInit, OnDestroy } from '@angular/core'; // Component, lifecycle hooks
import { CommonModule } from '@angular/common'; // Common directives (ngIf, ngFor, etc.)
import { FormsModule } from '@angular/forms'; // Template-driven forms (ngModel)
import { HttpClientModule, HttpClient } from '@angular/common/http'; // For HTTP requests
import { Router } from '@angular/router'; // For navigation
import { Subscription } from 'rxjs'; // For managing subscriptions

// =======================================================================
// Import custom components and services
// -----------------------------------------------------------------------
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatComponent } from '../shared/chat/chat.component';
import { ApiService } from '../api.service';

// =======================================================================
// Import FontAwesome modules and icons
// -----------------------------------------------------------------------
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

// =======================================================================
// HomePageComponent:
// This component controls the home page which includes a slider,
// phases cards, connection search and list, notifications, and modals.
// =======================================================================
@Component({
  selector: 'app-home-page',
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
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  // Variables for slider options, connections, notifications, etc.
  options = ['Project Deadlines', 'Notifications'];
  currentIndex: number = 0;
  isAnimating: boolean = false;
  direction: 'next' | 'prev' = 'next';

  searchQuery: string = '';
  searchResults: any[] = [];
  searched: boolean = false;
  pendingRequests: { [email: string]: boolean } = {};
  connections: any[] = [];
  notifications: any[] = [];
  notificationsLoaded: boolean = false;

  myProjects: any[] = [];
  projectDeadlines: any[] = [];

  sliderSlides: Array<{ image: string; alt: string; header: string; subtext: string }> = [
    {
      image: '/assets/images/home_page/homep_img9.jpg',
      alt: 'Home Page Image9',
      header: 'Collaborate Workspaces',
      subtext: 'Engage in productive discussions and brainstorming sessions.'
    },
    {
      image: '/assets/images/home_page/homep_img10.jpg',
      alt: 'Innovative Ideas',
      header: 'Innovative Ideas',
      subtext: 'Drive your projects forward with cutting-edge concepts.'
    },
    {
      image: '/assets/images/home_page/homep_img11.jpg',
      alt: 'Home Page Image11',
      header: 'Dynamic Tools',
      subtext: 'Streamline your workflow with agile, high-performance solutions.'
    }
  ];
  currentSlideIndex: number = 0;

  // Modal properties
  disconnectUser: any = null;
  pendingProjectInvitation: any = null;

  // FontAwesome icons for modals
  faCheck = faCheck;
  faCircleXmark = faCircleXmark;

  // Intervals and subscriptions for updating notifications and slider
  private notificationsInterval: any;
  private sliderInterval: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    // Load notifications and connections when component initializes
    this.fetchNotifications();
    this.fetchConnections();

    // Refresh notifications every 30 seconds
    this.notificationsInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000);

    // Start the slider auto-play every 4 seconds
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  ngOnDestroy(): void {
    // Clear intervals and unsubscribe to prevent memory leaks
    if (this.notificationsInterval) {
      clearInterval(this.notificationsInterval);
    }
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
    this.subscriptions.unsubscribe();
  }

  // Advances the slider to the next slide
  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.sliderSlides.length;
  }

  // Navigates to a specific slide and resets the auto-play interval
  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    clearInterval(this.sliderInterval);
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  // Searches for users based on the search query
  searchConnections(): void {
    console.log('Search query:', this.searchQuery);
    this.searched = true;
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    const currentUserId = localStorage.getItem('uid');
    this.http.post('http://127.0.0.1:5000/api/search-users', {
      query: this.searchQuery,
      currentUserId: currentUserId
    }).subscribe({
      next: (response: any) => {
        console.log('Search response:', response);
        // Exclude the current user from search results
        this.searchResults = (response.results || []).filter(
          (user: any) => user.uid !== currentUserId
        );
      },
      error: (error: any) => {
        console.error('Error searching connections:', error);
      }
    });
  }

  // Removes a user from the search results
  removeSearchResult(user: any): void {
    this.searchResults = this.searchResults.filter((u) => u.email !== user.email);
  }

  // Toggles connection (send or cancel connection request)
  toggleConnection(user: any): void {
    const fromUserId = localStorage.getItem('uid') || 'user1';
    const toUserId = user.uid;
    if (!this.pendingRequests[user.email]) {
      this.http.post('http://127.0.0.1:5000/api/send-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            this.pendingRequests[user.email] = true;
          },
          error: (error: any) => {
            console.error('Error sending connection request:', error);
          }
        });
    } else {
      this.http.post('http://127.0.0.1:5000/api/cancel-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            this.pendingRequests[user.email] = false;
          },
          error: (error: any) => {
            console.error('Error cancelling connection request:', error);
          }
        });
    }
  }

  // Checks if the user is already connected
  isConnected(user: any): boolean {
    return this.connections.some(conn => conn.email === user.email);
  }

  // Fetches notifications using the ApiService
  fetchNotifications(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.apiService.getNotifications(uid, "chat")
      .subscribe({
        next: (response: any) => {
          this.notifications = response.notifications || [];
          this.notificationsLoaded = true;
        },
        error: (error: any) => {
          console.error('Error fetching notifications:', error);
          this.notifications = [];
          this.notificationsLoaded = true;
        }
      });
  }

  // Sends a response to a connection request (accept or reject)
  respondToConnection(notif: any, action: string): void {
    this.apiService.respondConnectionRequest({ requestId: notif.connectionRequestId, action })
      .subscribe({
        next: (response: any) => {
          this.notifications = this.notifications.filter(n => n.id !== notif.id);
        },
        error: (error: any) => {
          console.error('Error responding to connection request:', error);
        }
      });
  }

  // Dismisses a notification using the ApiService
  dismissNotification(notif: any): void {
    const uid = localStorage.getItem('uid');
    if (!uid || !notif.id) {
      this.notifications = this.notifications.filter(n => n !== notif);
      return;
    }
    this.apiService.dismissNotification({ userId: uid, notificationId: notif.id }).subscribe({
      next: (res: any) => {
        this.notifications = this.notifications.filter(n => n !== notif);
      },
      error: (err: any) => {
        console.error('Error dismissing notification', err);
      }
    });
  }

  // Fetches current connections from the API
  fetchConnections(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/user-connections', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.connections = response.connections || [];
        },
        error: (error: any) => {
          console.error('Error fetching connections:', error);
        }
      });
  }

  // Fetches user's projects from the API (used for deadlines)
  fetchMyProjects(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/my-projects', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.myProjects = response.projects || [];
        },
        error: (error: any) => {
          console.error('Error fetching projects:', error);
        }
      });
  }

  // Retrieves project deadlines by reusing the myProjects data
  fetchProjectDeadlines(): void {
    this.fetchMyProjects();
    this.projectDeadlines = this.myProjects;
  }

  // Navigate to the home page
  goHome(): void {
    this.router.navigate(['/home-page']);
  }

  // =======================================================================
  // Disconnect Confirmation Modal Methods
  // =======================================================================
  openDisconnectModal(user: any): void {
    console.log("openDisconnectModal triggered for", user);
    this.disconnectUser = user;
  }

  confirmDisconnect(): void {
    if (this.disconnectUser) {
      const userId = localStorage.getItem('uid') || 'user1';
      const disconnectUserId = this.disconnectUser.uid;
      this.http.post('http://127.0.0.1:5000/api/disconnect', { userId, disconnectUserId })
        .subscribe({
          next: (response: any) => {
            // Remove the disconnected user from the connections list and refresh
            this.connections = this.connections.filter(conn => conn.email !== this.disconnectUser.email);
            this.fetchConnections();
            this.disconnectUser = null;
          },
          error: (error: any) => {
            console.error('Error disconnecting:', error);
            this.disconnectUser = null;
          }
        });
    }
  }

  cancelDisconnect(): void {
    this.disconnectUser = null;
  }

  // =======================================================================
  // Project Invitation Response Methods
  // =======================================================================
  respondToProjectInvitation(notif: any, action: string): void {
    this.http.post('http://127.0.0.1:5000/api/respond-project-invitation', {
      invitationId: notif.id,
      action: action,
      userId: localStorage.getItem('uid')
    }).subscribe({
      next: (response: any) => {
        // Remove invitation notification after response
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
      },
      error: (error: any) => {
        console.error("Error responding to project invitation:", error);
      }
    });
  }

  openDeclineInvitationModal(notif: any): void {
    // Open modal to confirm invitation decline
    this.pendingProjectInvitation = notif;
  }

  confirmDeclineInvitation(): void {
    if (this.pendingProjectInvitation) {
      this.respondToProjectInvitation(this.pendingProjectInvitation, 'declined');
      this.pendingProjectInvitation = null;
    }
  }

  cancelDeclineInvitation(): void {
    this.pendingProjectInvitation = null;
  }
}
