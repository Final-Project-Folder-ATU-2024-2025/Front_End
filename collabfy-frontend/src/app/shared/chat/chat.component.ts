import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { Subscription } from 'rxjs';

// Define interfaces for type safety
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
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  // Chat state variables
  chatSidebarActive: boolean = false;
  activeChat: Connection | null = null;
  chatMessages: ChatMessage[] = [];
  chatMessage: string = '';
  currentUserId: string = '';

  // Actual connections will be loaded from the API
  connections: Connection[] = [];

  // Subscription holder
  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Assume currentUserId is stored in localStorage
    this.currentUserId = localStorage.getItem('uid') || '';
    if (this.currentUserId) {
      this.loadConnections();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Load the user's actual connections from the API
  loadConnections(): void {
    const sub = this.apiService.getUserConnections(this.currentUserId).subscribe({
      next: (response: any) => {
        // Expecting the response to include a "connections" array
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
    this.loadChatMessages(connection.uid);
  }

  closeChat(): void {
    this.activeChat = null;
    this.chatMessages = [];
    this.chatMessage = '';
  }

  // Generate the conversationId by sorting the two user IDs
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
        // Update chat messages locally so the new message appears immediately.
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
