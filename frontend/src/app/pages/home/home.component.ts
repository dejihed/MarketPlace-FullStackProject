import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  latestProducts: any[] = [];
  popularProducts: any[] = [];
  favoriteIds: Set<number> = new Set();
  isLoggedIn: boolean = false;
  showLoginPopup: boolean = false;
  searchTerm: string = '';

  categories = [
    { 
      key: 'PHONES', 
      name: 'Phones', 
      icon: '📱',
      description: 'Latest smartphones and accessories',
      color: '#667eea'
    },
    { 
      key: 'LAPTOPS', 
      name: 'Laptops', 
      icon: '💻',
      description: 'Computers and tech equipment',
      color: '#764ba2'
    },
    { 
      key: 'BIKES', 
      name: 'Bikes', 
      icon: '🚲',
      description: 'Bicycles and cycling gear',
      color: '#f093fb'
    },
    { 
      key: 'BOOKS', 
      name: 'Books', 
      icon: '📚',
      description: 'Textbooks and study materials',
      color: '#4facfe'
    },
    { 
      key: 'CLOTHES', 
      name: 'Clothes', 
      icon: '👕',
      description: 'Fashion and accessories',
      color: '#43e97b'
    },
    { 
      key: 'OTHER', 
      name: 'Other', 
      icon: '🏷️',
      description: 'Everything else',
      color: '#fa709a'
    }
  ];

  stats = {
    totalProducts: 0,
    totalUsers: 0,
    categories: 6
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    this.checkAuth();
    this.loadLatestProducts();
    this.loadStats();
    
    if (this.isLoggedIn) {
      this.loadFavorites();
    }
  }

  checkAuth() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  loadLatestProducts() {
    this.http.get<any[]>('http://localhost:8080/api/products')
      .subscribe(res => {
        // Get latest 8 products (newest first)
        this.latestProducts = res.slice(0, 8).reverse();
        
        // Get popular products (simulated - you can add actual logic later)
        this.popularProducts = res.slice(8, 12).reverse();
      });
  }

  loadStats() {
    this.http.get<any[]>('http://localhost:8080/api/products')
      .subscribe(res => {
        this.stats.totalProducts = res.length;
      });
  }

  loadFavorites() {
    const token = localStorage.getItem('token');
    if (!token) return;

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/favorites', { headers })
      .subscribe({
        next: (favorites) => {
          this.favoriteIds = new Set(favorites.map(f => f.id));
        },
        error: (err) => {
          console.error('Error loading favorites:', err);
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

  browseCategory(categoryKey: string) {
    this.router.navigate(['/browse'], { queryParams: { category: categoryKey } });
  }

  browseAll() {
    this.router.navigate(['/browse']);
  }

  searchProducts() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/browse'], { queryParams: { search: this.searchTerm } });
    } else {
      this.router.navigate(['/browse']);
    }
  }

  toggleFavorite(productId: number, event: Event) {
    event.stopPropagation();
    
    if (!this.isLoggedIn) {
      this.showLoginPopup = true;
      return;
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    if (this.isFavorite(productId)) {
      this.http.delete(`http://localhost:8080/api/favorites/${productId}`, { headers })
        .subscribe({
          next: () => {
            this.favoriteIds.delete(productId);
          },
          error: (err) => {
            console.error('Error removing favorite:', err);
          }
        });
    } else {
      this.http.post(`http://localhost:8080/api/favorites/${productId}`, {}, { headers })
        .subscribe({
          next: () => {
            this.favoriteIds.add(productId);
          },
          error: (err) => {
            console.error('Error adding favorite:', err);
          }
        });
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.has(productId);
  }

  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  goToLogin() {
    this.showLoginPopup = false;
    this.router.navigate(['/login']);
  }
}