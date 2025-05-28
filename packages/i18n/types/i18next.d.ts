// packages/i18n/types/i18next.d.ts
import type React from "react";
import type { SupportedLocales } from "../settings";
import type { DefaultNamespace, Resources } from "./generated";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: DefaultNamespace;
    resources: Resources;
    lng: SupportedLocales;
    fallbackLng: SupportedLocales;
    allowObjectInHTMLChildren: true;
    // This is important for proper key inference
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
  }
}

// Extend React's types to accept ReactI18NextChildren
declare module "react" {
  type ReactI18NextChildren = React.ReactNode;
}
