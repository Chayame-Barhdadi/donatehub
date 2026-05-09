import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  updateMyProfile(data: { name?: string; email?: string; city?: string; avatarColor?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me/password`, { currentPassword, newPassword });
  }
}
