// src/server/errors.ts (or your path)
import type { z } from 'zod';
import { createMapEnum } from './enum-helper';
// --- Define ONLY custom, domain-specific error codes ---
// Codes that don't map directly to standard TRPCError codes.
export const CustomErrorTypeEnum = createMapEnum({
  // Examples of custom errors:
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  // Add other *truly custom* errors here as needed
  // e.g., INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS_ERROR'
} as const);

// Expose the map if needed directly
export const CustomErrorTypeMap = CustomErrorTypeEnum.map;

// Type for the values of your custom errors
export type CustomErrorType = (typeof CustomErrorTypeEnum.values)[number];

// Enhanced error metadata interface (remains the same)
export interface ErrorMetadata {
  stack?: string;
  debug?: {
    inputRaw?: unknown; // Make optional
    inputParsed?: unknown; // Make optional
    inputParseErrors?: z.ZodError | unknown;
  };
  timestamp?: string;
  requestId?: string;
  traceId?: string;
  // Add any other relevant context
  [key: string]: unknown; // Allow other arbitrary metadata
}

// Structure for the data payload sent to the client for *any* error
// This aims for consistency whether it's a TRPCError or a Custom BaseError
export interface FormattedErrorResponse {
  code: string; // Can be a TRPCError code ('BAD_REQUEST') or CustomErrorType ('RATE_LIMIT_ERROR')
  message: string;
  statusCode: number; // The intended HTTP status code
  data?: unknown | null; // Optional additional data (e.g., validation errors)
  metadata?: ErrorMetadata | null; // Consistent metadata structure
}

// --- BaseError for CUSTOM Errors ONLY ---
// This class is now specifically for errors not covered by TRPCError codes.
export class BaseError extends Error {
  // biome-ignore lint/nursery/useConsistentMemberAccessibility: our linting-rules configuration discourages it
  public readonly code: CustomErrorType; // Use the specific custom type
  // biome-ignore lint/nursery/useConsistentMemberAccessibility:
  public readonly statusCode: number;
  // biome-ignore lint/nursery/useConsistentMemberAccessibility:
  public readonly metadata: ErrorMetadata | null;

  constructor(
    message: string,
    // Ensure the code provided is one of your defined custom types
    code: CustomErrorType,
    statusCode: number,
    metadata: Record<string, unknown> | null = null // Accept generic object initially
  ) {
    super(message);
    this.name = this.constructor.name; // e.g., "RateLimitError" if you subclass
    this.code = code;
    this.statusCode = statusCode;
    // Initialize metadata ensuring timestamp
    this.metadata = {
      ...(metadata || {}), // Spread incoming metadata
      timestamp: new Date().toISOString(),
    };

    Error.captureStackTrace?.(this, this.constructor);
  }
}

// --- Factory Functions for CUSTOM Errors ---
// Keep factories only for your BaseError types
export function createRateLimitError(
  metadata: Record<string, unknown> | null = null
): BaseError {
  return new BaseError(
    'Rate limit exceeded',
    CustomErrorTypeMap.RATE_LIMIT, // Use the custom code
    429, // Standard HTTP status for rate limiting
    metadata
  );
}

export function createConflictError(
  message = 'Resource conflict occurred',
  metadata: Record<string, unknown> | null = null
): BaseError {
  return new BaseError(
    message,
    CustomErrorTypeMap.CONFLICT, // Use the custom code
    409, // Standard HTTP status for conflict
    metadata
  );
}

// --- REMOVE Factories for errors covered by TRPCError ---
// Remove createValidationError, createAuthenticationError, createForbiddenError,
// createResourceNotFoundError, createInternalServerError, createBadRequestError
// You will throw TRPCError directly for these cases.

// --- Error Serialization (Focuses on BaseError) ---
// This can be simplified or adapted based on the formatter's needs.
// It primarily formats the metadata part for BaseError now.
export function serializeBaseErrorMetadata(
  error: BaseError,
  options: { includeStack?: boolean } = {}
): ErrorMetadata {
  const { includeStack = false } = options;
  const metadata = { ...error.metadata }; // Copy base metadata

  if (includeStack && error.stack) {
    metadata.stack = error.stack;
  } else {
    metadata.stack = undefined; // Ensure stack is not present if not included
  }

  // Clean up debug info if needed (e.g., in production)
  if (process.env.NODE_ENV === 'production') {
    metadata.debug = undefined;
  }

  return metadata;
}

// --- Type Guard for Custom BaseError ---
export function isCustomError(error: unknown): error is BaseError {
  // Check if it's an instance of BaseError AND if its code is one of the defined custom types
  return (
    error instanceof BaseError && CustomErrorTypeEnum.valueSet.has(error.code)
  );
}

// --- How to add a new Custom Error ---
// 1. Add the KEY: "VALUE" pair to `CustomErrorTypeEnum` definition above.
// 2. (Optional but recommended) Create a factory function like `createYourNewError(...)`
//    that instantiates `BaseError` with the correct code, message, and status code.
// 3. In your resolver, throw the result of your factory function or `new BaseError(...)`.
// 4. The `errorFormatter` in `trpc.ts` will handle the rest.
