import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8085/auth';
  
  // State using signals
  currentUser = signal<any>(null);
  token = signal<string | null>(localStorage.getItem('token'));

  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((res: any) => this.setSession(res))
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  private setSession(authResult: any): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.token.set(authResult.token);
    this.currentUser.set(authResult.user);
  }

  getToken(): string | null {
    return this.token();
  }
}
