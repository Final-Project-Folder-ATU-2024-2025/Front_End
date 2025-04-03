// =======================================================================
// app.module.ts
// -----------------------------------------------------------------------
// This module is the root module that bootstraps the Angular application.
// It imports essential modules needed for the app to run in the browser,
// perform HTTP requests, and work with reactive forms. It also provides
// the ApiService for backend communication throughout the app.
// =======================================================================

import { NgModule } from '@angular/core'; // Core Angular functionality for creating modules
import { BrowserModule } from '@angular/platform-browser'; // Required to run the app in a browser environment
import { HttpClientModule } from '@angular/common/http'; // Provides HttpClient for making HTTP requests
import { ReactiveFormsModule } from '@angular/forms'; // Supports building reactive forms for user input

import { ApiService } from './api.service'; // Custom service to handle API calls to the backend

@NgModule({
  imports: [
    BrowserModule,        // Provides services that are essential to launch and run a browser app
    HttpClientModule,     // Enables making HTTP calls to external APIs
    ReactiveFormsModule   // Provides reactive form support for managing form controls and validations
  ],
  providers: [ApiService], // Registers the ApiService so it can be injected into components/services throughout the app
})
export class AppModule { }
