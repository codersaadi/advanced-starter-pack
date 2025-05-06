import {
  type BaseError,
  type FormattedErrorResponse,
  isCustomError,
} from '@repo/api/utils/errors';
// src/server/trpc.ts (or your path)
import { TRPCError, initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import type { TrpcContext } from './context';
import {
  formatCustomError,
  formatTRPCError,
  formatUnknownError,
  formatZodError,
} from './error-handling';
import { transformer } from './transformer';

// ==================================
// tRPC Initialization
// ==================================

export const t = initTRPC.context<TrpcContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    // --- Setup environment flags ---
    const includeStack = process.env.NODE_ENV !== 'production';
    const isProd = process.env.NODE_ENV === 'production';
    const timestamp = new Date().toISOString();

    // --- Determine Response using Helper Functions ---
    let response: FormattedErrorResponse;

    if (isCustomError(error.cause)) {
      // Type assertion is safe here due to isCustomError check
      response = formatCustomError(error.cause as BaseError, includeStack);
    } else if (
      error.code === 'BAD_REQUEST' &&
      error.cause instanceof ZodError
    ) {
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
  },
});

// ==================================
// Router and Procedures
// ==================================
export const createTRPCRouter = t.router;
