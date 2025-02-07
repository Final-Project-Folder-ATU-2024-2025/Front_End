// app.routes.ts
// This file defines the routes for your Angular application.
import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component';
import { LoginPageComponent } from './login-page/login-page.component';  // Import the Login page component
import { CreateProjectPageComponent } from './create-project-page/create-project-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'create-account', component: CreateAccountPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'create-project-page', component: CreateProjectPageComponent }  // New Login route
];
