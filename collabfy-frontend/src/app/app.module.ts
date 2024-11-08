import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { ApiService } from './api.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [ApiService],
})
export class AppModule { }