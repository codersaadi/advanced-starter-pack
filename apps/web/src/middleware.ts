import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { OAUTH_AUTHORIZED } from "@repo/core/config/auth";
import { ORG_THEME_APPEARANCE } from "@repo/core/const/theme";
// Currently in Beta
// ../../node_modules/.pnpm/@arcjet+runtime@1.0.0-beta.5/node_modules/@arcjet/runtime/index.js
// A Node.js API is used (process.release at line: 42) which is not supported in the Edge Runtime.
// import {
//   noseconeMiddleware,
//   noseconeOptions,
//   noseconeOptionsWithToolbar,
// } from "@repo/core/libs/arcjet/middleware";
import NextAuthEdge from "@repo/core/libs/next-auth/edge";
import { RouteVariants } from "@repo/core/utils/route-variants";
import env from "@repo/env/app";
import { authEnv } from "@repo/env/auth";
import { oidcEnv } from "@repo/env/oidc";
import {
  ORG_LOCALE_HEADER,
  type SupportedLocales,
} from "@repo/i18n/config/client";
import { parseBrowserLanguage } from "@repo/i18n/utils/parse-locale";
import debug from "debug";
import { type NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import urlJoin from "url-join";

// Create debug logger instances
const logDefault = debug("org-middleware:default");
const logNextAuth = debug("org-middleware:next-auth");
const logClerk = debug("org-middleware:clerk");
// const logSecurity = debug("org-middleware:security");

// OIDC session pre-sync constant
const OIDC_SESSION_HEADER = "x-oidc-session-sync";

const backendApiEndpoints = ["/api", "/trpc", "/webapi", "/oidc"];

// Security middleware configuration
// const securityHeaders = process.env.FLAGS_SECRET
//   ? noseconeMiddleware(noseconeOptionsWithToolbar)
//   : noseconeMiddleware(noseconeOptions);

// const applyArcjetSecurity = async (request: NextRequest) => {
//   if (!process.env.ARCJET_KEY) {
//     logSecurity("Arcjet key not found, applying security headers only");
//     return securityHeaders();
//   }

//   try {
//     logSecurity("Applying Arcjet security rules");
//     await secure(
//       [
//         // See https://docs.arcjet.com/bot-protection/identifying-bots
//         "CATEGORY:SEARCH_ENGINE", // Allow search engines
//         "CATEGORY:PREVIEW", // Allow preview links to show OG images
//         "CATEGORY:MONITOR", // Allow uptime monitoring services
//       ],
//       request
//     );

//     logSecurity("Arcjet security check passed");
//     return securityHeaders();
//   } catch (error) {
//     logSecurity("Arcjet security check failed: %O", error);
//     const message =
//       error instanceof Error ? error.message : "Security check failed";
//     return NextResponse.json({ error: message }, { status: 403 });
//   }
// };

const defaultMiddleware = async (request: NextRequest) => {
  const url = new URL(request.url);
  logDefault("Processing request: %s %s", request.method, request.url);

  // Apply security first for all requests
  // const securityResponse = await applyArcjetSecurity(request);
  // if (securityResponse.status === 403) {
  //   logDefault("Request blocked by security middleware");
  //   return securityResponse;
  // }

  // skip all api requests for route processing
  if (backendApiEndpoints.some((path) => url.pathname.startsWith(path))) {
    logDefault("Skipping API request route processing: %s", url.pathname);
    return NextResponse.next();
  }

  // if it's a new user, there's no cookie
  // So we need to use the fallback language parsed by accept-language
  const browserLanguage = parseBrowserLanguage(request.headers);
  const locale = (request.cookies.get(ORG_LOCALE_HEADER)?.value ||
    browserLanguage) as SupportedLocales;

  const ua = request.headers.get("user-agent");
  const device = new UAParser(ua || "").getDevice();

  logDefault("User preferences: %O", {
    browserLanguage,
    deviceType: device.type,
    hasCookies: {
      locale: !!request.cookies.get(ORG_LOCALE_HEADER)?.value,
      theme: !!request.cookies.get(ORG_THEME_APPEARANCE)?.value,
    },
    locale,
  });

  // Create normalized preference values
  const route = RouteVariants.serializeVariants({
    isMobile: device.type === "mobile",
    locale,
  });

  logDefault("Serialized route variant: %s", route);

  // if app is in docker, rewrite to self container
  // https://github.com/orghub/org-chat/issues/5876
  if (env.MIDDLEWARE_REWRITE_THROUGH_LOCAL) {
    logDefault("Local container rewrite enabled: %O", {
      host: "127.0.0.1",
      original: url.toString(),
      port: process.env.PORT || "3210",
      protocol: "http",
    });

    url.protocol = "http";
    url.host = "127.0.0.1";
    url.port = process.env.PORT || "3210";
  }

  // new handle segment rewrite: /${route}${originalPathname}
  // / -> /zh-CN__0__dark
  // /discover -> /zh-CN__0__dark/discover
  const nextPathname = `/${route}${url.pathname === "/" ? "" : url.pathname}`;
  const nextURL = env.MIDDLEWARE_REWRITE_THROUGH_LOCAL
    ? urlJoin(url.origin, nextPathname)
    : nextPathname;

  logDefault("URL rewrite: %O", {
    isLocalRewrite: env.MIDDLEWARE_REWRITE_THROUGH_LOCAL,
    nextPathname: nextPathname,
    nextURL: nextURL,
    originalPathname: url.pathname,
  });

  url.pathname = nextPathname;

  return NextResponse.rewrite(url, { status: 200 });
};

const isProtectedRoute = createRouteMatcher([
  "/files(.*)",
  "/onboard(.*)",
  "/oauth(.*)",
  "/dashboard(.*)",
  // ↓ cloud ↓
]);

// Initialize an Edge compatible NextAuth middleware
const nextAuthMiddleware = NextAuthEdge.auth(async (req) => {
  logNextAuth(
    "NextAuth middleware processing request: %s %s",
    req.method,
    req.url
  );

  // Apply security first
  // const securityResponse = await applyArcjetSecurity(req);
  // if (securityResponse.status === 403) {
  //   logNextAuth("Request blocked by security middleware");
  //   return securityResponse;
  // }

  const response = await defaultMiddleware(req);

  const isProtected = isProtectedRoute(req);
  logNextAuth(
    "Route protection status: %s, %s",
    req.url,
    isProtected ? "protected" : "public"
  );

  // Just check if session exists
  const session = req.auth;
  const isLoggedIn = !!session?.expires;

  logNextAuth("NextAuth session status: %O", {
    expires: session?.expires,
    isLoggedIn,
    userId: session?.user?.id,
  });

  // Remove & amend OAuth authorized header
  response.headers.delete(OAUTH_AUTHORIZED);
  if (isLoggedIn) {
    logNextAuth("Setting auth header: %s = %s", OAUTH_AUTHORIZED, "true");
    response.headers.set(OAUTH_AUTHORIZED, "true");

    // If OIDC is enabled and user is logged in, add OIDC session pre-sync header
    if (oidcEnv.ENABLE_OIDC && session?.user?.id) {
      logNextAuth(
        "OIDC session pre-sync: Setting %s = %s",
        OIDC_SESSION_HEADER,
        session.user.id
      );
      response.headers.set(OIDC_SESSION_HEADER, session.user.id);
    }
  } else {
    // If request a protected route, redirect to sign-in page
    if (isProtected) {
      logNextAuth("Request a protected route, redirecting to sign-in page");
      const nextLoginUrl = new URL("/next-auth/signin", req.nextUrl.origin);
      nextLoginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return Response.redirect(nextLoginUrl);
    }
    logNextAuth(
      "Request a free route but not login, allow visit without auth header"
    );
  }

  return response;
});

const clerkAuthMiddleware = clerkMiddleware(
  async (auth, req) => {
    logClerk("Clerk middleware processing request: %s %s", req.method, req.url);

    // Apply security first
    // const securityResponse = await applyArcjetSecurity(req);
    // if (securityResponse.status === 403) {
    //   logClerk("Request blocked by security middleware");
    //   return securityResponse;
    // }

    const isProtected = isProtectedRoute(req);
    logClerk(
      "Route protection status: %s, %s",
      req.url,
      isProtected ? "protected" : "public"
    );

    if (isProtected) {
      logClerk("Protecting route: %s", req.url);
      await auth.protect();
    }

    const response = await defaultMiddleware(req);

    const data = await auth();
    logClerk("Clerk auth status: %O", {
      isSignedIn: !!data.userId,
      userId: data.userId,
    });

    // If OIDC is enabled and Clerk user is logged in, add OIDC session pre-sync header
    if (oidcEnv.ENABLE_OIDC && data.userId) {
      logClerk(
        "OIDC session pre-sync: Setting %s = %s",
        OIDC_SESSION_HEADER,
        data.userId
      );
      response.headers.set(OIDC_SESSION_HEADER, data.userId);
    } else if (oidcEnv.ENABLE_OIDC) {
      logClerk("No Clerk user detected, not setting OIDC session sync header");
    }

    return response;
  },
  {
    clockSkewInMs: 60 * 60 * 1000,
    signInUrl: "/login",
    signUpUrl: "/signup",
  }
);

logDefault("Middleware configuration: %O", {
  enableClerk: authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH,
  enableNextAuth: authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH,
  enableOIDC: oidcEnv.ENABLE_OIDC,
  hasArcjetKey: !!process.env.ARCJET_KEY,
});

export default authEnv.NEXT_PUBLIC_ENABLE_CLERK_AUTH
  ? clerkAuthMiddleware
  : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? nextAuthMiddleware
    : defaultMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
