import { Component, signal, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiService } from '../../services/ai.service';

export interface Message {
  text: string;
  sender: 'user' | 'ai';
  time: Date;
  items?: any[];
  isMarkdown?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent implements AfterViewChecked {
  isOpen = signal(false);
  isMiniFaqOpen = signal(false);
  isTyping = signal(false);
  message = signal('');
  currentRoute = '';
  private shouldScroll = false;

  messages = signal<Message[]>([
    {
      text: 'Bonjour 👋 Comment puis-je vous aider sur DonateHub ?',
      sender: 'ai',
      time: new Date()
    }
  ]);

  // Quick chips — intent-driven
  quickChips = [
    { label: '🔍 Chercher un objet', value: 'Je cherche un objet' },
    { label: '📦 Publier un don', value: 'Comment publier un objet ?' },
    { label: '📋 Catégories', value: 'Quelles catégories sont disponibles ?' },
    { label: '❓ Comment ça marche', value: "Comment ça marche ?" },
  ];

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('inputRef') private inputRef!: ElementRef;

  // Drag state
  dragPosition = signal({ x: 0, y: 0 });
  private isDragging = false;
  private hasDragged = false;
  private startPosition = { x: 0, y: 0 };
  private initialOffset = { x: 0, y: 0 };

  constructor(
    private aiService: AiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.isOpen.set(false);
      this.isMiniFaqOpen.set(false);
    });

    this.aiService.toggleChat$.subscribe(() => {
      this.isOpen.set(true);
      this.shouldScroll = true;
    });
  }

  get viewMode(): 'FULL' | 'HIDDEN' {
    const url = this.currentRoute;
    if (!url || url === '/' || url === '/home' || url === '/landing'
        || url.includes('/login') || url.includes('/register')) {
      return 'HIDDEN';
    }
    return 'FULL';
  }

  get showChips(): boolean {
    return this.messages().length <= 1 && !this.isTyping();
  }

  // ─── Drag ───────────────────────────────────────
  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.hasDragged = false;
    const cx = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const cy = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.startPosition = { x: cx, y: cy };
    this.initialOffset = { ...this.dragPosition() };
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('touchmove', this.onDragMove, { passive: false });
    document.addEventListener('mouseup', this.onDragEnd);
    document.addEventListener('touchend', this.onDragEnd);
  }

  onDragMove = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;
    const cx = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const cy = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    const dx = cx - this.startPosition.x;
    const dy = cy - this.startPosition.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasDragged = true;
    this.dragPosition.set({ x: this.initialOffset.x + dx, y: this.initialOffset.y + dy });
    if (this.hasDragged && event.cancelable) event.preventDefault();
  };

  onDragEnd = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('touchmove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('touchend', this.onDragEnd);
  };

  toggleChat() {
    if (!this.hasDragged) {
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        this.shouldScroll = true;
        setTimeout(() => this.inputRef?.nativeElement?.focus(), 200);
      }
    }
    setTimeout(() => this.hasDragged = false, 100);
  }

  toggleMiniFaq() {
    this.isMiniFaqOpen.update(v => !v);
  }

  sendChip(value: string) {
    this.message.set(value);
    this.sendMessage();
  }

  sendMessage() {
    const text = this.message().trim();
    if (!text || this.isTyping()) return;

    this.messages.update(m => [...m, { text, sender: 'user', time: new Date() }]);
    this.message.set('');
    this.isTyping.set(true);
    this.shouldScroll = true;

    this.aiService.sendMessage(text).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        this.messages.update(m => [...m, {
          text: res.response,
          sender: 'ai',
          time: new Date(),
          items: res.items,
          isMarkdown: true
        }]);
        this.shouldScroll = true;
      },
      error: () => {
        this.isTyping.set(false);
        this.messages.update(m => [...m, {
          text: 'Service temporairement indisponible. Réessayez.',
          sender: 'ai',
          time: new Date()
        }]);
        this.shouldScroll = true;
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  /** Convertit **gras** basique en HTML */
  renderMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
