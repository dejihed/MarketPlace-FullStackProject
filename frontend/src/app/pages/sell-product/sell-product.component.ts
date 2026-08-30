import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-sell-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './sell-product.component.html',
  styleUrls: ['./sell-product.component.scss']
})
export class SellProductComponent {

  productForm: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  uploading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
      if (this.selectedFiles.length < 5) {
        this.selectedFiles.push(files[i]);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit() {
    if (this.productForm.invalid || this.selectedFiles.length === 0) {
      alert('Please fill all fields and upload at least one image');
      return;
    }

    this.uploading = true;

    const formData = new FormData();
    formData.append('title', this.productForm.value.title);
    formData.append('description', this.productForm.value.description);
    formData.append('price', this.productForm.value.price);
    formData.append('category', this.productForm.value.category);
    formData.append('address', this.productForm.value.address);

    // Append all images
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.post('http://localhost:8080/api/products', formData, { headers })
      .subscribe({
        next: (res) => {
          alert('Product listed successfully!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Failed to create product: ' + (err.error?.message || err.message));
          this.uploading = false;
        }
      });
  }
}