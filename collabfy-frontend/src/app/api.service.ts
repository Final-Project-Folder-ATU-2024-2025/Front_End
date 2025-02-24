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

  // Fetch the user's projects from the backend.
  getMyProjects(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-projects`, { userId });
  }

  // Update task milestones for a given project and task.
  updateTaskMilestones(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-task-milestones`, payload);
  }
}
