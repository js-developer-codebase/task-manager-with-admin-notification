# Frontend Web Application - React 19 + TypeScript + Vite

A modern, responsive, and high-performance Single Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Redux Toolkit**. Features real-time notifications via **Socket.IO**, cursor-based infinite scrolling, safe type-to-confirm task deletion, and multi-stage containerization with **Nginx**.

---

## Architecture Overview

```
src/
├── assets/                        # Static images and icons
├── components/                    # Reusable UI components
│   ├── DeleteConfirmModal.tsx     # Safe "type delete to confirm" task removal modal
│   ├── Navbar.tsx                 # Header with branding, admin broadcast trigger, and profile info
│   ├── NotificationBell.tsx       # Bell dropdown with infinite scroll, read status, and per-user deletion
│   ├── NotificationToast.tsx      # Real-time popup toast for incoming broadcast notifications
│   ├── Pagination.tsx             # Numbered pagination controls for task catalog
│   ├── ProtectedRoute.tsx         # Auth guard component redirecting unauthenticated users to login
│   ├── SendNotificationModal.tsx  # Admin modal to dispatch broadcast notifications to BullMQ
│   ├── StatsCards.tsx             # Metric cards showing Total, Pending, In Progress, and Completed counts
│   ├── TaskCard.tsx               # Interactive task card with status badge, edit, and delete triggers
│   ├── TaskFilters.tsx            # Debounced search bar and status filter dropdown
│   └── TaskModal.tsx              # Modal dialog for creating and editing tasks
├── pages/                         # Main application views
│   ├── DashboardPage.tsx          # Authenticated workspace: tasks, stats, and real-time socket listeners
│   ├── LoginPage.tsx              # User authentication screen
│   └── SignupPage.tsx             # Registration screen with role selection (user / admin)
├── redux/                         # Global State Management (Redux Toolkit)
│   ├── hooks.ts                   # Typed hooks (`useAppDispatch`, `useAppSelector`)
│   ├── store.ts                   # Redux store configuration combining all slice reducers
│   ├── index.ts                   # Store exports
│   └── slices/
│       ├── authSlice.ts           # User profile, JWT token, and login/logout state
│       ├── taskSlice.ts           # Task list, pagination metadata, stats, and active filters
│       └── notificationSlice.ts   # Notifications feed, unread counter, infinite scroll, and toast state
├── services/                      # External communication layers
│   ├── api.ts                     # Fetch API client with JWT authorization interceptors
│   └── socket.ts                  # Persistent Socket.IO client instance and event listeners
├── App.tsx                        # Client-side router configuration (React Router DOM v7)
├── index.css                      # Tailwind CSS v4 directives and custom sleek scrollbar utilities
└── main.tsx                       # React DOM entry point wrapping App with Redux Provider
```

---

## Key Features

### 1. Task Management
* **Full CRUD**: Create, view, update, and delete tasks with instant optimistic/state updates.
* **Task Analytics**: Live summary cards displaying counts for **Total**, **Pending**, **In Progress**, and **Completed** tasks.
* **Search & Filters**: Real-time debounced search (by title, description, or creator name) combined with status filtering.
* **Server-Side Pagination**: Clean page-by-page task browsing with dynamic page count calculation.

### 2. Type-to-Confirm Task Deletion
* To prevent accidental data loss, deleting a task opens a confirmation modal requiring the user to explicitly type `"delete"` before the confirm button becomes active.

### 3. Real-Time Asynchronous Notifications
* **Instant WebSocket Broadcasts**: Connects to the backend via **Socket.IO**; workers emit `new_notification` events directly to clients without page reloads.
* **Floating Live Toasts**: Displays an animated pop-up toast on the screen whenever an admin broadcasts a notification.
* **Notification Bell & Unread Counter**: Dynamic red badge showing unread notifications count (`9+` cap).
* **Per-User Deletion**: Allows users to delete notifications from their personal view while preserving them for other team members.
* **Cursor-Based Infinite Scroll**: 
  * Automatically loads older batches as the user scrolls down.
  * Auto-refills the dropdown if deleting items removes the scrollbar.
  * Custom 5px thin, rounded scrollbar styling (`.custom-scrollbar`).

### 4. Role-Based Access Control (RBAC)
* **Admin Controls**: Users with the `admin` role have access to an admin-only broadcast button in the navigation bar to queue notifications for the entire team.
* **Protected Routes**: React Router guards prevent unauthenticated access, preserving navigation state.

---

## Tech Stack

* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite 8
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
* **State Management**: Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)
* **Routing**: React Router DOM v7
* **WebSockets**: Socket.IO Client (`socket.io-client`)
* **Icons**: Custom responsive SVGs & Lucide React
* **Production Web Server**: Nginx (Alpine Linux)

---

## Running Options

### Option 1: Native Node.js (Vite Development Server)
Runs the Vite dev server with instant Hot Module Replacement (HMR).

```bash
# 1. Navigate to Frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

* Application runs at: **`http://localhost:5173`**
* Requests to `/api` and `/socket.io` are handled by the Vite development proxy or point to your backend.

---

### Option 2: Standalone Frontend in Docker
Builds and serves the production-ready compiled static bundle using an **Nginx** reverse proxy:

```bash
cd Frontend
docker compose up --build
```

* Application runs at: **`http://localhost:5173`**
* Automatically connects to the host backend using `host-gateway`.

---

### Option 3: Full Stack in Docker (Recommended for Production Simulation)
Runs Frontend, Backend, and Redis together on a shared bridge network:

```bash
# From the project root
docker compose up --build -d
```

| Service | Host Port | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `5173` | Web UI & Nginx Reverse Proxy |
| **Backend** | `5000` | REST API & WebSocket Server |
| **Redis** | `6379` | BullMQ Job Queue |

---

## Production Build & Preview

To compile the application into static HTML, CSS, and JS:

```bash
# TypeScript type-check and Vite production build
npm run build

# Preview production build locally
npm run preview
```

Compiled assets are generated in the `Frontend/dist/` directory.

---

## Nginx Reverse Proxy Architecture

In Docker production setups (`Frontend/nginx.conf`), Nginx acts as both a high-performance web server and reverse proxy:

```
Browser (http://localhost:5173)
   │
   ├── /                  ───> Serves compiled React assets (with Gzip)
   │                           └── try_files $uri $uri/ /index.html (SPA Fallback)
   │
   ├── /api/*             ───> Proxies to http://backend:5000/api/* (Eliminates CORS)
   │
   └── /socket.io/*       ───> Upgrades & Proxies WebSocket to http://backend:5000
```

1. **SPA Routing**: The `try_files $uri $uri/ /index.html;` directive prevents `404 Not Found` errors when refreshing routes (e.g. `/dashboard`).
2. **CORS Elimination**: By reverse proxying `/api/` to the backend container, the frontend and API share the same origin.
3. **WebSocket Upgrade**: Supports persistent `Upgrade: websocket` HTTP/1.1 connections for real-time notifications.
4. **Gzip Compression**: Pre-compresses JavaScript, CSS, and SVG files for fast network delivery.
