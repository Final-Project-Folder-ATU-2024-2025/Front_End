# Front-End

This front-end is an Angular-based single-page application that serves as the user interface for the Final Year Project. It communicates with the Collabfy API to display and manage conversations in real time, offering a clean and responsive experience.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Angular CLI** (v12 or higher) — install globally if not already:

    npm install -g @angular/cli

### Clone the Repo

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo/frontend
```

### Install Dependencies

Install the required packages:

```bash
npm install
```

## Running the Development Server

Start the Angular development server:

```bash
ng serve
```

Open your browser and navigate to `http://localhost:4200`. The app will automatically reload if you make changes to the source code.

## Building for Production

To create an optimized production build, run:

```bash
ng build --prod
```

This will generate static assets in the `dist/frontend/` folder, ready for deployment.

## Configuration

Environment settings are in the `src/environments` folder. For API endpoint customization, update the `environment.ts` file:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://api.yourdomain.com'
};
```

Adjust the value according to your API endpoint.

## Features

- **Responsive Design**: Uses Angular Flex-Layout and CSS Grid.
- **API Integration**: Fetches conversations and emits updates via Angular Services and HttpClient.
- **State Management**: Utilizes RxJS Subjects and BehaviorSubjects for global state.
- **Routing**: Configured with Angular Router for navigation between conversation views.
- **Modern Tooling**: Built with Angular CLI, TypeScript, and Angular Material for UI components.

## Deployment

You can deploy the contents of the `dist/frontend/` folder to any static hosting service (Netlify, Vercel, GitHub Pages, etc.). Ensure environment configurations are updated for production before deploying.
