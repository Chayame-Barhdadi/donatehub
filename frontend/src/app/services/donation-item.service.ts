import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonationItem } from '../models/donation-item.model';

@Injectable({
  providedIn: 'root'
})
export class DonationItemService {
  private apiUrl = 'http://localhost:8085/api/items';

  constructor(private http: HttpClient) { }

  getAllItems(): Observable<DonationItem[]> {
    return this.http.get<DonationItem[]>(this.apiUrl);
  }

  createItem(item: DonationItem): Observable<DonationItem> {
    // For now, we hardcode a default user (ID 1) as we don't have auth yet
    const itemWithUser = { ...item, user: { id: 1 } };
    return this.http.post<DonationItem>(this.apiUrl, itemWithUser);
  }

  updateItemStatus(id: number, status: string): Observable<DonationItem> {
    return this.http.put<DonationItem>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
