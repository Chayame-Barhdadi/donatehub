import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DonationItemService } from './services/donation-item.service';
import { DonationItem } from './models/donation-item.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('DonateHub');
  items = signal<DonationItem[]>([]);

  constructor(private itemService: DonationItemService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.items.set(data);
      },
      error: (err) => {
        console.error('Error loading items', err);
      }
    });
  }
}
