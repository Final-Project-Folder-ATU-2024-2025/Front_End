import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-kanban-board-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, HttpClientModule],
  templateUrl: './kanban-board-page.component.html',
  styleUrls: ['./kanban-board-page.component.css']
})
export class KanbanBoardPageComponent implements OnInit {
  projects: any[] = [];
  selectedProjectId: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.apiService.getMyProjects(uid).subscribe({
        next: (response: any) => {
          if (response.projects) {
            this.projects = response.projects;
          } else {
            console.error("No projects found in response:", response);
          }
        },
        error: (error: any) => {
          console.error("Error retrieving projects", error);
        }
      });
    } else {
      console.error("No UID found in localStorage.");
    }
  }

  onProjectChange(event: any): void {
    this.selectedProjectId = event.target.value;
    console.log("Selected project:", this.selectedProjectId);
  }
}
