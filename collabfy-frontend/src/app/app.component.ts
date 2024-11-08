import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
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
