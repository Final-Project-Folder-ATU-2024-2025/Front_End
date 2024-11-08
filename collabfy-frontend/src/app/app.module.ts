import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ApiService } from './api.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule  // Ensures that HttpClientModule is available in the app
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
