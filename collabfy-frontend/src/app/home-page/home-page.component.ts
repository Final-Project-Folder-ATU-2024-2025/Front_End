// src/app/home-page/home-page.component.ts
// This component displays a slider with options including Notifications and Connections.
// The Notifications slide fetches and displays notifications for the logged‑in user.
// The Connections slide allows searching for users and toggling connection requests.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

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
  connectionsCount: number = 0; // Initially zero connections.
  searchQuery: string = '';
  searchResults: any[] = [];
  pendingRequests: { [email: string]: boolean } = {};

  // Notifications-specific properties
  notifications: any[] = [];
  notificationsLoaded: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // If the initial slide is Notifications, fetch notifications.
    if (this.options[this.currentIndex] === 'Notifications') {
      this.fetchNotifications();
    }
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
    const fromUserId = localStorage.getItem('uid') || "user1"; // Replace with actual current user UID
    const toUserId = user.uid; // Your user documents must have a "uid" field.
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

  acceptNotification(notif: any): void {
    // Call the backend to mark the connection request as accepted.
    this.http.post('http://127.0.0.1:5000/api/respond-connection-request', {
      requestId: notif.connectionRequestId,
      action: "accepted"
    }).subscribe({
      next: (response: any) => {
        console.log("Connection request accepted:", response);
        this.dismissNotification(notif);
      },
      error: (error) => {
        console.error("Error accepting connection request:", error);
      }
    });
  }

  rejectNotification(notif: any): void {
    // Call the backend to mark the connection request as rejected.
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
    // Remove the notification locally.
    this.notifications = this.notifications.filter(n => n.id !== notif.id);
  }

  next() {
    this.direction = 'next';
    this.isAnimating = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.options.length;
      this.isAnimating = false;
      if (this.options[this.currentIndex] === 'Notifications' && !this.notificationsLoaded) {
        this.fetchNotifications();
      }
    }, 500);
  }

  previous() {
    this.direction = 'prev';
    this.isAnimating = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
      this.isAnimating = false;
      if (this.options[this.currentIndex] === 'Notifications' && !this.notificationsLoaded) {
        this.fetchNotifications();
      }
    }, 500);
  }
}
