import type { IncomingMessage } from "node:http";
import ipaddr from "ipaddr.js";
// dont want to add nextjs as a dependency in api package, keeping it framework-agnostic for a while.
import type { NextApiRequest } from "../../../apps/web/node_modules/next";
import type { NextRequest } from "../../../apps/web/node_modules/next/server";

// Type representing possible request objects
type RequestLike =
  | NextApiRequest
  | NextRequest
  | IncomingMessage
  | {
      headers: Headers | NodeJS.Dict<string | string[]>;
      ip?: string;
      socket?: { remoteAddress?: string };
      connection?: { remoteAddress?: string };
    };

type HeadersLike = Headers | NodeJS.Dict<string | string[]>;

// Helper to safely get header values
function getHeader(
  headers: HeadersLike | undefined,
  name: string
): string | null {
  if (!headers) {
    return null;
  }
  const lowerCaseName = name.toLowerCase();
  if (headers instanceof Headers) {
    return headers.get(lowerCaseName);
  }
  const headerValue = headers[lowerCaseName] ?? headers[name];
  if (Array.isArray(headerValue) && headerValue[0]) {
    return headerValue[0];
  }
  if (typeof headerValue === "string") {
    return headerValue;
  }
  return null;
}

// Optional IP validation
function isValidIp(ip: string | null | undefined): ip is string {
  if (!ip) {
    return false;
  }
  // Basic check if ipaddr.js is not installed
  if (typeof ipaddr === "undefined") {
    // Basic check (very permissive):
    // return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^::|^[0-9a-f:]+$/i.test(ip);
    return true; // Assume valid if library isn't present
  }

  try {
    ipaddr.parse(ip);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Extracts the client's IP address from various request types in Next.js.
 * Checks standard and platform-specific headers, handles proxies, falls back.
 */

export function getIpFromRequest(
  req: RequestLike,
  options: { trustHeaders?: string[]; validateIp?: boolean } = {}
): string | null {
  const {
    trustHeaders = [
      // Prioritize headers based on your infra
      "cf-connecting-ip", // Cloudflare
      "x-vercel-forwarded-for", // Vercel
      "x-real-ip", // Nginx, Common Proxies
      "x-forwarded-for", // Standard, but handle carefully
    ],
    validateIp = typeof ipaddr !== "undefined",
  } = options;

  const headers = "headers" in req ? req.headers : undefined;

  // 1. Check NextRequest's 'ip' property (App Router / Middleware - often reliable)
  if ("ip" in req && req.ip && (!validateIp || isValidIp(req.ip))) {
    return req.ip;
  }

  // 2. Check trusted headers
  if (headers) {
    for (const headerName of trustHeaders) {
      let ip = getHeader(headers, headerName);
      if (ip) {
        if (headerName.toLowerCase() === "x-forwarded-for") {
          const ips = ip
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (ips[0]) {
            ip = ips[0];
          }
        }
        if (ip && (!validateIp || isValidIp(ip))) {
          return ip;
        }
      }
    }
  }

  // 3. Fallback to direct connection (less reliable behind proxies)
  let directIp: string | undefined | null = null;
  if ("socket" in req && req.socket?.remoteAddress) {
    directIp = req.socket.remoteAddress;
  } else if ("connection" in req && req.connection?.remoteAddress) {
    directIp = req.connection.remoteAddress;
  }
  // Clean '::ffff:' prefix for IPv4 mapped addresses
  if (directIp?.startsWith("::ffff:")) {
    directIp = directIp.substring(7);
  }
  if (directIp && (!validateIp || isValidIp(directIp))) {
    return directIp;
  }

  // 4. Last check on req.ip if validation initially failed
  if ("ip" in req && req.ip && (!validateIp || isValidIp(req.ip))) {
    return req.ip;
  }

  return null; // Could not determine IP
}
