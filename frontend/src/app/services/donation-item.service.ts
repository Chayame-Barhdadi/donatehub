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
}
