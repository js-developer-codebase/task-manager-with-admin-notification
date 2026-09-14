# Backend API - Express + MongoDB (TypeScript)

A clean, modular, and scalable REST API built with Express, MongoDB (Mongoose), and TypeScript following the **Route -> Controller -> Service -> Repository** architectural pattern. Includes asynchronous background job processing via **BullMQ + Redis**, real-time pushes via **Socket.io**, and interactive **Swagger API Documentation**.

---

## Architecture Overview

```
src/
├── config/
│   ├── db.ts                      # MongoDB connection logic using Mongoose
│   ├── redis.ts                   # Redis connection options for BullMQ
│   └── swagger.ts                 # OpenAPI 3.0 specification & Swagger UI config
├── constants/
│   └── errorCodes.ts              # Centralized application error codes & AppError class
├── models/
│   ├── user.model.ts              # User Mongoose schema & interface
│   ├── task.model.ts              # Task Mongoose schema & interface
│   └── notification.model.ts      # Notification Mongoose schema & interface
├── repositories/                  # Data Access Layer (Mongoose queries only)
│   ├── user.repository.ts         # User database queries
│   ├── task.repository.ts         # Pure Aggregation pipelines ($match, $lookup, $unwind, $facet, $group)
│   └── notification.repository.ts # Notification DB queries (create, findAll, markAsRead, unreadCount)
├── queues/                        # Background Asynchronous Processing (BullMQ)
│   ├── notification.queue.ts      # BullMQ Queue instance & job dispatcher
│   └── notification.worker.ts     # Worker: saves to MongoDB & emits real-time Socket.io event
├── services/                      # Business Logic Layer
│   ├── auth.service.ts            # Registration, password hashing, JWT signing
│   ├── task.service.ts            # Task CRUD rules, role checks, ownership validation
│   └── notification.service.ts    # Notification queuing, list retrieval, mark-as-read
├── controllers/                   # HTTP Layer (try-catch, status codes, payload delivery)
│   ├── auth.controller.ts         # Auth route handlers
│   ├── task.controller.ts         # Task route handlers
│   └── notification.controller.ts # Notification route handlers
├── middlewares/
│   ├── auth.middleware.ts         # JWT authentication & role authorization
│   └── error.middleware.ts        # Global centralized error handler
├── routes/
│   ├── auth.routes.ts             # Auth endpoints (/api/auth)
│   ├── task.routes.ts             # Task endpoints (/api/tasks)
│   ├── notification.routes.ts     # Notification endpoints (/api/notifications)
│   └── index.ts                   # Master API router & /api/health
├── socket.ts                      # Socket.io server initialization & emitter helper
├── app.ts                         # Express app setup, Swagger mounting, middleware registration
└── server.ts                      # Server bootstrap (HTTP server, Socket.io, BullMQ worker)
```

---

## Key Highlights

1. **Clean N-Tier Architecture**:
   - **Route**: Maps URL endpoints, applies authentication and role-based middlewares.
   - **Controller**: Handles HTTP `req`/`res` with simple `try-catch` blocks and manual validation.
   - **Service**: Executes core business rules, password hashing, token creation, and ownership checks.
   - **Repository**: Encapsulates all database interactions.
2. **Pure MongoDB Aggregation Pipelines**:
   - Zero Mongoose `.populate()` calls. All joins use `$lookup`, `$unwind`, and `$project`.
   - `taskRepository.findWithAggregation`: Supports search by task title, description, or creator user name, with server-side `$facet` pagination and total counts in a single query.
   - `taskRepository.getTaskStats`: Aggregates counts grouped by status (`Pending`, `In Progress`, `Completed`).
3. **Asynchronous Real-Time Notifications**:
   - **Redis (Docker)**: Runs via `docker-compose.yml` for BullMQ queuing.
   - **BullMQ Queue & Worker**: Decouples notification dispatching. The worker saves notifications to MongoDB (offline persistence) and triggers a real-time push via Socket.io.
   - **Zero-Reload Live Updates**: All connected users and admins receive broadcasts instantly via WebSocket (`new_notification`).
4. **Interactive Swagger Documentation**:
   - Live OpenAPI 3.0 specification served via `swagger-ui-express` at `/api-docs`.
5. **Centralized Error Codes**:
   - `src/constants/errorCodes.ts` defines unified error codes and HTTP statuses (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `USER_ALREADY_EXISTS`, `INTERNAL_SERVER_ERROR`).
6. **Clean Exports**:
   - All modules follow the convention of placing exports at the bottom of the file.
7. **Rate Limiting & Brute-Force Protection**:
   - Centralized rate limiters powered by `express-rate-limit` with standard `RateLimit-*` response headers.
   - Global API limit: 100 requests per 15 minutes per IP.
   - Auth limit: 10 attempts per 15 minutes per IP on `/api/auth/login` and `/api/auth/signup`.
   - Admin broadcast limit: 10 broadcasts per 5 minutes.
   - Returns standard `429 Too Many Requests` with `TOO_MANY_REQUESTS` error code.

---

## Getting Started

### 1. Start Redis in Docker
```bash
cd Backend
docker compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_db
JWT_SECRET=supersecretjwtkey_replace_in_production_12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build & Run Production
```bash
npm run build
npm start
```

---

## API Documentation (Swagger)

Interactive Swagger UI documentation is available at:
 **`http://localhost:5000/api-docs`**

Allows interactive testing of all authentication, task, and notification endpoints directly from the browser with JWT Bearer support.

---

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new user (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` - Authenticate and obtain JWT (`email`, `password`)
- `GET /api/auth/me` *(Protected)* - Current user profile (`Authorization: Bearer <token>`)

### Tasks (`/api/tasks`) *(Protected)*
- `POST /api/tasks` - Create a new task (`title`, `description`, `status`)
- `GET /api/tasks` - Retrieve paginated tasks
  - Query params: `?page=1&limit=10&status=Pending&search=keyword`
  - Searches across: `title`, `description`, and creator's `name` or `email`
- `GET /api/tasks/stats` - Retrieve status breakdown count (`Pending`, `In Progress`, `Completed`)
- `GET /api/tasks/:id` - Retrieve a task by ID (ownership enforced)
- `PUT /api/tasks/:id` - Update a task (ownership enforced)
- `DELETE /api/tasks/:id` - Delete a task (ownership enforced)

### Notifications (`/api/notifications`) *(Protected)*
- `POST /api/notifications` *(Admin Only)* - Queue a broadcast notification (`title`, `message`)
- `GET /api/notifications` - Retrieve all notifications (offline persistence from DB)
- `GET /api/notifications/unread-count` - Get count of unread notifications
- `PATCH /api/notifications/:id/read` - Mark a specific notification as read

### WebSocket Events (Socket.io)
- `new_notification` - Broadcast payload emitted to connected clients when a new notification is processed by the BullMQ worker.
