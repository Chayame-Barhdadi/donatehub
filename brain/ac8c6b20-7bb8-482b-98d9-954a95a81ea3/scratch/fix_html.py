import os

file_path = r'c:\Users\Lenovo\Desktop\DonateHub\frontend\src\app\pages\dashboard\dashboard.component.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The details switch case starts with line 690 in original view (1-indexed)
# or somewhere around there.
# I'll look for the start and end markers.

start_index = -1
for i, line in enumerate(lines):
    if "*ngSwitchCase=\"'details'\"" in line:
        start_index = i
        break

if start_index == -1:
    print("Could not find start index")
    exit(1)

# The switch case ends before the ng-container closing tag
end_index = -1
for i in range(start_index, len(lines)):
    if "</ng-container>" in lines[i]:
        end_index = i
        break

if end_index == -1:
    print("Could not find end index")
    exit(1)

new_details_content = """          <div *ngSwitchCase="'details'" class="details-container">
            <!-- Navigation Retour -->
            <div class="back-nav" (click)="setView('dashboard')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Retour à l'exploration</span>
            </div>

            <div class="premium-grid">
              <!-- Galerie -->
              <div class="detail-gallery">
                <div class="main-image-container">
                  <img *ngIf="selectedItem()?.imageUrl" [src]="selectedItem()?.imageUrl" alt="Objet">
                  <div *ngIf="!selectedItem()?.imageUrl" class="image-placeholder-premium">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p>Aucune image disponible</p>
                  </div>
                </div>
              </div>

              <!-- Infos -->
              <div class="detail-info">
                <div class="info-header">
                  <div class="badge-row">
                    <span class="premium-badge badge-cat">{{ selectedItem()?.category }}</span>
                    <div class="badge-status-premium">
                      <span class="status-dot" [ngClass]="{
                        'dot-available': selectedItem()?.status === 'AVAILABLE',
                        'dot-reserved': selectedItem()?.status === 'RESERVED',
                        'dot-given': selectedItem()?.status === 'GIVEN'
                      }"></span>
                      {{ getStatusLabel(selectedItem()?.status || '') }}
                    </div>
                  </div>
                  <h1 class="item-main-title">{{ selectedItem()?.title }}</h1>
                  <div class="location-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{{ selectedItem()?.city }}, Maroc</span>
                  </div>
                </div>

                <div class="premium-action-card">
                  <div class="donor-profile-minimal">
                    <div class="donor-avatar-premium">
                      {{ selectedItem()?.user?.name?.charAt(0) }}
                    </div>
                    <div class="donor-meta">
                      <h4>{{ selectedItem()?.user?.name }}</h4>
                      <p>Donneur vérifié sur DonateHub</p>
                    </div>
                  </div>
                  
                  <button class="btn-request-premium" 
                          (click)="requestItem()" 
                          [disabled]="selectedItem()?.status !== 'AVAILABLE'">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Je suis intéressé(e)
                  </button>
                </div>

                <div class="section-container">
                  <div class="section-label">
                    <span>Description de l'objet</span>
                  </div>
                  <p class="premium-desc-text">{{ selectedItem()?.description }}</p>
                </div>

                <!-- Commentaires -->
                <div class="premium-comments-card">
                  <div class="comments-header-row">
                    <h3 class="section-title">Commentaires</h3>
                    <span class="comments-count-pill">{{ comments().length }}</span>
                  </div>

                  <div class="comment-thread">
                    <div *ngIf="comments().length === 0" class="empty-comments-premium">
                      <span class="empty-icon-animated">💬</span>
                      <h4>Soyez le premier à commenter</h4>
                      <p>Posez une question sur l'objet ou remerciez le donneur.</p>
                    </div>

                    <div *ngFor="let comment of comments(); let i = index" class="comment-card-premium">
                      <div class="user-avatar-comment" [ngClass]="'avatar-bg-' + ((i % 6) + 1)">
                        {{ comment.user?.name?.charAt(0) || 'U' }}
                      </div>
                      <div class="comment-body-premium">
                        <div class="comment-user-row">
                          <h5>{{ comment.user?.name || 'Utilisateur' }}</h5>
                          <span class="comment-time">{{ comment.createdAt | date:'dd MMM, HH:mm' }}</span>
                        </div>
                        <p class="comment-message">{{ comment.text }}</p>
                        <div class="comment-actions-row">
                          <button class="comment-btn-minimal">Répondre</button>
                          <button class="comment-btn-minimal danger" *ngIf="isAdmin() || isOwner()">Supprimer</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="comment-input-premium">
                    <textarea class="premium-textarea" 
                              placeholder="Écrivez votre message ici..." 
                              [value]="newCommentText()" 
                              (input)="newCommentText.set($any($event.target).value)"></textarea>
                    <div style="overflow: hidden;">
                      <button class="btn-send-premium" 
                              (click)="addComment()" 
                              [disabled]="!newCommentText().trim()">
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
"""

final_lines = lines[:start_index] + [new_details_content + "\n"] + lines[end_index:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("Successfully updated the file.")
