import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  product: any = null;
  selectedImage: string = '';
  isFavorite: boolean = false;
  isLoggedIn: boolean = false;
  showLoginPopup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private location: Location
  ) {}

  ngOnInit() {
    this.checkAuth();
    const id = this.route.snapshot.params['id'];
    this.loadProduct(id);
    
    if (this.isLoggedIn) {
      this.checkIfFavorite(id);
    }
  }

  checkAuth() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  loadProduct(id: number) {
    this.http.get<any>(`http://localhost:8080/api/products/${id}`)
      .subscribe(res => {
        this.product = res;
        this.selectedImage = res.images[0];
      });
  }

  checkIfFavorite(productId: number) {
    const token = localStorage.getItem('token');
    if (!token) return;

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<boolean>(`http://localhost:8080/api/favorites/check/${productId}`, { headers })
      .subscribe({
        next: (isFav) => {
          this.isFavorite = isFav;
        },
        error: (err) => {
          console.error('Error checking favorite status:', err);
        }
      });
  }

  toggleFavorite() {
    // Check if user is logged in
    if (!this.isLoggedIn) {
      this.showLoginPopup = true;
      return;
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    if (this.isFavorite) {
      // Remove from favorites
      this.http.delete(`http://localhost:8080/api/favorites/${this.product.id}`, { headers })
        .subscribe({
          next: () => {
            this.isFavorite = false;
          },
          error: (err) => {
            console.error('Error removing favorite:', err);
          }
        });
    } else {
      // Add to favorites
      this.http.post(`http://localhost:8080/api/favorites/${this.product.id}`, {}, { headers })
        .subscribe({
          next: () => {
            this.isFavorite = true;
          },
          error: (err) => {
            console.error('Error adding favorite:', err);
          }
        });
    }
  }

  getInitials(name: string): string {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'PHONES': '📱',
      'LAPTOPS': '💻',
      'BIKES': '🚲',
      'BOOKS': '📚',
      'CLOTHES': '👕'
    };
    return icons[category] || '🏷️';
  }

  getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'PHONES': 'Phones',
      'LAPTOPS': 'Laptops',
      'BIKES': 'Bikes',
      'BOOKS': 'Books',
      'CLOTHES': 'Clothes'
    };
    return names[category] || category;
  }

  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  goToLogin() {
    this.showLoginPopup = false;
    this.router.navigate(['/login']);
  }

  goBack() {
    this.location.back();
  }
}