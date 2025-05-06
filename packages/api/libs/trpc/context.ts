import { getIpFromRequest } from '@repo/api/utils/ip-util';
import type { Session } from 'next-auth';
import { rateLimitersIntializeService } from '../ratelimit/redis/ratelimit-service';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 */

// Add 'ip' to the context options and the final context shape
interface CreateContextOptions<NextRequest> {
  headers: Headers;
  auth: Session | null;
  apiKey?: string | null;
  authorizationHeader?: null;
  req?: NextRequest; // Keep the original request object available if needed
  ip: string | null; // Add the determined IP address
}

/**
 * This helper generates the "internals" for a tRPC context.
 * It now simply returns the options passed to it, including the IP.
 */
export const createInnerTRPCContext = <NextRequest>(
  opts: CreateContextOptions<NextRequest>
) => {
  // Destructure to be explicit about what's included, or just return opts
  const { headers, auth, apiKey, authorizationHeader, req, ip } = opts;
  return {
    headers,
    auth,
    apiKey,
    authorizationHeader,
    req, // Keep req if procedures might need direct access
    ip, // Include the IP in the final context
  };
};

/**
 * This is the actual context you'll use in your router. It now
 * calculates the IP and includes it in the context.
 */
export const createTRPCContext = async <
  // Define a constraint for NextRequest to ensure it has headers
  NextRequest extends { headers: Headers },
>(opts: {
  headers: Headers;
  req?: NextRequest; // Pass the full request object
  auth: Session | null;
  authorizationHeader?: null;
}) => {
  // 1. Determine the Client IP Address
  // Pass both headers and the request object to getIp, as it might need both
  const ip = getIpFromRequest(opts.req ?? { headers: opts.headers });

  // 2. Get API Key (example)
  const apiKey = opts.req?.headers.get('x-acme-api-key');
  await rateLimitersIntializeService.init();
  // 3. Create the inner context, passing the determined IP
  return createInnerTRPCContext({
    auth: opts.auth,
    apiKey,
    req: opts.req,
    headers: opts.headers,
    authorizationHeader: opts.authorizationHeader,
    ip, // Pass the determined IP
  });
};

// Infer the final context type from the createTRPCContext function
export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;
