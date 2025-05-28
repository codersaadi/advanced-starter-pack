// hooks/useLocalizedNavigation.ts
"use client";

import { RouteVariants } from "@repo/i18n/route-variants"; // Your route variants helper
import type { SupportedLocales } from "@repo/i18n/settings";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export function useLocalizedNavigation() {
  const router = useRouter(); // from 'next/navigation'
  const pathname = usePathname(); // Current path *without* locale if middleware rewrites
  // Or *with* locale segment if you don't rewrite away the segment for client router
  const params = useParams(); // Contains route params, including your `variants` or `lng`
  const { i18n } = useTranslation();

  // Function to get the current base path without the old locale/variant segment
  const getBasePath = useCallback(() => {
    // Logic depends on how your RouteVariants and middleware work.
    // If `pathname` already has the variant segment stripped by middleware for client-side routing:
    // return pathname;

    // If `pathname` includes the old variant (e.g. /en__.../foo), we need to strip it.
    // This is a simplified example; your RouteVariants might have a deserialize or strip method.
    const currentVariantsSegment = params.variants as string; // From your RootLayout
    if (pathname.startsWith(`/${currentVariantsSegment}`)) {
      return pathname.substring(`/${currentVariantsSegment}`.length) || "/";
    }
    return pathname; // Fallback
  }, [pathname, params.variants]);

  const changeLanguage = useCallback(
    (newLocale: SupportedLocales) => {
      // 1. Change i18next language (this will trigger listeners for dir, dayjs etc.)
      if (i18n.language !== newLocale) {
        i18n.changeLanguage(newLocale).catch(console.error);
      }

      // 2. Navigate to the new localized path
      // Deserialize current variants to get theme and isMobile
      const currentDeserialized = RouteVariants.deserializeVariants(
        params.variants as string
      );
      const newVariants = RouteVariants.serializeVariants({
        locale: newLocale,
        theme: currentDeserialized.theme, // Keep current theme
        isMobile: currentDeserialized.isMobile, // Keep current mobile state
      });

      const basePath = getBasePath(); // Get current page path without old variant
      const newPath = `/${newVariants}${basePath === "/" && basePath.length > 1 ? "" : basePath}`;

      router.push(newPath);
    },
    [i18n, router, params.variants, getBasePath]
  );

  // You can add localizedPush/Replace if needed, but they would mostly just call changeLanguage
  // or construct the path similarly if only the path changes but not the locale.
  // For most cases, `Link` component with the correct href or `router.push` with full new path works.

  return {
    changeLanguage,
  };
}
