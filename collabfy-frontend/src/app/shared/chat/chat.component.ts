import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../api.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Connection {
  uid: string;
  firstName: string;
  surname: string;
  hasUnread: boolean;  // Expected to be provided by your API or computed from notifications
}

export interface ChatMessage {
  senderId: string;
  messageText: string;
  timestamp?: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  chatSidebarActive: boolean = false;
  activeChat: Connection | null = null;
  chatMessages: ChatMessage[] = [];
  chatMessage: string = '';
  currentUserId: string = '';

  // Load connections from your API
  connections: Connection[] = [];

  // Global flag for the chat button bell: true only if an unread chat notification exists
  hasNewMessage: boolean = false;

  faUser = faUser;
  faBell = faBell;

  private subscriptions: Subscription = new Subscription();
  private notificationPollingSub: Subscription | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('uid') || '';
    if (!this.currentUserId) {
      console.error('Current user ID not found in storage.');
      return;
    }
    this.loadConnections();
    // Start polling for unread chat notifications every 10 seconds
    this.notificationPollingSub = interval(10000)
      .pipe(switchMap(() => this.apiService.getNotifications(this.currentUserId)))
      .subscribe({
        next: (response: any) => {
          // Assume that chat notifications have a type "chat"
          const chatNotifs = (response.notifications || []).filter(
            (n: any) => n.type === 'chat' && n.status === 'unread'
          );
          this.hasNewMessage = chatNotifs.length > 0;
        },
        error: (err: any) => {
          console.error('Error fetching notifications for chat:', err);
        }
      });
    this.subscriptions.add(this.notificationPollingSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadConnections(): void {
    const sub = this.apiService.getUserConnections(this.currentUserId).subscribe({
      next: (response: any) => {
        // Ensure that the hasUnread property is a boolean
        this.connections = (response.connections || []).map((conn: any) => ({
          ...conn,
          hasUnread: !!conn.hasUnread
        }));
      },
      error: (error: any) => {
        console.error('Error loading connections:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  toggleChatSidebar(): void {
    this.chatSidebarActive = !this.chatSidebarActive;
  }

  openChat(connection: Connection): void {
    this.activeChat = connection;
    // Mark messages as read via the API; this will update the connection's hasUnread flag on success
    this.apiService.markMessagesRead(
      [this.currentUserId, connection.uid].sort().join('-'), // conversationId
      this.currentUserId // current user as the recipient
    ).subscribe({
      next: (res: any) => {
        console.log("Messages marked as read:", res);
        connection.hasUnread = false;
        // Update global flag after marking read
        this.hasNewMessage = false;
      },
      error: (err: any) => {
        console.error("Error marking messages as read:", err);
      }
    });
    this.loadChatMessages(connection.uid);
  }

  closeChat(): void {
    this.activeChat = null;
    this.chatMessages = [];
    this.chatMessage = '';
  }

  loadChatMessages(connectionId: string): void {
    const conversationId = [this.currentUserId, connectionId].sort().join('-');
    const sub = this.apiService.getChatMessages(conversationId).subscribe({
      next: (response: any) => {
        this.chatMessages = response.messages || [];
      },
      error: (error: any) => {
        console.error('Error loading chat messages:', error);
      }
    });
    this.subscriptions.add(sub);
  }

  sendChatMessage(): void {
    if (!this.chatMessage.trim() || !this.activeChat) {
      return;
    }
    const payload = {
      senderId: this.currentUserId,
      receiverId: this.activeChat.uid,
      messageText: this.chatMessage.trim()
    };
    const sub = this.apiService.sendChatMessage(payload).subscribe({
      next: (response: any) => {
        this.chatMessages.push({
          senderId: this.currentUserId,
          messageText: this.chatMessage.trim(),
          timestamp: new Date()
        });
        this.chatMessage = '';
      },
      error: (error: any) => {
        console.error('Error sending chat message:', error);
      }
    });
    this.subscriptions.add(sub);
  }
}
