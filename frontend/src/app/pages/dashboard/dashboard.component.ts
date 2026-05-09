import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationItemService } from '../../services/donation-item.service';
import { DonationItem } from '../../models/donation-item.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService as AppNotificationService } from '../../services/notification.service';
import { AdminService } from '../../services/admin.service';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  moroccanCities = [
    'Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Essaouira',
    'El Jadida','Nador','Kénitra','Safi','Béni Mellal','Errachidia','Laâyoune','Dakhla','Taroudant',
    'Ouarzazate','Al Hoceïma','Ifrane','Chefchaouen','Khouribga','Settat','Taza','Guelmim','Berrechid',
    'Ksar El Kebir','Larache','Sidi Kacem','Sidi Slimane','Taourirt','Jerada','Azrou','Midelt',
    'Tinghir','Zagora','Boujdour','Smara'
  ];

  categories = ['Électronique','Vêtements','Meubles','Livres','Sport','Décoration','Autre'];

  items = signal<DonationItem[]>([]);
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedCity = signal<string>('');
  activeView = signal<string>('dashboard');
  isSidebarOpen = signal<boolean>(false);
  editingItemId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  profileName = signal<string>('');
  profileEmail = signal<string>('');
  profileCity = signal<string>('');
  profileAvatarColor = signal<string>('#059669'); // Default green
  profileSaved = signal<boolean>(false);
  profileError = signal<string>('');

  avatarPalette = [
    '#059669', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', 
    '#06b6d4', '#10b981', '#6366f1', '#a855f7', '#14b8a6', '#f97316'
  ];

  // Draft signals for editing (decoupled from live display)
  draftName = signal<string>('');
  draftEmail = signal<string>('');
  draftCity = signal<string>('');
  draftAvatarColor = signal<string>('#059669');
  showCityDropdown = signal<boolean>(false);
  showPublishCityDropdown = signal<boolean>(false);
  showFilterCityDropdown = signal<boolean>(false);
  showPublishCategoryDropdown = signal<boolean>(false);
  showFilterCategoryDropdown = signal<boolean>(false);

  // Details View signals
  selectedItem = signal<DonationItem | null>(null);
  comments = signal<any[]>([]);
  newCommentText = signal<string>('');
  myInterests = signal<DonationItem[]>([]);
  notifications = signal<any[]>([]);
  unreadNotificationsCount = computed(() => this.notifications().filter(n => !n.read).length);
  showNotificationDropdown = signal<boolean>(false);
  bellWasOpened = signal<boolean>(false);
  shouldBellRing = computed(() => this.unreadNotificationsCount() > 0 && !this.bellWasOpened());
  
  // Image Zoom
  zoomedImage = signal<string | null>(null);

  // City Search/Suggestion signals
  registerCityQuery = signal<string>('');
  publishCityQuery = signal<string>('');
  filterCityQuery = signal<string>('');
  profileCityQuery = signal<string>('');

  filteredCities = computed(() => (query: string) => {
    if (!query) return this.moroccanCities;
    return this.moroccanCities.filter(c => c.toLowerCase().includes(query.toLowerCase()));
  });

  currentPassword = signal<string>('');
  newPassword = signal<string>('');
  passwordSaved = signal<boolean>(false);
  passwordError = signal<string>('');

  showDeleteModal = signal<boolean>(false);
  itemToDeleteId = signal<number | null>(null);
  selectedImageBase64 = signal<string | null>(null);

  filteredItems = computed(() => {
    return this.items().filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(this.searchTerm().toLowerCase())
        || item.description?.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesCategory = this.selectedCategory() === '' || item.category === this.selectedCategory();
      const matchesCity = this.selectedCity() === '' || item.city === this.selectedCity();
      return matchesSearch && matchesCategory && matchesCity;
    }).sort((a, b) => (b.id || 0) - (a.id || 0));
  });

  myItems = computed(() => {
    const userId = this.authService.currentUser()?.id;
    return this.items().filter(item => item.user?.id === userId)
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  });

  // NOUVEAU : Statistiques
  availableCount = computed(() => this.items().filter(i => i.status === 'AVAILABLE').length);
  myPublicationsCount = computed(() => this.myItems().length);
  myReservationsCount = computed(() => this.myItems().filter(i => i.status === 'RESERVED').length);

  // NOUVEAU : Suggestions (les 4 premiers objets disponibles)
  suggestedItems = computed(() => {
    return this.items().filter(i => i.status === 'AVAILABLE').slice(0, 4);
  });

  filterForm: FormGroup;
  itemForm: FormGroup;

  adminUsers = signal<any[]>([]);
  adminItems = signal<any[]>([]);
  adminStats = computed(() => {
    const categories = this.items().reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    return {
      totalUsers: this.adminUsers().length,
      totalItems: this.items().length,
      availableItems: this.items().filter(i => i.status === 'AVAILABLE').length,
      givenItems: this.items().filter(i => i.status === 'GIVEN').length,
      topCategory: Object.entries(categories).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'
    };
  });

  // Admin Management Signals
  adminUserSearch = signal<string>('');
  adminItemSearch = signal<string>('');
  adminUserPage = signal<number>(1);
  adminItemPage = signal<number>(1);
  adminPageSize = 8;

  // Admin Computed: Filtered & Paginated Lists
  filteredAdminUsers = computed(() => {
    return this.adminUsers().filter(u => 
      u.name?.toLowerCase().includes(this.adminUserSearch().toLowerCase()) ||
      u.email?.toLowerCase().includes(this.adminUserSearch().toLowerCase())
    );
  });

  paginatedAdminUsers = computed(() => {
    const start = (this.adminUserPage() - 1) * this.adminPageSize;
    return this.filteredAdminUsers().slice(start, start + this.adminPageSize);
  });

  adminUserTotalPages = computed(() => Math.ceil(this.filteredAdminUsers().length / this.adminPageSize) || 1);

  filteredAdminItems = computed(() => {
    return this.adminItems().filter(i => 
      i.title?.toLowerCase().includes(this.adminItemSearch().toLowerCase()) ||
      i.category?.toLowerCase().includes(this.adminItemSearch().toLowerCase())
    );
  });

  paginatedAdminItems = computed(() => {
    const start = (this.adminItemPage() - 1) * this.adminPageSize;
    return this.filteredAdminItems().slice(start, start + this.adminPageSize);
  });

  adminItemTotalPages = computed(() => Math.ceil(this.filteredAdminItems().length / this.adminPageSize) || 1);

  // Admin Stats Visuals (Pure SVG / CSS Charts)
  statusDistribution = computed(() => {
    const items = this.adminItems();
    const dist = [
      { label: 'Disponible', count: items.filter(i => i.status === 'AVAILABLE').length, color: '#10b981' },
      { label: 'Réservé', count: items.filter(i => i.status === 'RESERVED').length, color: '#f59e0b' },
      { label: 'Donné', count: items.filter(i => i.status === 'GIVEN').length, color: '#64748b' }
    ];
    const max = Math.max(...dist.map(d => d.count), 1);
    return dist.map(d => ({ ...d, percent: (d.count / max) * 100 }));
  });

  categoryDistribution = computed(() => {
    const items = this.adminItems();
    const cats = items.reduce((acc: any, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(cats)
      .map(([label, count]: any) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const max = Math.max(...sorted.map(s => s.count), 1);
    return sorted.map(s => ({ ...s, percent: (s.count / max) * 100 }));
  });

  // Modal for admin
  showAdminConfirmModal = signal<boolean>(false);
  adminModalConfig = signal<{ title: string, message: string, action: () => void } | null>(null);

  constructor(
    private fb: FormBuilder,
    private itemService: DonationItemService,
    public authService: AuthService,
    private userService: UserService,
    private notificationService: AppNotificationService,
    private adminService: AdminService,
    private aiService: AiService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({ search: [''], category: [''], city: [''] });
    this.itemForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      city: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
    this.filterForm.valueChanges.subscribe(vals => {
      this.searchTerm.set(vals.search || '');
      this.selectedCategory.set(vals.category || '');
      // Only update selectedCity if it's an empty string or a valid city from the list
      const city = vals.city || '';
      if (city === '' || this.moroccanCities.includes(city)) {
        this.selectedCity.set(city);
      }
    });
  }

  openAssistant(): void {
    this.aiService.triggerChat();
    this.isSidebarOpen.set(false); // Close sidebar on mobile if open
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Close dropdowns if clicking outside of them
    if (!target.closest('.relative') && !target.closest('.select-wrapper') && !target.closest('.form-group')) {
      this.closeAllDropdowns();
    }
  }

  closeAllDropdowns(): void {
    this.showCityDropdown.set(false);
    this.showPublishCityDropdown.set(false);
    this.showFilterCityDropdown.set(false);
    this.showPublishCategoryDropdown.set(false);
    this.showFilterCategoryDropdown.set(false);
    this.showNotificationDropdown.set(false);
    this.activeStatusDropdown.set(null);
  }

  ngOnInit(): void {
    this.loadItems();
    this.loadMyInterests();
    this.loadNotifications();
    const user = this.authService.currentUser();
    if (user) {
      this.profileName.set(user.name || '');
      this.profileEmail.set(user.email || '');
      this.profileCity.set(user.city || '');
      this.profileAvatarColor.set((user as any).avatarColor || '#059669');
      this.draftName.set(this.profileName());
      this.draftEmail.set(this.profileEmail());
      this.draftCity.set(this.profileCity());
      this.draftAvatarColor.set(this.profileAvatarColor());
    }
  }

  toggleSidebar(): void { this.isSidebarOpen.update(v => !v); }

  setView(view: string): void {
    this.activeView.set(view);
    this.isSidebarOpen.set(false);
    if (view === 'mes-dons') {
      this.itemService.getAllItems().subscribe(data => this.items.set(data));
    } else if (view === 'mes-interets') {
      this.loadMyInterests();
    } else if (view === 'admin') {
      this.loadAdminData();
    }
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.itemService.getAllItems().subscribe({
      next: (data) => { this.items.set(data); this.isLoading.set(false); },
      error: (err) => { console.error(err); this.isLoading.set(false); }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', category: '', city: '' });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    const action = this.editingItemId()
      ? this.itemService.updateItem(this.editingItemId()!, this.itemForm.value)
      : this.itemService.createItem(this.itemForm.value);

    action.subscribe({
      next: () => {
        this.successMessage.set(this.editingItemId() ? 'Modification réussie !' : 'Publication réussie !');
        this.errorMessage.set('');
        
        // On success: refresh items, reset form, and redirect after a short delay
        this.loadItems();
        
        setTimeout(() => {
          this.itemForm.reset({
            title: '',
            category: '',
            city: '',
            description: '',
            imageUrl: ''
          });
          this.editingItemId.set(null);
          this.selectedImageBase64.set(null);
          this.setView('mes-dons');
        }, 1500);
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.errorMessage.set('Erreur lors de la publication. Veuillez réessayer.');
        this.successMessage.set('');
      }
    });
  }

  editItem(item: DonationItem): void {
    this.editingItemId.set(item.id!);
    this.itemForm.patchValue({ title: item.title, category: item.category, city: item.city, description: item.description, imageUrl: item.imageUrl });
    this.selectedImageBase64.set(item.imageUrl || null);
    this.setView('publier');
  }

  changeStatus(id: number | undefined, newStatus: string): void {
    if (!id) return;
    this.itemService.updateItemStatus(id, newStatus).subscribe({
      next: () => this.loadItems(),
      error: (err) => console.error(err)
    });
  }

  deleteItem(id: number | undefined): void {
    if (!id) return;
    this.itemToDeleteId.set(id);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const id = this.itemToDeleteId();
    if (id) {
      this.itemService.deleteItem(id).subscribe({
        next: () => { this.loadItems(); this.cancelDelete(); },
        error: (err) => { console.error(err); this.cancelDelete(); }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.itemToDeleteId.set(null);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { this.errorMessage.set('Image trop lourde (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.selectedImageBase64.set(base64);
      this.itemForm.patchValue({ imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  getStatusLabel(status: string): string {
    if (status === 'AVAILABLE') return 'Disponible';
    if (status === 'RESERVED') return 'Réservé';
    if (status === 'GIVEN') return 'Donné';
    return status;
  }

  selectAvatarColor(color: string): void {
    console.log('Selecting avatar color:', color);
    this.draftAvatarColor.set(color);
    
    // --- INSTANT STANDARDIZATION (Live Sync) ---
    // Update the header avatar and other profile-dependent views immediately
    this.profileAvatarColor.set(color);

    // Update the color in the current items list for all items owned by the user
    // This allows the user to see the change everywhere AS they click
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      const currentItems = this.items();
      const updatedItems = currentItems.map(item => {
        if (item.user && item.user.id === userId) {
          return { ...item, user: { ...item.user, avatarColor: color } };
        }
        return item;
      });
      this.items.set(updatedItems);

      // Also update selected item if open
      const selected = this.selectedItem();
      if (selected && selected.user && selected.user.id === userId) {
        this.selectedItem.set({ ...selected, user: { ...selected.user, avatarColor: color } });
      }

      // Update comments if they are currently visible
      const currentComments = this.comments();
      if (currentComments.length > 0) {
        const updatedComments = currentComments.map(c => {
          if (c.author && c.author.id === userId) {
            return { ...c, author: { ...c.author, avatarColor: color } };
          }
          return c;
        });
        this.comments.set(updatedComments);
      }
    }
  }

  updateProfile(): void {
    this.profileError.set('');
    const updateData = { 
      name: this.draftName(), 
      email: this.draftEmail(), 
      city: this.draftCity(),
      avatarColor: this.draftAvatarColor() 
    };
    this.userService.updateMyProfile(updateData).subscribe({
      next: (updatedUser: any) => {
        // Update local storage and auth state
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.authService.currentUser.set(updatedUser);
        
        // Sync committed signals
        this.profileName.set(updatedUser.name);
        this.profileEmail.set(updatedUser.email);
        this.profileCity.set(updatedUser.city);
        this.profileAvatarColor.set(updatedUser.avatarColor);
        
        // --- STANDARDIZATION : Update local items list ---
        const userId = updatedUser.id;
        const currentItems = this.items();
        const updatedItems = currentItems.map(item => {
          if (item.user && item.user.id === userId) {
            const newUser = { ...item.user, avatarColor: updatedUser.avatarColor, name: updatedUser.name };
            return { ...item, user: newUser };
          }
          return item;
        });
        this.items.set(updatedItems);

        // Update selected item if it's currently open in details
        const selected = this.selectedItem();
        if (selected && selected.user && selected.user.id === userId) {
          const updatedUserObj = { ...selected.user, avatarColor: updatedUser.avatarColor, name: updatedUser.name };
          this.selectedItem.set({ ...selected, user: updatedUserObj });
        }
        
        this.profileSaved.set(true);
        setTimeout(() => this.profileSaved.set(false), 3000);
      },
      error: () => this.profileError.set('Erreur lors de la mise à jour.')
    });
  }

  cancelProfile(): void {
    // Reset drafts back to committed profile values
    this.draftName.set(this.profileName());
    this.draftEmail.set(this.profileEmail());
    this.draftCity.set(this.profileCity());
    this.draftAvatarColor.set(this.profileAvatarColor());
    this.profileError.set('');
    this.profileSaved.set(false);
  }

  changePassword(): void {
    this.passwordError.set('');
    if (!this.currentPassword() || !this.newPassword()) { this.passwordError.set('Veuillez remplir les deux champs.'); return; }
    this.userService.changePassword(this.currentPassword(), this.newPassword()).subscribe({
      next: () => {
        this.passwordSaved.set(true);
        this.currentPassword.set('');
        this.newPassword.set('');
        setTimeout(() => this.passwordSaved.set(false), 3000);
      },
      error: () => this.passwordError.set('Erreur lors du changement de mot de passe.')
    });
  }

  cancelPassword(): void {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.passwordError.set('');
    this.passwordSaved.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // --- New Logic for Item Details & Comments ---

  viewDetails(item: DonationItem): void {
    this.selectedItem.set(item);
    this.setView('details');
    this.loadComments(item.id!);
  }

  loadComments(itemId: number): void {
    this.itemService.getComments(itemId).subscribe({
      next: (data) => this.comments.set(data),
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addComment(): void {
    if (!this.newCommentText().trim() || !this.selectedItem()) return;
    const itemId = this.selectedItem()!.id!;
    this.itemService.addComment(itemId, this.newCommentText()).subscribe({
      next: () => {
        this.newCommentText.set('');
        this.loadComments(itemId);
      },
      error: (err) => console.error('Error adding comment:', err)
    });
  }

  deleteComment(commentId: number): void {
    if (!this.selectedItem()) return;
    const itemId = this.selectedItem()!.id!;
    this.itemService.deleteComment(itemId, commentId).subscribe({
      next: () => this.loadComments(itemId),
      error: (err) => console.error('Error deleting comment:', err)
    });
  }

  replyToComment(comment: any): void {
    const name = comment.author?.name || 'Utilisateur';
    const mention = `@${name} `;
    this.newCommentText.set(mention);
    // On scroll vers le bas pour voir le champ de texte
    const element = document.querySelector('.premium-textarea');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (element as HTMLElement).focus();
    }
  }

  requestItem(): void {
    if (!this.selectedItem()) return;
    const itemId = this.selectedItem()!.id!;
    this.itemService.toggleInterest(itemId).subscribe({
      next: (res: any) => {
        this.successMessage.set(res.message); 
        this.loadMyInterests(); // Refresh interests
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => console.error('Error toggling interest:', err)
    });
  }

  isInterested(itemId: number | undefined): boolean {
    if (!itemId) return false;
    return this.myInterests().some(item => item.id === itemId);
  }

  toggleInterestFromCard(itemId: number | undefined): void {
    if (!itemId) return;
    this.itemService.toggleInterest(itemId).subscribe({
      next: (res: any) => {
        this.loadMyInterests(); // Quietly refresh interests
      },
      error: (err) => console.error('Error toggling interest:', err)
    });
  }

  loadMyInterests(): void {
    this.itemService.getMyInterests().subscribe({
      next: (data) => this.myInterests.set(data),
      error: (err) => console.error('Error loading interests:', err)
    });
  }

  // --- Custom Status Dropdown logic for My Publications ---
  activeStatusDropdown = signal<number | null>(null);
  toggleStatusDropdown(itemId: number | undefined): void {
    if (!itemId) return;
    this.activeStatusDropdown.set(this.activeStatusDropdown() === itemId ? null : itemId);
  }

  isOwner(): boolean {
    const user = this.authService.currentUser();
    const currentItem = this.selectedItem();
    return user?.id === currentItem?.user?.id;
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.roles?.includes('ADMIN');
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  toggleNotifications(): void {
    console.log('Toggle notifications called. Current state:', this.showNotificationDropdown());
    this.showNotificationDropdown.update(v => !v);
  }

  // --- Admin Methods ---
  loadAdminData(): void {
    this.isLoading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.adminUsers.set(data),
      error: (err) => console.error(err)
    });
    this.adminService.getAllItems().subscribe({
      next: (data) => {
        this.adminItems.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  openAdminConfirmModal(title: string, message: string, action: () => void): void {
    this.adminModalConfig.set({ title, message, action });
    this.showAdminConfirmModal.set(true);
  }

  closeAdminModal(): void {
    this.showAdminConfirmModal.set(false);
  }

  confirmAdminAction(): void {
    if (this.adminModalConfig()) {
      this.adminModalConfig()?.action();
      this.closeAdminModal();
    }
  }

  setAdminUserPage(page: number): void {
    if (page >= 1 && page <= this.adminUserTotalPages()) {
      this.adminUserPage.set(page);
    }
  }

  setAdminItemPage(page: number): void {
    if (page >= 1 && page <= this.adminItemTotalPages()) {
      this.adminItemPage.set(page);
    }
  }

  deleteUserAsAdmin(id: number): void {
    this.openAdminConfirmModal(
      'Supprimer l\'utilisateur',
      'Cette action est irréversible. Toutes les données de cet utilisateur seront supprimées.',
      () => this.adminService.deleteUser(id).subscribe(() => this.loadAdminData())
    );
  }

  deleteItemAsAdmin(id: number): void {
    this.openAdminConfirmModal(
      'Supprimer le don',
      'Êtes-vous sûr de vouloir retirer cet objet de la plateforme ?',
      () => this.adminService.deleteItem(id).subscribe(() => this.loadAdminData())
    );
  }

  markNotificationAsRead(notif: any): void {
    if (this.showNotificationDropdown()) {
      this.bellWasOpened.set(true);
      this.showCityDropdown.set(false);
      this.showFilterCityDropdown.set(false);
    }
    console.log('Clicking notification:', notif);
    
    if (!notif.read) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => this.loadNotifications(),
        error: (err) => console.error('Error marking as read:', err)
      });
    }

    if (notif.relatedItemId) {
      const targetId = Number(notif.relatedItemId);
      console.log('Searching for item ID:', targetId);
      
      // Essayer de trouver l'objet déjà chargé localement pour plus de rapidité
      const localItem = [...this.items(), ...this.myInterests()].find(i => i.id === targetId);
      
      if (localItem) {
        console.log('Item found locally:', localItem);
        this.showNotificationDropdown.set(false);
        this.viewDetails(localItem);
      } else {
        // Sinon le charger depuis l'API
        console.log('Item not found locally, fetching from API...');
        this.itemService.getItemById(targetId).subscribe({
          next: (item) => {
            console.log('Item loaded from API:', item);
            this.showNotificationDropdown.set(false);
            this.viewDetails(item);
          },
          error: (err) => {
            console.error('Error loading item for notification:', err);
            this.showNotificationDropdown.set(false);
          }
        });
      }
    } else {
      this.showNotificationDropdown.set(false);
    }
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Error marking all as read:', err)
    });
  }

  // --- Notification UX Helpers ---
  
  get unreadNotifications(): any[] {
    return this.notifications().filter(n => !n.read);
  }

  get readNotifications(): any[] {
    return this.notifications().filter(n => n.read);
  }

  getNotificationActionText(notif: any): string {
    if (notif.type === 'COMMENT') return 'a commenté votre don.';
    if (notif.type === 'INTEREST') return 'est intéressé(e) par votre don.';
    if (notif.message && notif.actor && notif.message.includes(notif.actor.name)) {
      return notif.message.replace(notif.actor.name, '').trim();
    }
    return notif.message || 'a interagi avec vous.';
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} j`;
    
    return date.toLocaleDateString();
  }

  // --- Image Zoom Methods ---
  openZoom(imageUrl: string | undefined, event: Event) {
    if (imageUrl) {
      event.stopPropagation();
      this.zoomedImage.set(imageUrl);
    }
  }

  closeZoom() {
    this.zoomedImage.set(null);
  }
}
