import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent {

  categories = [
    {
      key: 'PHONES',
      name: 'Phones',
      icon: '📱',
      description: 'Smartphones, tablets, and accessories'
    },
    {
      key: 'LAPTOPS',
      name: 'Laptops',
      icon: '💻',
      description: 'Laptops, computers, and peripherals'
    },
    {
      key: 'BIKES',
      name: 'Bikes',
      icon: '🚲',
      description: 'Bicycles, scooters, and accessories'
    },
    {
      key: 'BOOKS',
      name: 'Books',
      icon: '📚',
      description: 'Textbooks, novels, and study materials'
    },
    {
      key: 'CLOTHES',
      name: 'Clothes',
      icon: '👕',
      description: 'Clothing, shoes, and fashion items'
    },
    {
      key: 'OTHER',
      name: 'Other',
      icon: '🏷️',
      description: 'Everything else you need'
    }
  ];

  constructor(private router: Router) {}

  navigateToCategory(categoryKey: string): void {
    this.router.navigate(['/'], { 
      queryParams: { category: categoryKey }
    });
  }
}