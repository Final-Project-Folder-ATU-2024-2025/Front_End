// src/app/create-project-page/create-project-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-create-project-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './create-project-page.component.html',
  styleUrls: ['./create-project-page.component.css']
})
export class CreateProjectPageComponent {
  // Add project creation logic as needed.
}
