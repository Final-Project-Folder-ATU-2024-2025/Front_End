import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms'; // 🟢 FIXED FORM MODULE
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


export const appConfig = {
  providers: [
    provideHttpClient(),
    provideRouter([]), // 🟢 Add routes when needed
    provideAnimations(),
    importProvidersFrom(ReactiveFormsModule), // 🟢 Use correct method for forms
    importProvidersFrom(HttpClientModule, ReactiveFormsModule), // 🟢 Ensures imports
  ],
};
