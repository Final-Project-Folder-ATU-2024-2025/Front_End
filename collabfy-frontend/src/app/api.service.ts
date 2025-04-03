// =======================================================================
// ApiService
// -----------------------------------------------------------------------
// This service handles all HTTP communications with the Flask backend API.
// It provides methods to create users, manage projects, comments, chat messages,
// notifications, and user settings.
// =======================================================================
import { Injectable } from '@angular/core';                   // For creating injectable services
import { HttpClient, HttpHeaders } from '@angular/common/http';   // For making HTTP requests and setting headers
import { Observable } from 'rxjs';                                // For handling asynchronous operations

@Injectable({
  providedIn: 'root'  // This service is provided at the root level, making it available throughout the app.
})
export class ApiService {
  // Base URL for the Flask backend API.
  private apiUrl = 'http://127.0.0.1:5000/api';

  // HTTP options including headers to send with each request.
  // This ensures that the request Content-Type is correctly set to 'application/json'.
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Inject HttpClient into the service for making HTTP calls.
  constructor(private http: HttpClient) {}

  // =======================================================================
  // createUser: Sends a POST request to create a new user.
  // Expects userData containing firstName, surname, email, password, etc.
  // =======================================================================
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-user`, userData, this.httpOptions);
  }

  // =======================================================================
  // getMyProjects: Retrieves projects associated with a user by sending a POST
  // request with the userId.
  // =======================================================================
  getMyProjects(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-projects`, { userId }, this.httpOptions);
  }

  // =======================================================================
  // updateTaskMilestones: Updates the milestones for a specific task in a project.
  // The payload should contain projectId, taskName, and the updated milestones array.
  // =======================================================================
  updateTaskMilestones(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-task-milestones`, payload, this.httpOptions);
  }

  // =======================================================================
  // getComments: Retrieves comments for a given project.
  // Expects a payload with the projectId.
  // =======================================================================
  getComments(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-comments`, payload, this.httpOptions);
  }

  // =======================================================================
  // addComment: Adds a comment to a project.
  // Expects a payload containing projectId, userId, and commentText.
  // =======================================================================
  addComment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-comment`, payload, this.httpOptions);
  }

  // =======================================================================
  // deleteProject: Sends a request to delete a project identified by its projectId.
  // =======================================================================
  deleteProject(projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-project`, { projectId }, this.httpOptions);
  }

  // =======================================================================
  // updateProject: Updates project details.
  // Expects a payload containing fields like projectId, projectName, description, tasks, deadline, status, etc.
  // =======================================================================
  updateProject(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-project`, payload, this.httpOptions);
  }

  // =======================================================================
  // Chat Endpoints:
  // Methods related to fetching and sending chat messages.
  // =======================================================================

  // getChatMessages: Retrieves chat messages for a conversation identified by conversationId.
  getChatMessages(conversationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-chat-messages`, { conversationId }, this.httpOptions);
  }

  // sendChatMessage: Sends a new chat message.
  // Expects a payload containing senderId, receiverId, and messageText.
  sendChatMessage(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-chat-message`, payload, this.httpOptions);
  }

  // =======================================================================
  // getUserConnections: Retrieves connections for a user by userId.
  // =======================================================================
  getUserConnections(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-connections`, { userId }, this.httpOptions);
  }

  // =======================================================================
  // dismissNotification: Dismisses a specific notification.
  // Expects a payload with userId and notificationId.
  // =======================================================================
  dismissNotification(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dismiss-notification`, payload, this.httpOptions);
  }

  // =======================================================================
  // updateUserSettings: Updates the user's settings such as telephone.
  // Expects a payload containing userId and telephone.
  // =======================================================================
  updateUserSettings(payload: { userId: string, telephone: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user-settings`, payload, this.httpOptions);
  }

  // =======================================================================
  // updateUserPassword: Updates the user's password.
  // Expects a payload with userId and newPassword.
  // =======================================================================
  updateUserPassword(payload: { userId: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user-password`, payload, this.httpOptions);
  }

  // =======================================================================
  // updateUser: Updates user details such as name, telephone, or password.
  // Expects a payload with userId and optionally telephone, newPassword, firstName, and surname.
  // =======================================================================
  updateUser(payload: { userId: string, telephone?: string, newPassword?: string, firstName?: string, surname?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user`, payload, this.httpOptions);
  }

  // =======================================================================
  // markMessagesRead: Marks messages as read for a conversation.
  // Expects a conversationId and recipientId.
  // =======================================================================
  markMessagesRead(conversationId: string, recipientId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-messages-read`, { conversationId, recipientId }, this.httpOptions);
  }

  // =======================================================================
  // respondConnectionRequest: Sends a response (accepted or rejected) to a connection request.
  // Expects a payload containing requestId and action.
  // =======================================================================
  respondConnectionRequest(payload: { requestId: string, action: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond-connection-request`, payload, this.httpOptions);
  }

  // =======================================================================
  // getNotifications: Retrieves notifications for a user.
  // Accepts an optional parameter to exclude a specific notification type.
  // =======================================================================
  getNotifications(userId: string, excludeType?: string): Observable<any> {
    const payload: any = { userId };
    if (excludeType) {
      payload.excludeType = excludeType;
    }
    return this.http.post(`${this.apiUrl}/notifications`, payload, this.httpOptions);
  }

  // =======================================================================
  // login: Verifies user credentials by sending a login request.
  // Expects an object with email and password.
  // =======================================================================
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, this.httpOptions);
  }

  // =======================================================================
  // leaveProject: Allows a user to leave a project.
  // Expects the projectId and userId.
  // =======================================================================
  leaveProject(projectId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave-project`, { projectId, userId }, this.httpOptions);
  }

  // =======================================================================
  // deleteComment: Deletes a comment from a project.
  // Expects a payload with projectId, commentId, and userId.
  // =======================================================================
  deleteComment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-comment`, payload, this.httpOptions);
  }
}
