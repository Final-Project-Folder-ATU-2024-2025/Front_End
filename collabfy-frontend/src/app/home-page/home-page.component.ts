import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChatComponent } from '../shared/chat/chat.component';
import { ApiService } from '../api.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    HttpClientModule,
    ChatComponent
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
  searched: boolean = false; // Flag to indicate a search was performed
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
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    // Initially load notifications, connections, projects, etc.
    this.fetchNotifications();
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
    this.subscriptions.unsubscribe();
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
        this.searchResults = (response.results || []).filter(
          (user: any) => user.uid !== currentUserId
        );
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

  // Updated to pass excludeType "chat" so chat notifications are omitted
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

  fetchProjectDeadlines(): void {
    this.fetchMyProjects();
    this.projectDeadlines = this.myProjects;
  }

  goHome(): void {
    this.router.navigate(['/home-page']);
  }
}
