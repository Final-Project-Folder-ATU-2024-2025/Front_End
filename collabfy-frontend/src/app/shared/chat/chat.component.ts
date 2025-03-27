import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../api.service';
import { Subscription } from 'rxjs';

export interface Connection {
  uid: string;
  firstName: string;
  surname: string;
  hasUnread: boolean;  // This should be provided by your API
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

  // Load connections from your API (do not hard-code any test names)
  connections: Connection[] = [];

  // Global flag for the chat button bell
  hasNewMessage: boolean = false;

  faUser = faUser;
  faBell = faBell;

  private subscriptions: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('uid') || '';
    if (!this.currentUserId) {
      console.error('Current user ID not found in storage.');
      return;
    }
    this.loadConnections();
    
    // For testing: simulate a global unread flag after 5 seconds if no chat is active.
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
        // Expect your API to return an array of connection objects.
        // For testing, if the API doesn't return a hasUnread property, you can simulate it like this:
        this.connections = (response.connections || []).map((conn: any) => ({
          ...conn,
          hasUnread: conn.hasUnread === true  // Ensure boolean; adjust this line as needed
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
    // Mark this connection's messages as read by calling the new endpoint.
    this.apiService.markMessagesRead(
      [this.currentUserId, connection.uid].sort().join('-'), // conversationId
      this.currentUserId // assuming the current user is the recipient for incoming messages
    ).subscribe({
      next: (res: any) => {
        console.log("Messages marked as read:", res);
        // Update the connection flag to hide the bell icon.
        connection.hasUnread = false;
        // Optionally clear the global new message flag.
        this.hasNewMessage = false;
      },
      error: (err: any) => {
        console.error("Error marking messages as read:", err);
      }
    });
    // Then load the chat messages for the conversation.
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
