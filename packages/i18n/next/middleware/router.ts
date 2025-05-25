import {
  ORG_LOCALE_HEADER,
  cookieName,
  fallbackLng,
  languages,
} from '@repo/i18n/settings';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { type NextRequest, NextResponse } from 'next/server';

export interface Config {
  locales: readonly string[];
  defaultLocale: string;
  localeCookie?: string;
  localeDetector?: ((request: NextRequest, config: Config) => string) | false;
  prefixDefault?: boolean;
  noPrefix?: boolean;
  basePath?: string;
  serverSetCookie?: 'if-empty' | 'always' | 'never';
  cookieOptions?: Partial<ResponseCookie>;
}

import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function defaultLocaleDetector(request: NextRequest, config: Config): string {
  const negotiatorHeaders: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  // match can only use specifically formatted locales
  // https://stackoverflow.com/questions/76447732/nextjs-13-i18n-incorrect-locale-information-provided
  try {
    return match(languages, config.locales, config.defaultLocale);
  } catch (_e) {
    // invalid accept-language header

    return config.defaultLocale;
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity:
function i18nRouter(request: NextRequest, config: Config): NextResponse {
  if (!request) {
    throw new Error('i18nRouter requires a request argument.');
  }

  if (!config) {
    throw new Error('i18nRouter requires a config argument');
  }

  const {
    locales,
    defaultLocale,
    localeCookie = 'NEXT_LOCALE',
    localeDetector = defaultLocaleDetector,
    prefixDefault = false,
    basePath = '',
    serverSetCookie = 'always',
    noPrefix = false,
    cookieOptions = {
      path: request.nextUrl.basePath || undefined,
      sameSite: 'strict',
      maxAge: 31536000, // one year
    },
  } = config;

  validateConfig(config);

  const pathname = request.nextUrl.pathname;
  const basePathTrailingSlash = basePath.endsWith('/');

  const responseOptions = {
    request: {
      headers: new Headers(request.headers),
    },
  };

  let response = NextResponse.next(responseOptions);

  // biome-ignore lint/suspicious/noImplicitAnyLet:
  // biome-ignore lint/suspicious/noEvolvingTypes:
  let cookieLocale;
  // check cookie for locale
  if (localeCookie) {
    const cookieValue = request.cookies.get(localeCookie)?.value;

    if (cookieValue && config.locales.includes(cookieValue)) {
      cookieLocale = cookieValue;
    }
  }

  const pathLocale = noPrefix
    ? undefined
    : locales.find(
        (locale) =>
          pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
      );

  if (pathLocale) {
    if (
      cookieLocale &&
      cookieLocale !== pathLocale &&
      serverSetCookie !== 'always'
    ) {
      // if always, do not redirect to cookieLocale
      let newPath = pathname.replace(`/${pathLocale}`, `/${cookieLocale}`);

      if (request.nextUrl.search) {
        newPath += request.nextUrl.search;
      }

      if (basePathTrailingSlash) {
        newPath = newPath.slice(1);
      }

      newPath = `${basePath}${newPath}`;

      response = NextResponse.redirect(new URL(newPath, request.url));
    }

    // If /default, redirect to /
    if (!prefixDefault && pathLocale === defaultLocale) {
      let pathWithoutLocale = pathname.slice(`/${pathLocale}`.length) || '/';

      if (basePathTrailingSlash) {
        pathWithoutLocale = pathWithoutLocale.slice(1);
      }

      if (request.nextUrl.search) {
        pathWithoutLocale += request.nextUrl.search;
      }

      response = NextResponse.redirect(
        new URL(`${basePath}${pathWithoutLocale}`, request.url)
      );
    }

    const setCookie = () => {
      response.cookies.set(localeCookie, pathLocale, cookieOptions);
    };

    if (serverSetCookie !== 'never') {
      if (
        cookieLocale &&
        cookieLocale !== pathLocale &&
        serverSetCookie === 'always'
      ) {
        setCookie();
      } else if (!cookieLocale) {
        setCookie();
      }
    }
  } else {
    let locale = cookieLocale;

    // if no cookie, detect locale with localeDetector
    if (!locale) {
      if (localeDetector === false) {
        locale = defaultLocale;
      } else {
        locale = localeDetector(request, config);
      }
    }

    if (!locales.includes(locale)) {
      // biome-ignore lint/suspicious/noConsole: minor warning
      console.warn(
        'The localeDetector callback must return a locale included in your locales array. Reverting to using defaultLocale.'
      );

      locale = defaultLocale;
    }

    let newPath = `${locale}${pathname}`;

    // this avoids double redirect: / => /en/ => /en
    if (pathname === '/') {
      newPath = newPath.slice(0, -1);
    }

    newPath = `${basePath}${basePathTrailingSlash ? '' : '/'}${newPath}`;

    if (request.nextUrl.search) {
      newPath += request.nextUrl.search;
    }

    if (noPrefix) {
      response = NextResponse.rewrite(
        new URL(newPath, request.url),
        responseOptions
      );
    } else if (prefixDefault || locale !== defaultLocale) {
      return NextResponse.redirect(new URL(newPath, request.url));
    } else {
      // prefixDefault is false and using default locale
      response = NextResponse.rewrite(
        new URL(newPath, request.url),
        responseOptions
      );
    }
  }

  response.headers.set(ORG_LOCALE_HEADER, pathLocale || defaultLocale);

  return response;
}

function validateConfig(config: Config): void {
  if (!Array.isArray(config.locales)) {
    throw new Error(`The config requires a 'locales' array.`);
  }

  if (!config.defaultLocale) {
    throw new Error(`The config requires a 'defaultLocale'.`);
  }

  if (!config.locales.includes(config.defaultLocale)) {
    throw new Error(
      `The 'defaultLocale' must be contained in 'locales' array.`
    );
  }

  if (config.localeDetector && typeof config.localeDetector !== 'function') {
    throw new Error(`'localeDetector' must be a function.`);
  }

  if (config.cookieOptions && typeof config.cookieOptions !== 'object') {
    throw new Error(`'cookieOptions' must be an object.`);
  }

  if (config.serverSetCookie) {
    const validOptions = ['if-empty', 'always', 'never'];
    if (!validOptions.includes(config.serverSetCookie)) {
      throw new Error(
        `Invalid 'serverSetCookie' value. Valid values are ${validOptions.join(
          ' | '
        )}`
      );
    }
  }
}

export const i18nMiddleware = (request: NextRequest) => {
  return i18nRouter(request, {
    locales: [...languages],
    defaultLocale: fallbackLng,
    localeCookie: cookieName,
  });
};
