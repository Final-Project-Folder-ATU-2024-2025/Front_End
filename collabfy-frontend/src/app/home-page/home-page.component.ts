// src/app/home-page/home-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  options = [
    'Create a New Project',
    'My Projects',
    'Project Deadlines',
    'Notifications',
    'Connections'
  ];

  currentIndex: number = 0;
  isAnimating: boolean = false;
  direction: 'next' | 'prev' = 'next';

  // Connections-specific properties
  connectionsCount: number = 0;
  searchQuery: string = '';
  searchResults: any[] = [];
  pendingRequests: { [email: string]: boolean } = {};
  connections: any[] = [];

  // Notifications-specific properties
  notifications: any[] = [];
  notificationsLoaded: boolean = false;

  // New properties for projects and deadlines
  myProjects: any[] = [];
  projectDeadlines: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // When the page loads, fetch data for the current slider option
    if (this.options[this.currentIndex] === 'Notifications') {
      this.fetchNotifications();
    } else if (this.options[this.currentIndex] === 'Connections') {
      this.fetchConnections();
    } else if (this.options[this.currentIndex] === 'My Projects') {
      this.fetchMyProjects();
    } else if (this.options[this.currentIndex] === 'Project Deadlines') {
      this.fetchProjectDeadlines();
    }
  }

  // Navigate to Create Project page
  goToCreateProject(): void {
    this.router.navigate(['/create-project-page']);
  }

  searchConnections(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/search-users', { query: this.searchQuery })
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.results || [];
          console.log('Search results:', this.searchResults);
        },
        error: (error) => {
          console.error('Error searching connections:', error);
        }
      });
  }

  toggleConnection(user: any): void {
    const fromUserId = localStorage.getItem('uid') || "user1"; // Replace with actual UID
    const toUserId = user.uid;
    if (!this.pendingRequests[user.email]) {
      this.http.post('http://127.0.0.1:5000/api/send-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            console.log('Connection request sent:', response);
            this.pendingRequests[user.email] = true;
          },
          error: (error) => {
            console.error('Error sending connection request:', error);
          }
        });
    } else {
      this.http.post('http://127.0.0.1:5000/api/cancel-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            console.log('Connection request cancelled:', response);
            this.pendingRequests[user.email] = false;
          },
          error: (error) => {
            console.error('Error cancelling connection request:', error);
          }
        });
    }
  }

  fetchNotifications(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error("User not logged in.");
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/notifications', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.notifications = response.notifications || [];
          this.notificationsLoaded = true;
          console.log('Notifications:', this.notifications);
        },
        error: (error) => {
          console.error("Error fetching notifications:", error);
        }
      });
  }

  fetchConnections(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error("User not logged in.");
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/user-connections', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.connections = response.connections || [];
          this.connectionsCount = this.connections.length;
          console.log("Connections:", this.connections);
        },
        error: (error) => {
          console.error("Error fetching connections:", error);
        }
      });
  }

  fetchMyProjects(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error("User not logged in.");
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/my-projects', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.myProjects = response.projects || [];
          console.log("My Projects:", this.myProjects);
        },
        error: (error) => {
          console.error("Error fetching my projects:", error);
        }
      });
  }

  fetchProjectDeadlines(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error("User not logged in.");
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/project-deadlines', { userId: uid })
      .subscribe({
        next: (response: any) => {
          this.projectDeadlines = response.deadlines || [];
          console.log("Project Deadlines:", this.projectDeadlines);
        },
        error: (error) => {
          console.error("Error fetching project deadlines:", error);
        }
      });
  }

  acceptNotification(notif: any): void {
    this.http.post('http://127.0.0.1:5000/api/respond-connection-request', {
      requestId: notif.connectionRequestId,
      action: "accepted"
    }).subscribe({
      next: (response: any) => {
        console.log("Connection request accepted:", response);
        this.dismissNotification(notif);
        this.fetchConnections();
      },
      error: (error) => {
        console.error("Error accepting connection request:", error);
      }
    });
  }

  rejectNotification(notif: any): void {
    this.http.post('http://127.0.0.1:5000/api/respond-connection-request', {
      requestId: notif.connectionRequestId,
      action: "rejected"
    }).subscribe({
      next: (response: any) => {
        console.log("Connection request rejected:", response);
        this.dismissNotification(notif);
      },
      error: (error) => {
        console.error("Error rejecting connection request:", error);
      }
    });
  }

  dismissNotification(notif: any): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error("User not logged in.");
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/dismiss-notification', {
      userId: uid,
      notificationId: notif.id
    }).subscribe({
      next: (response: any) => {
        console.log("Notification dismissed:", response);
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
      },
      error: (error) => {
        console.error("Error dismissing notification:", error);
      }
    });
  }

  disconnectConnection(conn: any): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error("User not logged in.");
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/disconnect', {
      userId: uid,
      disconnectUserId: conn.uid
    }).subscribe({
      next: (response: any) => {
        console.log("Disconnected successfully:", response);
        this.fetchConnections();
      },
      error: (error) => {
        console.error("Error disconnecting:", error);
      }
    });
  }

  next() {
    this.direction = 'next';
    this.isAnimating = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.options.length;
      this.isAnimating = false;
      if (this.options[this.currentIndex] === 'Notifications') {
        this.fetchNotifications();
      } else if (this.options[this.currentIndex] === 'Connections') {
        this.fetchConnections();
      } else if (this.options[this.currentIndex] === 'My Projects') {
        this.fetchMyProjects();
      } else if (this.options[this.currentIndex] === 'Project Deadlines') {
        this.fetchProjectDeadlines();
      }
    }, 500);
  }

  previous() {
    this.direction = 'prev';
    this.isAnimating = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
      this.isAnimating = false;
      if (this.options[this.currentIndex] === 'Notifications') {
        this.fetchNotifications();
      } else if (this.options[this.currentIndex] === 'Connections') {
        this.fetchConnections();
      } else if (this.options[this.currentIndex] === 'My Projects') {
        this.fetchMyProjects();
      } else if (this.options[this.currentIndex] === 'Project Deadlines') {
        this.fetchProjectDeadlines();
      }
    }, 500);
  }
}
