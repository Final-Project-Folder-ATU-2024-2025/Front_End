import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },  // ✅ Loads Home Page by default
  { path: 'create-account', component: CreateAccountPageComponent },  // ✅ Loads Create Account Page
];
