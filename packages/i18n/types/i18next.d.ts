import type { SupportedLocales } from "../config/client";
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
