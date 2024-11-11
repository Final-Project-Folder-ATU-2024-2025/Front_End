import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component'; // Import the component

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'create-account-page', component: CreateAccountPageComponent } // Add the route
];
