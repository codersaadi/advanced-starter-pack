import type { AppNamespaces, SupportedLocales } from '../settings';
import type { DefaultNamespace, Resources } from './generated'; // Points to generated.d.ts

/**
 * This file augments the i18next module with your app-specific type definitions.
 * It ensures full TypeScript support for your translations.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    /** Your default namespace used for `t` calls without a namespace prefix. */
    defaultNS: DefaultNamespace;

    /** Your application's namespaces. */
    ns: AppNamespaces | readonly AppNamespaces[];

    /** The structure of your translation resources. */
    resources: Resources;

    /** Supported languages for your application. */
    lng: SupportedLocales;

    /** Whether to allow returning objects from translations (for nested structures) */
    returnObjects: true;
  }
}
