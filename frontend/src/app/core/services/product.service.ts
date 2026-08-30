import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  images: string[];
  seller?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/products';

  // GET all products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  // GET single product by id
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  // CREATE product with FormData (images + fields)
  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, formData);
  }

  // UPDATE product with FormData (existingImages + new images + fields)
  updateProduct(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}/edit`, formData);
  }

  // DELETE product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
