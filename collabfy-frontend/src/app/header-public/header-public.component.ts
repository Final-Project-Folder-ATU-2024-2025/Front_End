// src/app/header-public/header-public.component.ts
// This header is used on public pages (Login and Create Account).
// It displays only the logo (with no login/create account or logout buttons).
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-public.component.html',
  styleUrls: ['./header-public.component.css'],
})
export class HeaderPublicComponent {}
