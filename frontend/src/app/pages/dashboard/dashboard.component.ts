import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationItemService } from '../../services/donation-item.service';
import { DonationItem } from '../../models/donation-item.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Moroccan Cities
  moroccanCities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 
    'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'
  ];

  // State signals
  items = signal<DonationItem[]>([]);
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedCity = signal<string>('');

  // Derived signals (Computed)
  filteredItems = computed(() => {
    return this.items().filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesCategory = this.selectedCategory() === '' || item.category === this.selectedCategory();
      const matchesCity = this.selectedCity() === '' || item.city === this.selectedCity();
      return matchesSearch && matchesCategory && matchesCity;
    });
  });

  categories = computed(() => [...new Set(this.items().map(item => item.category))]);

  // Forms
  itemForm: FormGroup;
  filterForm: FormGroup;

  constructor(
    private itemService: DonationItemService,
    public authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      city: ['', Validators.required]
    });

    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      city: ['']
    });

    this.filterForm.valueChanges.subscribe(vals => {
      this.searchTerm.set(vals.search || '');
      this.selectedCategory.set(vals.category || '');
      this.selectedCity.set(vals.city || '');
    });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (data) => this.items.set(data),
      error: (err) => console.error('Error loading items', err)
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
        error: (err) => console.error('Error creating item', err)
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
      next: () => this.loadItems(),
      error: (err) => console.error('Error updating status', err)
    });
  }

  deleteItem(id: number | undefined): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet objet ?')) {
      this.itemService.deleteItem(id).subscribe({
        next: () => this.loadItems(),
        error: (err) => console.error('Error deleting item', err)
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
