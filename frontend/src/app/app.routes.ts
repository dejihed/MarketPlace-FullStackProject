import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { SellProductComponent } from './pages/sell-product/sell-product.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { FavoritesComponent } from './pages/favourites/favourites.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  
  // Protected routes (user should be logged in)
  { path: 'sell', component: SellProductComponent },
  { path: 'my-products', component: MyProductsComponent },
  { path: 'favorites', component: FavoritesComponent },
  
  // Admin route
  { path: 'admin', component: AdminDashboardComponent },
  
  // Redirect unknown routes to home
  { path: '**', redirectTo: '' }
];