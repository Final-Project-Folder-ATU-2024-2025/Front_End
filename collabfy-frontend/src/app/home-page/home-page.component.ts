import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// Import the shared chat component (adjust the path as needed)
import { ChatComponent } from '../shared/chat/chat.component';
import { ApiService } from '../api.service';  // Import the ApiService

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    HttpClientModule,
    ChatComponent  // <-- new import here
  ],
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

  private notificationsInterval: any;
  private sliderInterval: any;

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

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
    const currentUserId = localStorage.getItem('uid');
    this.http.post('http://127.0.0.1:5000/api/search-users', {
      query: this.searchQuery,
      currentUserId: currentUserId
    }).subscribe({
      next: (response: any) => {
        this.searchResults = (response.results || []).filter(
          (user: any) => user.uid !== currentUserId
        );
        console.log('Search results:', this.searchResults);
      },
      error: (error: any) => {
        console.error('Error searching connections:', error);
      }
    });
  }

  removeSearchResult(user: any): void {
    this.searchResults = this.searchResults.filter((u) => u.email !== user.email);
  }

  toggleConnection(user: any): void {
    const fromUserId = localStorage.getItem('uid') || 'user1';
    const toUserId = user.uid;
    if (!this.pendingRequests[user.email]) {
      this.http.post('http://127.0.0.1:5000/api/send-connection-request', { fromUserId, toUserId })
        .subscribe({
          next: (response: any) => {
            console.log('Connection request sent:', response);
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
            console.log('Connection request cancelled:', response);
            this.pendingRequests[user.email] = false;
          },
          error: (error: any) => {
            console.error('Error cancelling connection request:', error);
          }
        });
    }
  }

  fetchNotifications(): void {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('User not logged in.');
      return;
    }
    this.http.post('http://127.0.0.1:5000/api/notifications', { userId: uid })
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
        }
      });
  }

  dismissNotification(notif: any): void {
    const uid = localStorage.getItem('uid');
    if (!uid || !notif.id) {
      // Fallback if missing necessary info
      this.notifications = this.notifications.filter(n => n !== notif);
      return;
    }
    // Call the backend API to permanently delete the notification
    this.apiService.dismissNotification({ userId: uid, notificationId: notif.id }).subscribe({
      next: (res: any) => {
        // Remove from local state only if deletion is successful
        this.notifications = this.notifications.filter(n => n !== notif);
      },
      error: (err: any) => {
        console.error('Error dismissing notification', err);
      }
    });
  }

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
          console.log('Connections:', this.connections);
        },
        error: (error: any) => {
          console.error('Error fetching connections:', error);
        }
      });
  }

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
          console.log('My Projects:', this.myProjects);
        },
        error: (error: any) => {
          console.error('Error fetching projects:', error);
        }
      });
  }

  fetchProjectDeadlines(): void {
    this.fetchMyProjects();
    this.projectDeadlines = this.myProjects;
  }
}
