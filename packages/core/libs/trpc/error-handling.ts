// --- Import revised error utilities ---
import {
  type BaseError, // Import BaseError type for the helper
  type FormattedErrorResponse,
  isCustomError,
  serializeBaseErrorMetadata,
} from "@repo/shared/utils/errors"; // Adjust path as necessary
import { TRPCError } from "@trpc/server";
import type {
  DefaultErrorShape,
  ProcedureType,
} from "@trpc/server/unstable-core-do-not-import";
import { ZodError } from "zod";

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
    code: "VALIDATION_ERROR", // Specific code for client consumption
    message: "Input validation failed",
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
    isProd && error.code === "INTERNAL_SERVER_ERROR"
      ? "An unexpected internal error occurred"
      : error.message;

  const response: FormattedErrorResponse = {
    code: error.code,
    message,
    statusCode,
    data: null,
    metadata: { timestamp },
  };

  // Conditionally add stack trace to metadata
  if (includeStack && error.code === "INTERNAL_SERVER_ERROR" && error.stack) {
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
    ? "An unexpected internal error occurred"
    : error instanceof Error
      ? error.message
      : String(error); // Get message safely

  const response: FormattedErrorResponse = {
    code: "INTERNAL_SERVER_ERROR",
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
export function getStatusCodeForResponseBody(code: TRPCError["code"]): number {
  switch (code) {
    case "PARSE_ERROR":
      return 400;
    case "BAD_REQUEST":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "INTERNAL_SERVER_ERROR":
      return 500;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "TIMEOUT":
      return 408;
    case "CONFLICT":
      return 409;
    case "CLIENT_CLOSED_REQUEST":
      return 499;
    case "PRECONDITION_FAILED":
      return 412;
    case "PAYLOAD_TOO_LARGE":
      return 413;
    case "METHOD_NOT_SUPPORTED":
      return 405;
    case "UNPROCESSABLE_CONTENT":
      return 422;
    case "TOO_MANY_REQUESTS":
      return 429;
    default:
      return 500;
  }
}

export type ErrorFormatter<TContext, TShape> = (opts: {
  error: TRPCError;
  type: ProcedureType | "unknown";
  path: string | undefined;
  input: unknown;
  ctx: TContext | undefined;
  shape: DefaultErrorShape;
}) => TShape;
// https://trpc.io/docs/server/error-formatting
export const trpcErrorFormatter: ErrorFormatter<unknown, unknown> = ({
  shape,
  error,
}) => {
  // --- Setup environment flags ---
  const includeStack = process.env.NODE_ENV !== "production";
  const isProd = process.env.NODE_ENV === "production";
  const timestamp = new Date().toISOString();

  // --- Determine Response using Helper Functions ---
  let response: FormattedErrorResponse;

  if (isCustomError(error.cause)) {
    // Type assertion is safe here due to isCustomError check
    response = formatCustomError(error.cause as BaseError, includeStack);
  } else if (error.code === "BAD_REQUEST" && error.cause instanceof ZodError) {
    response = formatZodError(error.cause, timestamp);
  } else if (error instanceof TRPCError) {
    response = formatTRPCError(error, isProd, includeStack, timestamp);
  } else {
    response = formatUnknownError(error, isProd, includeStack, timestamp);
  }

  // --- Return Final Shape ---
  // tRPC handles the actual HTTP status header based on the original 'error'.
  // Our 'response' object shapes the JSON data payload.
  return {
    ...shape,
    data: {
      ...shape.data,
      ...response,
    },
  };
};
