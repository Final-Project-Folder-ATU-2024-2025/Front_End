import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home-page',
    imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  options = ['Project Deadlines', 'Notifications'];
  currentIndex: number = 0;
  isAnimating: boolean = false;
  direction: 'next' | 'prev' = 'next';

  searchQuery: string = '';
  searchResults: any[] = [];
  pendingRequests: { [email: string]: boolean } = {};
  connections: any[] = [];
  notifications: any[] = [];
  notificationsLoaded: boolean = false;

  myProjects: any[] = [];
  projectDeadlines: any[] = [];

  private notificationsInterval: any;

  // Bottom slider properties
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
  sliderInterval: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const currentOption = this.options[this.currentIndex];
    if (currentOption === 'Notifications') {
      this.fetchNotifications();
    } else if (currentOption === 'Project Deadlines') {
      this.fetchProjectDeadlines();
    }
    this.fetchConnections();
    this.notificationsInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000);
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.notificationsInterval) {
      clearInterval(this.notificationsInterval);
    }
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.sliderSlides.length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    clearInterval(this.sliderInterval);
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  searchConnections(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.http
      .post('http://127.0.0.1:5000/api/search-users', { query: this.searchQuery })
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.results || [];
          console.log('Search results:', this.searchResults);
        },
        error: (error: any) => {
          console.error('Error searching connections:', error);
        },
      });
  }

  removeSearchResult(user: any): void {
    this.searchResults = this.searchResults.filter((u) => u.email !== user.email);
  }

  toggleConnection(user: any): void {
    const fromUserId = localStorage.getItem('uid') || 'user1';
    const toUserId = user.uid;
    if (!this.pendingRequests[user.email]) {
      this.http
        .post('http://127.0.0.1:5000/api/send-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            console.log('Connection request sent:', response);
            this.pendingRequests[user.email] = true;
          },
          error: (error: any) => {
            console.error('Error sending connection request:', error);
          },
        });
    } else {
      this.http
        .post('http://127.0.0.1:5000/api/cancel-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            console.log('Connection request cancelled:', response);
            this.pendingRequests[user.email] = false;
          },
          error: (error: any) => {
            console.error('Error cancelling connection request:', error);
          },
        });
    }
  }

  fetchNotifications(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http
      .post('http://127.0.0.1:5000/api/notifications', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.notifications = response.notifications || [];
          this.notificationsLoaded = true;
          console.log('Notifications:', this.notifications);
        },
        error: (error: any) => {
          console.error('Error fetching notifications:', error);
          this.notifications = [];
          this.notificationsLoaded = true;
        },
      });
  }

  fetchConnections(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http
      .post('http://127.0.0.1:5000/api/user-connections', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.connections = response.connections || [];
          console.log('Connections:', this.connections);
        },
        error: (error: any) => {
          console.error('Error fetching connections:', error);
        },
      });
  }

  fetchMyProjects(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http
      .post('http://127.0.0.1:5000/api/my-projects', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.myProjects = response.projects || [];
          console.log('My Projects:', this.myProjects);
        },
        error: (error: any) => {
          console.error('Error fetching projects:', error);
        },
      });
  }

  fetchProjectDeadlines(): void {
    this.fetchMyProjects();
    this.projectDeadlines = this.myProjects;
  }

  // Methods for connection request notifications.
  acceptNotification(notif: any): void {
    this.http
      .post('http://127.0.0.1:5000/api/respond-connection-request', {
        requestId: notif.connectionRequestId,
        action: 'accepted',
      })
      .subscribe({
        next: (response: any) => {
          console.log('Connection request accepted:', response);
          this.dismissNotification(notif);
          this.fetchConnections();
        },
        error: (error: any) => {
          console.error('Error accepting connection request:', error);
        },
      });
  }

  rejectNotification(notif: any): void {
    this.http
      .post('http://127.0.0.1:5000/api/respond-connection-request', {
        requestId: notif.connectionRequestId,
        action: 'rejected',
      })
      .subscribe({
        next: (response: any) => {
          console.log('Connection request rejected:', response);
          this.dismissNotification(notif);
        },
        error: (error: any) => {
          console.error('Error rejecting connection request:', error);
        },
      });
  }

  // Updated: Accept Project Invitation method now refreshes My Projects list.
  acceptProjectInvitation(notif: any): void {
    const uid = localStorage.getItem('uid');
    this.http.post('http://127.0.0.1:5000/api/respond-project-invitation', {
      invitationId: notif.id,
      action: 'accepted',
      userId: uid,
      projectId: notif.projectId,    // These fields come from the invitation notification
      projectName: notif.projectName,
      ownerId: notif.ownerId
    }).subscribe({
      next: (response: any) => {
        console.log('Project invitation accepted:', response);
        this.dismissNotification(notif);
        this.fetchMyProjects();
      },
      error: (error: any) => {
        console.error('Error accepting project invitation:', error);
      }
    });
  }
  
  rejectProjectInvitation(notif: any): void {
    const uid = localStorage.getItem('uid');
    this.http.post('http://127.0.0.1:5000/api/respond-project-invitation', {
      invitationId: notif.id,
      action: 'declined',
      userId: uid
    }).subscribe({
      next: (response: any) => {
        console.log('Project invitation declined:', response);
        this.dismissNotification(notif);
      },
      error: (error: any) => {
        console.error('Error declining project invitation:', error);
      }
    });
  }

  dismissNotification(notif: any): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http
      .post('http://127.0.0.1:5000/api/dismiss-notification', {
        userId: uid,
        notificationId: notif.id,
      })
      .subscribe({
        next: (response: any) => {
          console.log('Notification dismissed:', response);
          this.notifications = this.notifications.filter((n) => n.id !== notif.id);
        },
        error: (error: any) => {
          console.error('Error dismissing notification:', error);
        },
      });
  }

  disconnectConnection(conn: any): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http
      .post('http://127.0.0.1:5000/api/disconnect', { userId: uid, disconnectUserId: conn.uid })
      .subscribe({
        next: (response: any) => {
          console.log('Disconnected successfully:', response);
          this.fetchConnections();
        },
        error: (error: any) => {
          console.error('Error disconnecting:', error);
        },
      });
  }
}
