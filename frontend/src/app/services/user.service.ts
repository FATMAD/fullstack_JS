import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';  // Update to your backend API

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUsers(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();

    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  deleteUser(userId: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();

    return this.http.delete<void>(`${this.apiUrl}/${userId}`, { headers });
  }

  createUser(user: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();

    return this.http.post<any>(this.apiUrl, user, { headers });
  }

  updateUser(userId: string, user: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/${userId}`, user, { headers });
  }
}
