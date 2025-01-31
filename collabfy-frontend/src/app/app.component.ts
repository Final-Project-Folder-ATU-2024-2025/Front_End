import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',  // ✅ Ensure this selector is correct
  standalone: true,
  imports: [CommonModule, RouterOutlet], // ✅ Enables routing
  template: `<router-outlet></router-outlet>`, // ✅ Loads components dynamically
})
export class AppComponent {}
