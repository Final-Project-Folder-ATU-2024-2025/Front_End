import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../api.service';
import { Subscription } from 'rxjs';

interface Connection {
  uid: string;
  firstName: string;
  surname: string;
}

interface ChatMessage {
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
  connections: Connection[] = [
    { uid: 'user2', firstName: 'Actual', surname: 'Connection1' },
    { uid: 'user3', firstName: 'Actual', surname: 'Connection2' }
  ];
  faUser = faUser;
  faBell = faBell;
  
  // For simulation: indicates there is an unread message
  hasNewMessage: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('uid') || 'user1';
    if (this.currentUserId) {
      this.loadConnections();
    }
    // For testing: force hasNewMessage to true after 5 seconds if no chat is active.
    setTimeout(() => {
      if (!this.activeChat) {
        this.hasNewMessage = true;
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadConnections(): void {
    const sub = this.apiService.getUserConnections(this.currentUserId).subscribe({
      next: (response: any) => {
        this.connections = response.connections || [];
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
    // Mark messages as read when opening chat.
    this.hasNewMessage = false;
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
        // Optionally: update hasNewMessage based on messages
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
