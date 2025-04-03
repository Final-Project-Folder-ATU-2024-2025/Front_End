// =======================================================================
// Chat Component
// ------------------------------------------------------------
// This component manages the chat functionality including:
// - Displaying a fixed chat button with a new message notification bell.
// - Toggling a sidebar that lists the user's connections.
// - Displaying a chat window for an active conversation.
// - Polling for unread chat notifications.
// - Sending and receiving chat messages.
// =======================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';  // Core Angular functionalities for component lifecycle.
import { CommonModule } from '@angular/common';                   // Common directives like *ngIf, *ngFor.
import { FormsModule } from '@angular/forms';                      // For two-way binding (ngModel).
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // For FontAwesome icons.
import { faUser, faBell } from '@fortawesome/free-solid-svg-icons'; // Import specific icons.
import { ApiService } from '../../api.service';                   // Custom API service for backend calls.
import { Subscription, interval } from 'rxjs';                     // For managing subscriptions and polling.
import { switchMap } from 'rxjs/operators';                       // Operator for switching to new observable in polling.

export interface Connection {
  uid: string;
  firstName: string;
  surname: string;
  hasUnread: boolean;  // Flag indicating if there are unread messages.
}

export interface ChatMessage {
  senderId: string;
  messageText: string;
  timestamp?: any;  // Optional timestamp, as returned by the backend.
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  // Controls the visibility of the chat sidebar.
  chatSidebarActive: boolean = false;
  // Holds the currently active chat connection.
  activeChat: Connection | null = null;
  // Array of chat messages in the current conversation.
  chatMessages: ChatMessage[] = [];
  // The current message text input by the user.
  chatMessage: string = '';
  // Current user's ID from localStorage.
  currentUserId: string = '';

  // Array of user's connections loaded from the API.
  connections: Connection[] = [];
  // Global flag to indicate if there are any new unread chat notifications.
  hasNewMessage: boolean = false;

  // FontAwesome icons for user and bell.
  faUser = faUser;
  faBell = faBell;

  // Subscriptions holder for cleaning up on component destruction.
  private subscriptions: Subscription = new Subscription();
  // Subscription for polling notifications.
  private notificationPollingSub: Subscription | null = null;

  // Inject the custom API service.
  constructor(private apiService: ApiService) {}

  // =======================================================================
  // ngOnInit:
  // Initialization: sets the current user ID, loads connections, and
  // starts polling for chat notifications every 10 seconds.
  // =======================================================================
  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('uid') || '';
    if (!this.currentUserId) {
      console.error('Current user ID not found in storage.');
      return;
    }
    this.loadConnections();
    // Start polling every 10 seconds for unread chat notifications.
    this.notificationPollingSub = interval(10000)
      .pipe(switchMap(() => this.apiService.getNotifications(this.currentUserId)))
      .subscribe({
        next: (response: any) => {
          // Filter chat notifications with unread status.
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

  // =======================================================================
  // ngOnDestroy:
  // Cleanup: Unsubscribe from all subscriptions when the component is destroyed.
  // =======================================================================
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // =======================================================================
  // loadConnections:
  // Fetches the current user's connections from the backend API.
  // =======================================================================
  loadConnections(): void {
    const sub = this.apiService.getUserConnections(this.currentUserId).subscribe({
      next: (response: any) => {
        // Ensure each connection has a boolean "hasUnread" property.
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

  // =======================================================================
  // toggleChatSidebar:
  // Toggles the visibility of the chat sidebar.
  // =======================================================================
  toggleChatSidebar(): void {
    this.chatSidebarActive = !this.chatSidebarActive;
  }

  // =======================================================================
  // openChat:
  // Opens a chat window for the selected connection.
  // Marks messages as read via the API and loads the chat messages.
  // =======================================================================
  openChat(connection: Connection): void {
    this.activeChat = connection;
    // Mark messages as read for the conversation.
    this.apiService.markMessagesRead(
      [this.currentUserId, connection.uid].sort().join('-'), // Create conversationId by sorting user IDs.
      this.currentUserId // Current user is the recipient.
    ).subscribe({
      next: (res: any) => {
        console.log("Messages marked as read:", res);
        connection.hasUnread = false;
        // Update global new message flag.
        this.hasNewMessage = false;
      },
      error: (err: any) => {
        console.error("Error marking messages as read:", err);
      }
    });
    // Load the chat messages for the conversation.
    this.loadChatMessages(connection.uid);
  }

  // =======================================================================
  // closeChat:
  // Closes the active chat window and resets related properties.
  // =======================================================================
  closeChat(): void {
    this.activeChat = null;
    this.chatMessages = [];
    this.chatMessage = '';
  }

  // =======================================================================
  // loadChatMessages:
  // Fetches chat messages for the conversation with a specific connection.
  // =======================================================================
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

  // =======================================================================
  // sendChatMessage:
  // Sends a new chat message using the API service.
  // Appends the message to the chatMessages array on success.
  // =======================================================================
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
        // Append the sent message locally with a timestamp.
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
