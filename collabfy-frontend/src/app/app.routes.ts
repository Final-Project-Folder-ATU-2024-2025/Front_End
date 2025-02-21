import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { CreateProjectPageComponent } from './create-project-page/create-project-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MyProjectsPageComponent } from './my-projects-page/my-projects-page.component';
import { KanbanBoardPageComponent } from './kanban-board-page/kanban-board-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },  
  { path: 'home-page', component: HomePageComponent },
  { path: 'create-account', component: CreateAccountPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'create-project-page', component: CreateProjectPageComponent },
  { path: 'my-projects-page', component: MyProjectsPageComponent },
  { path: 'kanban-board-page', component: KanbanBoardPageComponent }
];
