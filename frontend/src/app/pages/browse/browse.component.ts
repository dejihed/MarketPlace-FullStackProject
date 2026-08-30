import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  allProducts: any[] = [];
  filteredProducts: any[] = [];
  favoriteIds: Set<number> = new Set();
  
  searchTerm: string = '';
  selectedCategory: string = '';
  addressFilter: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  filtersOpen: boolean = false;
  isLoggedIn: boolean = false;
  showLoginPopup: boolean = false;

  quickCategories = [
    { key: '', name: 'All', icon: '🏷️' },
    { key: 'PHONES', name: 'Phones', icon: '📱' },
    { key: 'LAPTOPS', name: 'Laptops', icon: '💻' },
    { key: 'BIKES', name: 'Bikes', icon: '🚲' },
    { key: 'BOOKS', name: 'Books', icon: '📚' },
    { key: 'CLOTHES', name: 'Clothes', icon: '👕' },
    { key: 'OTHER', name: 'Other', icon: '🎁' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    this.checkAuth();
    
    // Check for query params (from home page navigation)
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadProducts();
    });

    if (this.isLoggedIn) {
      this.loadFavorites();
    }
  }

  checkAuth() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  loadProducts() {
    this.http.get<any[]>('http://localhost:8080/api/products')
      .subscribe(res => {
        this.allProducts = res;
        this.applyFilters();
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

  applyFilters() {
    let filtered = [...this.allProducts];

    // Search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Address filter
    if (this.addressFilter && this.addressFilter.trim()) {
      const addressLower = this.addressFilter.toLowerCase();
      filtered = filtered.filter(p => 
        p.address.toLowerCase().includes(addressLower)
      );
    }

    // Price filters
    if (this.minPrice !== null && this.minPrice >= 0) {
      filtered = filtered.filter(p => p.price >= this.minPrice!);
    }
    if (this.maxPrice !== null && this.maxPrice >= 0) {
      filtered = filtered.filter(p => p.price <= this.maxPrice!);
    }

    // Always sort by newest (highest ID first)
    filtered = filtered.sort((a, b) => b.id - a.id);

    this.filteredProducts = filtered;
  }

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.addressFilter = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || 
           this.selectedCategory !== '' || 
           this.addressFilter !== '' ||
           this.minPrice !== null ||
           this.maxPrice !== null;
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