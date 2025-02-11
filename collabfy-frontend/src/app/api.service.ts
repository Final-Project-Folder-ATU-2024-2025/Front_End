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

  // Add this method to fetch the user's projects from your backend.
  getMyProjects(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-projects`, { userId });
  }
}
