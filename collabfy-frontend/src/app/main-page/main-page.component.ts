import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPublicComponent } from '../header-public/header-public.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-main-page',
    imports: [CommonModule, HeaderPublicComponent, FooterComponent, FormsModule, HttpClientModule],
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  // Inject Router in the constructor.
  constructor(private router: Router) {}

  goToCreateAccount(): void {
    this.router.navigate(['/create-account']);
  }
}
