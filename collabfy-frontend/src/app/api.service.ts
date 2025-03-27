import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  // Setting HTTP options explicitly so that the preflight request carries the Content-Type header
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-user`, userData, this.httpOptions);
  }

  getMyProjects(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-projects`, { userId }, this.httpOptions);
  }

  updateTaskMilestones(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-task-milestones`, payload, this.httpOptions);
  }

  getComments(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-comments`, payload, this.httpOptions);
  }

  addComment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-comment`, payload, this.httpOptions);
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-project`, { projectId }, this.httpOptions);
  }

  updateProject(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-project`, payload, this.httpOptions);
  }

  // Chat endpoints
  getChatMessages(conversationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-chat-messages`, { conversationId }, this.httpOptions);
  }

  sendChatMessage(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-chat-message`, payload, this.httpOptions);
  }

  getUserConnections(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-connections`, { userId }, this.httpOptions);
  }

  dismissNotification(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dismiss-notification`, payload, this.httpOptions);
  }

  updateUserSettings(payload: { userId: string, telephone: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user-settings`, payload, this.httpOptions);
  }

  updateUserPassword(payload: { userId: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user-password`, payload, this.httpOptions);
  }

  updateUser(payload: { userId: string, telephone?: string, newPassword?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-user`, payload, this.httpOptions);
  }

  markMessagesRead(conversationId: string, recipientId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-messages-read`, { conversationId, recipientId }, this.httpOptions);
  }
  
  respondConnectionRequest(payload: { requestId: string, action: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond-connection-request`, payload, this.httpOptions);
  }
}
