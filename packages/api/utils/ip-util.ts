import type { IncomingMessage } from 'node:http';
import ipaddr from 'ipaddr.js';
// The forwarded header (RFC 7239) is now properly supported along with the older de-facto standards
/**
 * Type representing framework-agnostic request objects with IP address capabilities
 */
type RequestLike =
  | IncomingMessage
  | {
      headers: Headers | Record<string, string | string[] | undefined>;
      ip?: string;
      socket?: { remoteAddress?: string };
      connection?: { remoteAddress?: string };
    };

/**
 * Configuration options for IP address extraction
 */
interface IpExtractionOptions {
  /**
   * Custom list of trusted headers to check (in order of priority)
   * @default Comprehensive list of common proxy headers
   */
  trustedHeaders?: string[];
  /**
   * Whether to validate IP addresses using ipaddr.js
   * @default true when ipaddr.js is available
   */
  validateIp?: boolean;
  /**
   * Whether to remove IPv4-mapped IPv6 prefix (::ffff:)
   * @default true
   */
  normalizeIPv6?: boolean;
}

/**
 * Default list of trusted headers in priority order
 */
const DEFAULT_TRUSTED_HEADERS = [
  // Cloud providers and CDNs
  'cf-connecting-ip', // Cloudflare
  'true-client-ip', // Akamai and Cloudflare
  'fastly-client-ip', // Fastly CDN
  'x-vercel-forwarded-for', // Vercel

  // Reverse proxies and load balancers
  'x-real-ip', // Nginx proxy, HAProxy
  'x-client-ip', // Apache httpd
  'x-cluster-client-ip', // Rackspace LB, Riverbed Stingray

  // Standard headers
  'x-forwarded-for', // Standard proxy header (most common)
  'forwarded', // RFC 7239 standardized header

  // Other common headers
  'x-forwarded', // General forward header
  'x-original-forwarded-for', // Some proxies use this
] satisfies string[];

/**
 * Safely extracts a header value from different header types
 */
function getHeaderValue(
  headers: Headers | Record<string, string | string[] | undefined> | undefined,
  headerName: string
): string | null {
  if (!headers) return null;

  const lowerCaseName = headerName.toLowerCase();

  // Handle Web Headers API
  if (headers instanceof Headers) {
    return headers.get(lowerCaseName);
  }

  // Handle Node.js request headers
  const headerValue = headers[lowerCaseName] ?? headers[headerName];
  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? null;
  }
  return headerValue ?? null;
}

/**
 * Validates an IP address using ipaddr.js if available
 */
function isValidIpAddress(ip: string | null | undefined): ip is string {
  if (!ip) return false;

  try {
    // Skip validation if ipaddr.js isn't available
    if (typeof ipaddr?.parse !== 'function') return true;

    ipaddr.parse(ip);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes an IP address by removing IPv6 prefixes
 */
function normalizeIpAddress(
  ip: string,
  options: { normalizeIPv6: boolean }
): string {
  return options.normalizeIPv6 && ip.startsWith('::ffff:')
    ? ip.substring(7)
    : ip;
}

/**
 * Extracts the client IP address from various request objects with multiple fallback strategies
 *
 * @param req - The request object (works with Node.js, Next.js, and standard Requests)
 * @param options - Configuration options for IP extraction
 * @returns The client IP address or null if not determinable
 *
 * @example
 * // Basic usage with all default headers
 * const ip = getClientIpAddress(req);
 *
 * // With custom options
 * const ip = getClientIpAddress(req, {
 *   trustedHeaders: ['x-custom-ip-header', 'x-real-ip'],
 *   validateIp: false
 * });
 */

/**
 * Attempts to extract IP from direct request IP property
 */
function extractDirectIp(
  req: RequestLike,
  options: { normalizeIPv6: boolean; validateIp: boolean }
): string | null {
  if (!('ip' in req) || !req.ip) return null;

  const normalizedIp = normalizeIpAddress(req.ip, {
    normalizeIPv6: options.normalizeIPv6,
  });

  return !options.validateIp || isValidIpAddress(normalizedIp)
    ? normalizedIp
    : null;
}

/**
 * Processes a single IP header value
 */
function processHeaderValue(
  headerValue: string,
  headerName: string,
  options: { normalizeIPv6: boolean; validateIp: boolean }
): string | null {
  // Handle headers that may contain multiple IPs
  const potentialIps =
    headerName.toLowerCase() === 'x-forwarded-for' ||
    headerName.toLowerCase() === 'forwarded'
      ? headerValue.split(',')
      : [headerValue];

  for (const rawIp of potentialIps) {
    const ip = rawIp.trim();
    if (!ip) continue;

    const normalizedIp = normalizeIpAddress(ip, {
      normalizeIPv6: options.normalizeIPv6,
    });

    if (!options.validateIp || isValidIpAddress(normalizedIp)) {
      return normalizedIp;
    }
  }

  return null;
}

/**
 * Attempts to extract IP from request headers
 */
function extractHeaderIp(
  req: { headers?: Headers | Record<string, string | string[] | undefined> },
  trustedHeaders: string[],
  options: { normalizeIPv6: boolean; validateIp: boolean }
): string | null {
  if (!req.headers) return null;

  for (const headerName of trustedHeaders) {
    const headerValue = getHeaderValue(req.headers, headerName);
    if (!headerValue) continue;

    const ip = processHeaderValue(headerValue, headerName, options);
    if (ip) return ip;
  }

  return null;
}

/**
 * Attempts to extract IP from connection/socket properties
 */
function extractConnectionIp(
  req: RequestLike,
  options: { normalizeIPv6: boolean; validateIp: boolean }
): string | null {
  const remoteAddress =
    ('socket' in req && req.socket?.remoteAddress) ||
    ('connection' in req && req.connection?.remoteAddress);

  if (!remoteAddress) return null;

  const normalizedIp = normalizeIpAddress(remoteAddress, {
    normalizeIPv6: options.normalizeIPv6,
  });

  return !options.validateIp || isValidIpAddress(normalizedIp)
    ? normalizedIp
    : null;
}

/**
 * Extracts the client IP address using multiple strategies
 */
export function getClientIpAddress(
  req: RequestLike,
  options: IpExtractionOptions = {}
): string | null {
  const {
    trustedHeaders = DEFAULT_TRUSTED_HEADERS,
    validateIp = typeof ipaddr !== 'undefined',
    normalizeIPv6 = true,
  } = options;

  const extractionOptions = { normalizeIPv6, validateIp };

  // Try each extraction strategy in order
  return (
    extractDirectIp(req, extractionOptions) ||
    extractHeaderIp(req, trustedHeaders, extractionOptions) ||
    extractConnectionIp(req, extractionOptions) ||
    null
  );
}
