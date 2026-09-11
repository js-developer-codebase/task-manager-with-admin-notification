import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'Clean Architecture Express + MongoDB Task Management REST API with TypeScript, JWT authentication, and MongoDB Aggregation Pipelines.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          code: { type: 'string', example: 'BAD_REQUEST' },
          message: { type: 'string', example: 'Invalid input or missing required fields' },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 6, example: 'password123' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user', example: 'user' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '65f123456789abcdef012345' },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  role: { type: 'string', example: 'user' },
                },
              },
            },
          },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Complete Project Documentation' },
          description: { type: 'string', example: 'Write Swagger API docs and unit tests' },
          status: {
            type: 'string',
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
            example: 'Pending',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Complete Project Documentation (Updated)' },
          description: { type: 'string', example: 'Final review of Swagger documentation' },
          status: {
            type: 'string',
            enum: ['Pending', 'In Progress', 'Completed'],
            example: 'In Progress',
          },
        },
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f123456789abcdef012346' },
          title: { type: 'string', example: 'Complete Project Documentation' },
          description: { type: 'string', example: 'Write Swagger API docs and unit tests' },
          status: { type: 'string', example: 'Pending' },
          userId: { type: 'string', example: '65f123456789abcdef012345' },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '65f123456789abcdef012345' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Returns server uptime and status',
        responses: {
          200: {
            description: 'Server is healthy',
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          409: {
            description: 'Email already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'User login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current logged-in user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
          },
          401: {
            description: 'Unauthorized access',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'Get tasks with filtering & pagination (Aggregation pipeline)',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'List of tasks with pagination metadata',
          },
          401: {
            description: 'Unauthorized access',
          },
        },
      },
      post: {
        summary: 'Create a new task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created successfully',
          },
          400: {
            description: 'Validation error',
          },
          401: {
            description: 'Unauthorized access',
          },
        },
      },
    },
    '/api/tasks/stats': {
      get: {
        summary: 'Get task count breakdown by status ($group aggregation)',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Task counts grouped by status',
          },
          401: {
            description: 'Unauthorized access',
          },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Task details' },
          403: { description: 'Forbidden (not owner)' },
          404: { description: 'Task not found' },
        },
      },
      put: {
        summary: 'Update a task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Task updated successfully' },
          403: { description: 'Forbidden (not owner)' },
          404: { description: 'Task not found' },
        },
      },
      delete: {
        summary: 'Delete a task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Task deleted successfully' },
          403: { description: 'Forbidden (not owner)' },
          404: { description: 'Task not found' },
        },
      },
    },
  },
};

const swaggerServe = swaggerUi.serve;
const swaggerSetup = swaggerUi.setup(swaggerDocument);

export { swaggerDocument, swaggerServe, swaggerSetup };
