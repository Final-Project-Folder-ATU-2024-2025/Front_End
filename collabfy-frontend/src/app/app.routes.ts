// =======================================================================
// app.routes.ts
// -----------------------------------------------------------------------
// This file defines all the routes for the Angular application.
// Each route specifies a URL path and the corresponding component that
// should be rendered when the user navigates to that path.
// =======================================================================

import { Routes } from '@angular/router'; // Angular's routing interface
import { HomePageComponent } from './home-page/home-page.component'; // Home page component
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component'; // Create Account page component
import { LoginPageComponent } from './login-page/login-page.component'; // Login page component
import { CreateProjectPageComponent } from './create-project-page/create-project-page.component'; // Create/Update Project page component
import { MainPageComponent } from './main-page/main-page.component'; // Main landing page component
import { MyProjectsPageComponent } from './my-projects-page/my-projects-page.component'; // My Projects page component
import { KanbanBoardPageComponent } from './kanban-board-page/kanban-board-page.component'; // Kanban Board page component
import { AccountSettingsPageComponent } from './account-settings-page/account-settings-page.component'; // Account Settings page component

// Define application routes
export const routes: Routes = [
  // Default route: renders the MainPageComponent
  { path: '', component: MainPageComponent },

  // Home page route: renders the HomePageComponent
  { path: 'home-page', component: HomePageComponent },

  // Create Account page route: renders the CreateAccountPageComponent
  { path: 'create-account', component: CreateAccountPageComponent },

  // Login page route: renders the LoginPageComponent
  { path: 'login', component: LoginPageComponent },

  // Create/Update Project page route: renders the CreateProjectPageComponent
  { path: 'create-project-page', component: CreateProjectPageComponent },

  // My Projects page route: renders the MyProjectsPageComponent
  { path: 'my-projects-page', component: MyProjectsPageComponent },

  // Kanban Board page route: renders the KanbanBoardPageComponent
  { path: 'kanban-board-page', component: KanbanBoardPageComponent },

  // Account Settings page route: renders the AccountSettingsPageComponent
  { path: 'account-settings', component: AccountSettingsPageComponent }
];
