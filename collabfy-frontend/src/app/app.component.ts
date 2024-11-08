import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <h1>Task List</h1>
    <ul>
      <li *ngFor="let task of tasks">{{ task.title }}: {{ task.description }}</li>
    </ul>
  `,
})
export class AppComponent implements OnInit {
  tasks: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTasks().subscribe((data) => {
      this.tasks = data;
    });
  }
}