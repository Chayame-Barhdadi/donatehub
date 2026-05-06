import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DonSample {
  title: string;
  location: string;
  image: string;
  donor: string;
  condition: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  selectedDon = signal<DonSample | null>(null);
  isMenuOpen = signal<boolean>(false);

  samples: DonSample[] = [
    {
      title: 'Canapé 3 places',
      location: 'Casablanca, Oasis',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
      donor: 'Meryem B.',
      condition: 'Très bon état',
      description: 'Canapé en tissu gris, très confortable. À récupérer au 2ème étage avec ascenseur.'
    },
    {
      title: 'Lot de livres scolaires',
      location: 'Rabat, Agdal',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      donor: 'Karim T.',
      condition: 'Bon état',
      description: 'Livres de mathématiques et physique pour le niveau lycée (1ère et 2ème année BAC).'
    },
    {
      title: 'Vélo enfant rouge',
      location: 'Marrakech, Gueliz',
      image: 'bike.png',
      donor: 'Sanae A.',
      condition: 'Comme neuf',
      description: 'Vélo pour enfant de 5-8 ans, très peu utilisé. Parfait état de marche.'
    }
  ];

  toggleMenu() { this.isMenuOpen.update(v => !v); }

  openModal(don: DonSample) {
    this.selectedDon.set(don);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedDon.set(null);
    document.body.style.overflow = 'auto';
  }
}
