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

  // Get chat messages for a given conversation ID.
  getChatMessages(conversationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-chat-messages`, { conversationId }, this.httpOptions);
  }

  // Send a chat message.
  sendChatMessage(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-chat-message`, payload, this.httpOptions);
  }

  // Get user connections for a given user.
  getUserConnections(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-connections`, { userId }, this.httpOptions);
  }

  // New: Dismiss notification endpoint
  dismissNotification(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dismiss-notification`, payload, this.httpOptions);
  }
}
