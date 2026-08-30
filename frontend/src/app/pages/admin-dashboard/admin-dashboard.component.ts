import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  stats: any = null;
  users: any[] = [];
  products: any[] = [];
  activeTab: string = 'users';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAdmin();
  }

  checkAdmin() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<boolean>('http://localhost:8080/api/admin/check', { headers })
      .subscribe({
        next: (isAdmin) => {
          if (isAdmin) {
            this.loadStats();
            this.loadUsers();
            this.loadProducts();
          } else {
            alert('Access denied. Admin only.');
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          console.error('Error checking admin:', err);
          this.router.navigate(['/login']);
        }
      });
  }

  loadStats() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:8080/api/admin/stats', { headers })
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (err) => {
          console.error('Error loading stats:', err);
        }
      });
  }

  loadUsers() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/admin/users', { headers })
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (err) => {
          console.error('Error loading users:', err);
        }
      });
  }

  loadProducts() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/admin/products', { headers })
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: (err) => {
          console.error('Error loading products:', err);
        }
      });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their products.')) {
      return;
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:8080/api/admin/users/${userId}`, { headers })
      .subscribe({
        next: () => {
          alert('User deleted successfully');
          this.loadUsers();
          this.loadStats();
          this.loadProducts();
        },
        error: (err) => {
          alert('Failed to delete user: ' + (err.error?.message || err.message));
        }
      });
  }

  deleteProduct(productId: number) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:8080/api/admin/products/${productId}`, { headers })
      .subscribe({
        next: () => {
          alert('Product deleted successfully');
          this.loadProducts();
          this.loadStats();
        },
        error: (err) => {
          alert('Failed to delete product: ' + (err.error?.message || err.message));
        }
      });
  }

  viewProduct(id: number) {
    this.router.navigate(['/product', id]);
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

  getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'PHONES': 'Phones',
      'LAPTOPS': 'Laptops',
      'BIKES': 'Bikes',
      'BOOKS': 'Books',
      'CLOTHES': 'Clothes',
      'OTHER': 'Other'
    };
    return names[category] || category;
  }

  getCategoryArray(): Array<{category: string, count: number}> {
    if (!this.stats?.categoryBreakdown) return [];
    
    return Object.entries(this.stats.categoryBreakdown).map(([category, count]) => ({
      category,
      count: count as number
    }));
  }
}