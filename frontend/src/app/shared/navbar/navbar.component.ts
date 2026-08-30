import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  userName: string | null = null;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  dropdownOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkAuthentication();
  }

  checkAuthentication(): void {
    const token = localStorage.getItem('token');
    
    if (token) {
      this.isLoggedIn = true;
      // Decode JWT token to get user info
      try {
        const payload = this.decodeToken(token);
        this.userName = payload.sub || payload.name || payload.email || 'User';
        this.isAdmin = payload.role === 'ADMIN' || payload.authorities?.includes('ROLE_ADMIN');
      } catch (error) {
        console.error('Error decoding token:', error);
        this.userName = 'User';
        this.isAdmin = false;
      }
    } else {
      this.isLoggedIn = false;
      this.userName = null;
      this.isAdmin = false;
    }
  }

  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return {};
    }
  }

  getInitials(): string {
    if (!this.userName) return 'U';
    
    const names = this.userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.isLoggedIn = false;
    this.userName = null;
    this.dropdownOpen = false;
    this.router.navigate(['/login']);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.dropdownOpen = false;
    }
  }
}