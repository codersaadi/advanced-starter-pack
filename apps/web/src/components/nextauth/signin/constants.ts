import type { ProviderConfig } from "./types";

export const isMagicLinkEnabled = process.env.NEXT_PUBLIC_MAGIC_LINK === "1"; // Or however authEnv.NEXT_PUBLIC_MAGIC_LINK is sourced

export const DEFAULT_CALLBACK_URL = "/dashboard";

export const CARD_CONTENT_CLASSNAME = "space-y-6 p-6 md:p-8";

export const defaultProviderConfig: ProviderConfig = {
  name: "providers.default.name", // Translation key
  description: "providers.default.description", // Translation key
  colors:
    "hover:bg-accent/80 hover:border-accent-foreground/20 hover:shadow-accent/20",
  gradient: "from-accent/10 to-accent/5",
};

// Base configurations without direct t() calls. Translations will be applied in the component.
export const PROVIDER_CONFIGS: Record<
  string,
  Omit<ProviderConfig, "name" | "description"> & {
    nameKey: string;
    descriptionKey: string;
  }
> = {
  auth0: {
    nameKey: "providers.auth0.name",
    descriptionKey: "providers.auth0.description",
    colors:
      "hover:bg-orange-50/80 hover:border-orange-200/50 hover:shadow-orange-100/50 dark:hover:bg-orange-950/20 dark:hover:border-orange-800/50",
    gradient: "from-orange-500/10 to-orange-600/5",
  },
  authentik: {
    nameKey: "providers.authentik.name",
    descriptionKey: "providers.authentik.description",
    colors:
      "hover:bg-blue-50/80 hover:border-blue-200/50 hover:shadow-blue-100/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800/50",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  "azure-ad": {
    nameKey: "providers.azureAd.name",
    descriptionKey: "providers.azureAd.description",
    colors:
      "hover:bg-blue-50/80 hover:border-blue-200/50 hover:shadow-blue-100/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800/50",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  "generic-oidc": {
    nameKey: "providers.genericOidc.name",
    descriptionKey: "providers.genericOidc.description",
    colors:
      "hover:bg-slate-50/80 hover:border-slate-200/50 hover:shadow-slate-100/50 dark:hover:bg-slate-950/20 dark:hover:border-slate-800/50",
    gradient: "from-slate-500/10 to-slate-600/5",
  },
  github: {
    nameKey: "providers.github.name",
    descriptionKey: "providers.github.description",
    colors:
      "hover:bg-gray-50/80 hover:border-gray-200/50 hover:shadow-gray-100/50 dark:hover:bg-gray-950/20 dark:hover:border-gray-800/50",
    gradient: "from-gray-500/10 to-gray-600/5",
  },
  zitadel: {
    nameKey: "providers.zitadel.name",
    descriptionKey: "providers.zitadel.description",
    colors:
      "hover:bg-purple-50/80 hover:border-purple-200/50 hover:shadow-purple-100/50 dark:hover:bg-purple-950/20 dark:hover:border-purple-800/50",
    gradient: "from-purple-500/10 to-purple-600/5",
  },
  authelia: {
    nameKey: "providers.authelia.name",
    descriptionKey: "providers.authelia.description",
    colors:
      "hover:bg-indigo-50/80 hover:border-indigo-200/50 hover:shadow-indigo-100/50 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-800/50",
    gradient: "from-indigo-500/10 to-indigo-600/5",
  },
  logto: {
    nameKey: "providers.logto.name",
    descriptionKey: "providers.logto.description",
    colors:
      "hover:bg-violet-50/80 hover:border-violet-200/50 hover:shadow-violet-100/50 dark:hover:bg-violet-950/20 dark:hover:border-violet-800/50",
    gradient: "from-violet-500/10 to-violet-600/5",
  },
  "cloudflare-zero-trust": {
    nameKey: "providers.cloudflareZeroTrust.name",
    descriptionKey: "providers.cloudflareZeroTrust.description",
    colors:
      "hover:bg-orange-50/80 hover:border-orange-200/50 hover:shadow-orange-100/50 dark:hover:bg-orange-950/20 dark:hover:border-orange-800/50",
    gradient: "from-orange-500/10 to-orange-600/5",
  },
  casdoor: {
    nameKey: "providers.casdoor.name",
    descriptionKey: "providers.casdoor.description",
    colors:
      "hover:bg-emerald-50/80 hover:border-emerald-200/50 hover:shadow-emerald-100/50 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-800/50",
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
  "microsoft-entra-id": {
    nameKey: "providers.microsoftEntraId.name",
    descriptionKey: "providers.microsoftEntraId.description",
    colors:
      "hover:bg-blue-50/80 hover:border-blue-200/50 hover:shadow-blue-100/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-800/50",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  wechat: {
    nameKey: "providers.wechat.name",
    descriptionKey: "providers.wechat.description",
    colors:
      "hover:bg-green-50/80 hover:border-green-200/50 hover:shadow-green-100/50 dark:hover:bg-green-950/20 dark:hover:border-green-800/50",
    gradient: "from-green-500/10 to-green-600/5",
  },
  keycloak: {
    nameKey: "providers.keycloak.name",
    descriptionKey: "providers.keycloak.description",
    colors:
      "hover:bg-red-50/80 hover:border-red-200/50 hover:shadow-red-100/50 dark:hover:bg-red-950/20 dark:hover:border-red-800/50",
    gradient: "from-red-500/10 to-red-600/5",
  },
  // 'default' is handled by defaultProviderConfig and interpolation in ProviderButton
};

// next-auth error type
type ErrorType =
  | "AccessDenied"
  | "AdapterError"
  | "CallbackRouteError"
  | "ErrorPageLoop"
  | "EventError"
  | "InvalidCallbackUrl"
  | "CredentialsSignin"
  | "InvalidEndpoints"
  | "InvalidCheck"
  | "JWTSessionError"
  | "MissingAdapter"
  | "MissingAdapterMethods"
  | "MissingAuthorize"
  | "MissingSecret"
  | "OAuthAccountNotLinked"
  | "OAuthCallbackError"
  | "OAuthProfileParseError"
  | "SessionTokenError"
  | "OAuthSignInError"
  | "EmailSignInError"
  | "SignOutError"
  | "UnknownAction"
  | "UnsupportedStrategy"
  | "InvalidProvider"
  | "UntrustedHost"
  | "Verification"
  | "MissingCSRF"
  | "AccountNotLinked"
  | "DuplicateConditionalUI"
  | "MissingWebAuthnAutocomplete"
  | "WebAuthnVerificationError"
  | "ExperimentalFeatureNotEnabled";

export const ERROR_KEY_MAP = {
  USER_NOT_FOUND_REQUEST: "errors.AccountNotFound", // Changed to be full key
  OAuthSignin: "errors.OAuthSignin",
  OAuthCallback: "errors.OAuthCallback",
  OAuthCreateAccount: "errors.OAuthCreateAccount",
  EmailCreateAccount: "errors.EmailCreateAccount",
  Callback: "errors.Callback",
  OAuthAccountNotLinked: "errors.OAuthAccountNotLinked",
  EmailSignin: "errors.EmailSignin",
  CredentialsSignin: "errors.CredentialsSignin",
  SessionRequired: "errors.SessionRequired",
  AccessDenied: "errors.AccessDenied",
  // Add a generic fallback key
  GenericAuthError: "errors.generic", // For AuthError default
  GenericError: "errors.generic", // For other errors
} as const;
const errorValues = Object.values(ERROR_KEY_MAP);
export type AuthErrorKeyMapValue = (typeof errorValues)[number];
