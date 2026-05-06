import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonationItem } from '../models/donation-item.model';

@Injectable({
  providedIn: 'root'
})
export class DonationItemService {
  private apiUrl = '/api/items';

  constructor(private http: HttpClient) { }

  getAllItems(city?: string, category?: string): Observable<DonationItem[]> {
    let params = '';
    if (city || category) {
      params = '?';
      if (city) params += `city=${city}`;
      if (category) params += (city ? '&' : '') + `category=${category}`;
    }
    return this.http.get<DonationItem[]>(this.apiUrl + params);
  }

  getItemById(id: number): Observable<DonationItem> {
    return this.http.get<DonationItem>(`${this.apiUrl}/${id}`);
  }

  createItem(item: DonationItem): Observable<DonationItem> {
    return this.http.post<DonationItem>(this.apiUrl, item);
  }

  updateItem(id: number, item: DonationItem): Observable<DonationItem> {
    return this.http.put<DonationItem>(`${this.apiUrl}/${id}`, item);
  }

  updateItemStatus(id: number, status: string): Observable<DonationItem> {
    return this.http.put<DonationItem>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComments(itemId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${itemId}/comments`);
  }

  addComment(itemId: number, text: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${itemId}/comments`, { text });
  }

  deleteComment(itemId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}/comments/${commentId}`);
  }

  toggleInterest(itemId: number): Observable<any> {
    return this.http.post<any>(`/api/interests/item/${itemId}`, {});
  }

  getMyInterests(): Observable<DonationItem[]> {
    return this.http.get<DonationItem[]>(`/api/interests/me`);
  }
}
