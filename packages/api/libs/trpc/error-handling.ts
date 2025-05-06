// --- Import revised error utilities ---
import {
  type BaseError, // Import BaseError type for the helper
  type FormattedErrorResponse,
  serializeBaseErrorMetadata,
} from '@repo/api/utils/errors'; // Adjust path as necessary
import type { TRPCError } from '@trpc/server';
import type { ZodError } from 'zod';

// ==================================
// Error Formatting Helper Functions
// ==================================

export function formatCustomError(
  baseError: BaseError, // Type is guaranteed by isCustomError check
  includeStack: boolean
): FormattedErrorResponse {
  return {
    code: baseError.code,
    message: baseError.message,
    statusCode: baseError.statusCode,
    data: null, // Assuming BaseError doesn't carry specific data payload
    metadata: serializeBaseErrorMetadata(baseError, { includeStack }),
  };
}

export function formatZodError(
  zodError: ZodError,
  timestamp: string
): FormattedErrorResponse {
  return {
    code: 'VALIDATION_ERROR', // Specific code for client consumption
    message: 'Input validation failed',
    statusCode: 400,
    data: zodError.flatten(), // Provide structured validation details
    metadata: { timestamp },
  };
}

export function formatTRPCError(
  error: TRPCError,
  isProd: boolean,
  includeStack: boolean,
  timestamp: string
): FormattedErrorResponse {
  const statusCode = getStatusCodeForResponseBody(error.code);
  const message =
    isProd && error.code === 'INTERNAL_SERVER_ERROR'
      ? 'An unexpected internal error occurred'
      : error.message;

  const response: FormattedErrorResponse = {
    code: error.code,
    message,
    statusCode,
    data: null,
    metadata: { timestamp },
  };

  // Conditionally add stack trace to metadata
  if (includeStack && error.code === 'INTERNAL_SERVER_ERROR' && error.stack) {
    response.metadata = { ...response.metadata, stack: error.stack };
  }

  return response;
}

export function formatUnknownError(
  error: unknown,
  isProd: boolean,
  includeStack: boolean,
  timestamp: string
): FormattedErrorResponse {
  const message = isProd
    ? 'An unexpected internal error occurred'
    : error instanceof Error
      ? error.message
      : String(error); // Get message safely

  const response: FormattedErrorResponse = {
    code: 'INTERNAL_SERVER_ERROR',
    message,
    statusCode: 500,
    data: null,
    metadata: { timestamp },
  };

  // Conditionally add stack trace to metadata
  if (includeStack && error instanceof Error && error.stack) {
    response.metadata = { ...response.metadata, stack: error.stack };
  }

  return response;
}

// --- Stable Helper to get Status Code for Response BODY ---
// (Keep this helper as it's used by formatTRPCError)
export function getStatusCodeForResponseBody(code: TRPCError['code']): number {
  switch (code) {
    case 'PARSE_ERROR':
      return 400;
    case 'BAD_REQUEST':
      return 400;
    case 'NOT_FOUND':
      return 404;
    case 'INTERNAL_SERVER_ERROR':
      return 500;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'TIMEOUT':
      return 408;
    case 'CONFLICT':
      return 409;
    case 'CLIENT_CLOSED_REQUEST':
      return 499;
    case 'PRECONDITION_FAILED':
      return 412;
    case 'PAYLOAD_TOO_LARGE':
      return 413;
    case 'METHOD_NOT_SUPPORTED':
      return 405;
    case 'UNPROCESSABLE_CONTENT':
      return 422;
    case 'TOO_MANY_REQUESTS':
      return 429;
    default:
      return 500;
  }
}
