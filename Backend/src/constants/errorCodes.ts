export const ERROR_CODES = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    status: 400,
    message: 'Invalid input or missing required fields',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Unauthorized access. Token is missing or invalid',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    status: 401,
    message: 'Invalid email or password',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: 403,
    message: 'Forbidden. You do not have permission for this action',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
    message: 'Resource not found',
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    status: 409,
    message: 'A user with this email already exists',
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    message: 'Internal server error occurred',
  },
} as const;

export type ErrorDefinition = {
  code: string;
  status: number;
  message: string;
};

export class AppError extends Error {
  status: number;
  code: string;

  constructor(errorDef: ErrorDefinition, customMessage?: string) {
    super(customMessage || errorDef.message);
    this.status = errorDef.status;
    this.code = errorDef.code;
  }
}
