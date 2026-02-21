# DevDesk Frontend

The frontend application for **DevDesk**, a modern help desk ticketing system. Built with React, Vite, and Tailwind CSS.

## Features

- **Authentication**: Login, Registration, Password Reset, Profile Management.
- **Dashboard**: Interactive charts and statistics for Admins and Agents.
- **Ticket Management**: Create, view, update, delete tickets.
- **Search**: Full-text search for tickets.
- **Attachments**: Upload and preview images/PDFs.
- **Comments**: Real-time discussions on tickets.
- **Role-Based Access**: Specialized views for Users, Agents, and Admins.
- **Responsive Design**: Fully responsive UI powered by Tailwind CSS.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State/Data Fetching**: React Query (TanStack Query), Context API
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Chart Library**: Recharts

## Prerequisites

- Node.js >= 18
- NPM or Yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
VITE_BASE_URL="http://localhost:5000/api"
```

> Ensure this points to your running backend API.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/             # API client and service functions
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context (Auth)
│   ├── pages/           # Application pages (Login, Dashboard, etc.)
│   ├── App.jsx          # Main application component with routes
│   └── main.jsx         # Entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js   # (If applicable, or v4 CSS config)
```
