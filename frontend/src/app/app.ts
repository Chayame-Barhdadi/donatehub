import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationItemService } from './services/donation-item.service';
import { DonationItem } from './models/donation-item.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('DonateHub');
  items = signal<DonationItem[]>([]);
  itemForm: FormGroup;

  constructor(
    private itemService: DonationItemService,
    private fb: FormBuilder
  ) {
    this.itemForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      city: ['', Validators.required]
    });
  }

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

  onSubmit(): void {
    if (this.itemForm.valid) {
      const newItem: DonationItem = this.itemForm.value;
      this.itemService.createItem(newItem).subscribe({
        next: () => {
          this.loadItems();
          this.itemForm.reset();
        },
        error: (err) => {
          console.error('Error creating item', err);
        }
      });
    }
  }

  changeStatus(id: number | undefined, currentStatus: string): void {
    if (!id) return;

    let nextStatus = 'AVAILABLE';
    if (currentStatus === 'AVAILABLE') nextStatus = 'RESERVED';
    else if (currentStatus === 'RESERVED') nextStatus = 'GIVEN';
    else if (currentStatus === 'GIVEN') nextStatus = 'AVAILABLE';

    this.itemService.updateItemStatus(id, nextStatus).subscribe({
      next: () => {
        this.loadItems();
      },
      error: (err) => {
        console.error('Error updating status', err);
      }
    });
  }

  deleteItem(id: number | undefined): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet objet ?')) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.loadItems();
        },
        error: (err) => {
          console.error('Error deleting item', err);
        }
      });
    }
  }
}
