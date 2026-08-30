import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.scss']
})
export class MyProductsComponent implements OnInit {

  products: any[] = [];
  editingProduct: any = null;
  editForm: FormGroup;
  updating: boolean = false;

  // Image management
  existingImages: Array<{id: number, url: string}> = [];
  newSelectedFiles: File[] = [];
  newImagePreviews: string[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadMyProducts();
  }

  loadMyProducts() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.get<any[]>('http://localhost:8080/api/products/my', { headers })
      .subscribe({
        next: (res) => {
          this.products = res;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          if (err.status === 401 || err.status === 403) {
            alert('Please login to view your products');
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

  editProduct(product: any) {
    this.editingProduct = product;
    
    // Load existing images with real DB IDs
    this.existingImages = product.images.map((url: string, index: number) => ({
      id: product.imageIds[index],
      url: url
    }));

    // Reset new images
    this.newSelectedFiles = [];
    this.newImagePreviews = [];

    this.editForm.patchValue({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      address: product.address
    });
  }

  closeEditModal() {
    this.editingProduct = null;
    this.existingImages = [];
    this.newSelectedFiles = [];
    this.newImagePreviews = [];
    this.editForm.reset();
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
      if (this.getTotalImages() < 5) {
        this.newSelectedFiles.push(files[i]);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newImagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  removeNewImage(index: number) {
    this.newSelectedFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  getTotalImages(): number {
    return this.existingImages.length + this.newImagePreviews.length;
  }

  updateProduct() {
    if (this.editForm.invalid) return;
    
    if (this.getTotalImages() === 0) {
      alert('Please keep at least one image');
      return;
    }

    this.updating = true;

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const formData = new FormData();
    formData.append('title', this.editForm.value.title);
    formData.append('description', this.editForm.value.description);
    formData.append('price', this.editForm.value.price);
    formData.append('category', this.editForm.value.category);
    formData.append('address', this.editForm.value.address);

    // Add existing image IDs (images to keep)
    // Note: This assumes your backend can identify images by their index
    // You might need to adjust this based on your backend implementation
    this.existingImages.forEach(img => {
      formData.append('existingImages', img.id.toString());
    });

    // Add new images
    this.newSelectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.http.put(
      `http://localhost:8080/api/products/${this.editingProduct.id}/edit`,
      formData,
      { headers }
    ).subscribe({
      next: () => {
        alert('Product updated successfully!');
        this.closeEditModal();
        this.loadMyProducts();
        this.updating = false;
      },
      error: (err) => {
        alert('Failed to update product: ' + (err.error?.message || err.message));
        this.updating = false;
      }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.delete(`http://localhost:8080/api/products/${id}`, { headers })
      .subscribe({
        next: () => {
          alert('Product deleted successfully!');
          this.loadMyProducts();
        },
        error: (err) => {
          alert('Failed to delete product: ' + (err.error?.message || err.message));
        }
      });
  }
}