import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, HeaderPublicComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

}
