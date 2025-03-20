import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';  // Adjust your API URL
  private jwtTokenKey = 'jwtToken';  // Key for storing JWT in localStorage

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(firstName: string, lastName: string, email: string, password: string, birthdate: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      firstName,
      lastName,
      email,
      password,
      birthdate,
    });
  }


  saveToken(token: string): void {
    localStorage.setItem(this.jwtTokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.jwtTokenKey);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.jwtTokenKey);
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }
}
