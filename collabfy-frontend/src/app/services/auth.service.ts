// ============================================================
// auth.service.ts
// ------------------------------------------------------------
// This service handles authentication related API calls.
// Currently, it includes a method to create a new user by
// sending user data to the Flask backend.
// ============================================================

import { Injectable } from '@angular/core';                      // Core Angular functionality for dependency injection.
import { HttpClient, HttpHeaders } from '@angular/common/http';      // HTTP client for making API calls, and HttpHeaders for setting headers.
import { Observable } from 'rxjs';                                   // Observable type for async operations.

@Injectable({
  providedIn: 'root'  // This makes the service available throughout the app.
})
export class AuthService {
  // Define the API URL for creating a user. Adjust this URL if your backend endpoint changes.
  private apiUrl = 'http://127.0.0.1:5000/api/create-user'; 

  // Inject the HttpClient service into the constructor.
  constructor(private http: HttpClient) {}

  /**
   * createUser: Sends a POST request to the backend to create a new user.
   * 
   * @param userData - The user data payload (e.g., firstName, surname, email, password, etc.).
   * @returns An Observable that will emit the backend's response.
   */
  createUser(userData: any): Observable<any> {
    // Create HTTP headers with Content-Type set to JSON.
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Make a POST request to the backend endpoint with the user data and headers.
    return this.http.post<any>(this.apiUrl, userData, { headers });
  }
}
