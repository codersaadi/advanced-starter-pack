import type { AppNamespaces } from "@repo/i18n/config/client";
import { isRtl } from "@repo/i18n/utils/rtl";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
/**
 * Hook to get the current text direction ('ltr' or 'rtl') based on the active i18next language.
 * @returns The current text direction.
 */
export function useTextDirection(): "ltr" | "rtl" {
  const { i18n } = useTranslation<AppNamespaces>();
  const [direction, setDirection] = useState<"ltr" | "rtl">(
    isRtl(i18n.language) ? "rtl" : "ltr"
  );

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setDirection(isRtl(lng) ? "rtl" : "ltr");
    };

    // Set initial direction based on current language
    setDirection(isRtl(i18n.language) ? "rtl" : "ltr");

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  return direction;
}
