import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss']
})
export class FavoritesComponent implements OnInit {

  favoriteProducts: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/favorites', { headers })
      .subscribe({
        next: (favorites) => {
          this.favoriteProducts = favorites;
        },
        error: (err) => {
          console.error('Error loading favorites:', err);
          if (err.status === 401 || err.status === 403) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'PHONES': '📱',
      'LAPTOPS': '💻',
      'BIKES': '🚲',
      'BOOKS': '📚',
      'CLOTHES': '👕',
      'OTHER': '🏷️'
    };
    return icons[category] || '🏷️';
  }

  viewProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  removeFavorite(productId: number, event: Event) {
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:8080/api/favorites/${productId}`, { headers })
      .subscribe({
        next: () => {
          this.favoriteProducts = this.favoriteProducts.filter(p => p.id !== productId);
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          alert('Failed to remove favorite');
        }
      });
  }
}