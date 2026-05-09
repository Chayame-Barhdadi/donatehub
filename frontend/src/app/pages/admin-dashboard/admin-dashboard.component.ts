import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  users = signal<any[]>([]);
  items = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  // Search signals
  userSearch = signal<string>('');
  itemSearch = signal<string>('');

  // Pagination
  userPage = signal<number>(1);
  itemPage = signal<number>(1);
  readonly pageSize = 8;

  // Modal signals
  showConfirmModal = signal<boolean>(false);
  modalConfig = signal<{ title: string, message: string, action: () => void } | null>(null);

  // ─── Stats ────────────────────────────────
  stats = computed(() => {
    const categories = this.items().reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers: this.users().length,
      totalItems: this.items().length,
      availableItems: this.items().filter(i => i.status === 'AVAILABLE').length,
      reservedItems: this.items().filter(i => i.status === 'RESERVED').length,
      givenItems: this.items().filter(i => i.status === 'GIVEN').length,
      topCategory: Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A',
      categoryData: Object.entries(categories)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]: any) => ({ label, count }))
    };
  });

  // Bar chart max for normalization
  chartMax = computed(() => {
    const data = this.stats().categoryData;
    return data.length ? Math.max(...data.map((d: any) => d.count)) : 1;
  });

  // Status chart data
  statusChart = computed(() => [
    { label: 'Disponible', count: this.stats().availableItems, color: '#10B981' },
    { label: 'Réservé',    count: this.stats().reservedItems,  color: '#F59E0B' },
    { label: 'Donné',      count: this.stats().givenItems,     color: '#6366F1' },
  ]);

  statusChartMax = computed(() => {
    const vals = this.statusChart().map(d => d.count);
    return vals.length ? Math.max(...vals, 1) : 1;
  });

  // ─── Filtered + paginated users ───────────
  filteredUsers = computed(() => {
    const q = this.userSearch().toLowerCase();
    return this.users().filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  });

  paginatedUsers = computed(() => {
    const start = (this.userPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  userTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize))
  );

  // ─── Filtered + paginated items ───────────
  filteredItems = computed(() => {
    const q = this.itemSearch().toLowerCase();
    return this.items().filter(i =>
      i.title?.toLowerCase().includes(q) ||
      i.user?.name?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q)
    );
  });

  paginatedItems = computed(() => {
    const start = (this.itemPage() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  itemTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize))
  );

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error(err)
    });
    this.adminService.getAllItems().subscribe({
      next: (data) => { this.items.set(data); this.isLoading.set(false); },
      error: (err) => { console.error(err); this.isLoading.set(false); }
    });
  }

  setUserSearch(val: string) { this.userSearch.set(val); this.userPage.set(1); }
  setItemSearch(val: string) { this.itemSearch.set(val); this.itemPage.set(1); }

  prevUserPage()  { if (this.userPage() > 1) this.userPage.update(p => p - 1); }
  nextUserPage()  { if (this.userPage() < this.userTotalPages()) this.userPage.update(p => p + 1); }
  prevItemPage()  { if (this.itemPage() > 1) this.itemPage.update(p => p - 1); }
  nextItemPage()  { if (this.itemPage() < this.itemTotalPages()) this.itemPage.update(p => p + 1); }

  barWidth(count: number, max: number): number {
    return max ? Math.round((count / max) * 100) : 0;
  }

  openConfirmModal(title: string, message: string, action: () => void): void {
    this.modalConfig.set({ title, message, action });
    this.showConfirmModal.set(true);
  }

  closeModal(): void { this.showConfirmModal.set(false); }

  confirmAction(): void {
    if (this.modalConfig()) {
      this.modalConfig()?.action();
      this.closeModal();
    }
  }

  deleteUser(id: number): void {
    this.openConfirmModal(
      'Supprimer l\'utilisateur',
      'Cette action est irréversible. Toutes les données de cet utilisateur seront supprimées.',
      () => this.adminService.deleteUser(id).subscribe(() => this.loadData())
    );
  }

  deleteItem(id: number): void {
    this.openConfirmModal(
      'Supprimer le don',
      'Êtes-vous sûr de vouloir retirer cet objet de la plateforme ?',
      () => this.adminService.deleteItem(id).subscribe(() => this.loadData())
    );
  }
}
