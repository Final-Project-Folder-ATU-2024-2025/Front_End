import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-user`, userData);
  }

  getMyProjects(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-projects`, { userId });
  }

  // Update task milestones endpoint.
  updateTaskMilestones(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-task-milestones`, payload);
  }

  // NEW: Get Comments method
  getComments(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-comments`, payload);
  }

  // NEW: Add Comment method
  addComment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-comment`, payload);
  }

  // NEW: Delete project endpoint.
  deleteProject(projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-project`, { projectId });
  }

  // NEW: Update project endpoint.
  updateProject(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-project`, payload);
  }
}
