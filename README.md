# MERN Task Management & Real-Time Notification System

Full-stack production-ready MERN application with clean N-tier architecture, pure MongoDB aggregation pipelines, Redis + BullMQ asynchronous queues, real-time Socket.io pushes, and interactive Swagger API documentation.

---

## Project Architecture

```
task-manager-with-admin-notification/
├── Backend/                 # Express + TypeScript + MongoDB
│   ├── docker-compose.yml   # Redis container for BullMQ
│   ├── src/
│   │   ├── config/          # DB, Redis, and Swagger configs
│   │   ├── constants/       # Centralized errorCodes.ts
│   │   ├── controllers/     # HTTP req/res handlers (simple try-catch)
│   │   ├── models/          # User, Task, Notification Mongoose models
│   │   ├── middlewares/     # JWT Auth and global error handling
│   │   ├── queues/          # BullMQ queue and worker
│   │   ├── repositories/    # Pure MongoDB aggregation pipelines (zero populate)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Core business logic
│   │   ├── socket.ts        # Socket.io real-time server
│   │   ├── app.ts           # Express setup & Swagger mounting
│   │   └── server.ts        # HTTP server & worker bootstrap
│   └── README.md
├── Frontend/                # Vite + React 19 + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/      # Modular React components (Navbar, NotificationBell, TaskCard, etc.)
│       ├── pages/           # LoginPage, SignupPage, DashboardPage
│       ├── redux/           # Redux Toolkit store, hooks, and slices (auth, tasks, notifications)
│       └── services/        # Centralized fetch API client & Socket.io client
└── SRS/
    └── MERN_Machine_Test.pdf # Original specifications document
```

---

## Running the Application

### Option A: Run Full Stack in Docker (Recommended for instant setup)
Run the entire ecosystem (Redis, Backend, Frontend with Nginx) with a single command:
```bash
docker compose up --build
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Swagger Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

### Option B: Native Node.js with Dockerized Redis (Best for local development)
Run Redis in Docker, and run Backend & Frontend natively via standard `npm` commands:

**1. Start Redis in Docker:**
```bash
cd Backend
docker compose up redis -d
```

**2. Start Backend API (Terminal 1):**
```bash
cd Backend
npm install
npm run dev
# Server running at: http://localhost:5000
```

**3. Start Frontend UI (Terminal 2):**
```bash
cd Frontend
npm install
npm run dev
# App running at: http://localhost:5173
```

---

### Option C: Run Services Independently in Docker
Each service has its own dedicated Docker setup:

- **Run Backend + Redis only in Docker:**
  ```bash
  cd Backend
  docker compose up --build
  ```

- **Run Frontend only in Docker:**
  ```bash
  cd Frontend
  docker compose up --build
  ```

---

## Key Features & Implementation Details

1. **Clean Route &rarr; Controller &rarr; Service &rarr; Repository Architecture**:
   - Explicit layer separation with plain functions and exports placed at the bottom of files.
   - Controllers handle HTTP with standard `try...catch`.
   - Services execute business rules and queue operations.
   - Repositories encapsulate database access.

2. **Pure MongoDB Aggregation Pipelines**:
   - Zero Mongoose `.populate()` calls.
   - Multi-stage pipelines using `$match`, `$lookup`, `$unwind`, `$project`, and `$facet` for user joins, search across title and creator name, and server-side pagination.
   - Status KPI counts computed via `$match` and `$group`.

3. **Asynchronous Real-Time Notification System**:
   - **BullMQ + Redis**: Admin notification creation is queued asynchronously.
   - **Offline Persistence**: BullMQ worker saves notifications to MongoDB, allowing offline users to view unread notifications upon connecting.
   - **Socket.io Push**: Real-time push (`new_notification`) delivers broadcasts to all online users and admins instantly without page reload.
   - **Notification Bell & Toast**: Red unread badge, interactive dropdown list, and floating toast alert upon incoming notifications.

4. **Interactive Swagger API Documentation**:
   - Available at: **`http://localhost:5000/api-docs`**
   - Direct interactive testing with JWT Bearer authentication.
