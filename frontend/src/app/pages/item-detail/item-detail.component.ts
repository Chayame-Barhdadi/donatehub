import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DonationItemService } from '../../services/donation-item.service';
import { DonationItem } from '../../models/donation-item.model';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css'
})
export class ItemDetailComponent implements OnInit {
  item = signal<DonationItem | null>(null);
  isLoading = signal<boolean>(true);
  comments = signal<any[]>([]);
  newCommentText = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: DonationItemService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadItem(id);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadItem(id: number): void {
    this.isLoading.set(true);
    this.itemService.getItemById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.isLoading.set(false);
        this.loadComments(id);
      },
      error: (err) => {
        console.error('Error loading item', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadComments(id: number): void {
    this.itemService.getComments(id).subscribe({
      next: (data) => this.comments.set(data),
      error: () => this.comments.set([])
    });
  }

  postComment(): void {
    const currentItem = this.item();
    const text = this.newCommentText().trim();
    if (currentItem?.id && text) {
      this.itemService.addComment(currentItem.id, text).subscribe({
        next: (comment) => {
          this.comments.update(c => [...c, comment]);
          this.newCommentText.set('');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    if (status === 'AVAILABLE') return 'Disponible';
    if (status === 'RESERVED') return 'Réservé';
    if (status === 'GIVEN') return 'Donné';
    return status;
  }

  reserveItem(): void {
    const currentItem = this.item();
    if (currentItem?.id) {
      this.itemService.updateItemStatus(currentItem.id, 'RESERVED').subscribe({
        next: () => this.loadItem(currentItem.id!)
      });
    }
  }

  deleteItem(): void {
    const currentItem = this.item();
    if (currentItem?.id && confirm('Voulez-vous vraiment supprimer cet objet ?')) {
      this.itemService.deleteItem(currentItem.id).subscribe({
        next: () => this.router.navigate(['/dashboard'])
      });
    }
  }

  isOwner(): boolean {
    const user = this.authService.currentUser();
    const currentItem = this.item();
    return user?.id === currentItem?.user?.id;
  }

  isAdmin(): boolean {
    return this.authService.currentUser()?.roles?.includes('ADMIN') || false;
  }
}
