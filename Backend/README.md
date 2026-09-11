# Backend API - Express + MongoDB (TypeScript)

A clean, modular, and scalable REST API built with Express, MongoDB (Mongoose), and TypeScript following the **Route -> Controller -> Service -> Repository** architectural pattern.

---

## Architecture Overview

```
src/
├── config/
│   └── db.ts                   # MongoDB connection logic using Mongoose
├── constants/
│   └── errorCodes.ts           # Centralized application error codes & AppError class
├── models/
│   ├── user.model.ts           # User Mongoose schema & interface
│   └── task.model.ts           # Task Mongoose schema & interface
├── repositories/               # Data Access Layer (Mongoose queries only)
│   ├── user.repository.ts      # User database queries
│   └── task.repository.ts      # Task aggregation pipelines ($match, $lookup, $unwind, $facet, $group)
├── services/                   # Business Logic Layer
│   ├── auth.service.ts         # User registration, password hashing, JWT signing
│   └── task.service.ts         # Task CRUD rules, role checks, ownership validation
├── controllers/                # HTTP Layer (try-catch, status codes, payload delivery)
│   ├── auth.controller.ts      # Auth route handlers
│   └── task.controller.ts      # Task route handlers
├── middlewares/
│   ├── auth.middleware.ts      # JWT authentication & role authorization
│   └── error.middleware.ts     # Global centralized error handler
├── routes/
│   ├── auth.routes.ts          # Auth endpoints (/api/auth)
│   ├── task.routes.ts          # Task endpoints (/api/tasks)
│   └── index.ts                # Master API router & /api/health
├── app.ts                      # Express app setup & middleware registration
└── server.ts                   # Server bootstrap & process lifecycle handlers
```

---

## Key Highlights

1. **Clean N-Tier Architecture**:
   - **Route**: Maps URL endpoints, applies authentication middleware.
   - **Controller**: Handles HTTP `req`/`res` with simple `try-catch` blocks and manual validation.
   - **Service**: Executes core business rules, password hashing, token creation, and ownership checks.
   - **Repository**: Encapsulates all database interactions.
2. **MongoDB Aggregation Pipeline**:
   - `taskRepository.findWithAggregation`: Uses `$match`, `$lookup` (joins user details), `$unwind`, `$project`, and `$facet` to retrieve paginated data and total document count in a single query.
   - `taskRepository.getTaskStats`: Uses `$match` and `$group` to aggregate status counts (`Pending`, `In Progress`, `Completed`).
3. **Centralized Error Codes**:
   - `src/constants/errorCodes.ts` defines error codes and HTTP statuses (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `USER_ALREADY_EXISTS`, `INTERNAL_SERVER_ERROR`).
4. **Clean Exports**:
   - All modules follow the convention of placing exports at the bottom of the file.

---

## Getting Started

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (or configure your MongoDB URI):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_db
JWT_SECRET=supersecretjwtkey_replace_in_production_12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build & Run Production
```bash
npm run build
npm start
```

---

## API Documentation (Swagger)

Interactive Swagger UI documentation is available at:
 **`http://localhost:5000/api-docs`**

Allows interactive testing of all authentication and task endpoints directly from the browser.

---

### Health Check
- `GET /api/health` - Server health status

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }
  ```
- `POST /api/auth/login` - Authenticate and obtain JWT
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `GET /api/auth/me` *(Protected)* - Current user profile (`Authorization: Bearer <token>`)

### Tasks (`/api/tasks`) *(All Protected)*
- `POST /api/tasks` - Create a new task
  ```json
  {
    "title": "Build Frontend Dashboard",
    "description": "Implement task list and forms using React",
    "status": "Pending"
  }
  ```
- `GET /api/tasks` - Retrieve paginated tasks (supports query params: `?page=1&limit=10&status=Pending&search=Dashboard`)
- `GET /api/tasks/stats` - Retrieve status breakdown count (`Pending`, `In Progress`, `Completed`)
- `GET /api/tasks/:id` - Retrieve a task by ID (ownership enforced)
- `PUT /api/tasks/:id` - Update a task (ownership enforced)
- `DELETE /api/tasks/:id` - Delete a task (ownership enforced)
