import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface AiChatRequest {
  message: string;
  session_id: string;
}

export interface AiChatResponse {
  response: string;
  suggestions?: string[];
  category?: string;
  city?: string;
  items?: Array<{
    id: number;
    title: string;
    category: string;
    city: string;
    imageUrl: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = '/api/ai';
  private sessionId = Math.random().toString(36).substring(2, 15); // Auto-generate simple session ID

  // Subject pour ouvrir/fermer le chat depuis n'importe où
  public toggleChat$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.apiUrl}/chat`, { message, session_id: this.sessionId });
  }

  triggerChat() {
    this.toggleChat$.next();
  }
}
