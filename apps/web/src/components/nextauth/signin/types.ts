import type React from 'react';

export interface ProviderConfig {
  name: string; // Base name, can be a translation key or fallback
  description: string; // Base description
  colors: string;
  gradient: string;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  pageTitle: string; // For the H1 above the card
  pageSubtitle: string; // For the P above the card
  cardTitle: string; // For the CardTitle
  cardSubtitle: string; // For the CardDescription
  showLogoAndWelcome?: boolean;
  cardContentClassName?: string;
}

export interface ProviderButtonProps {
  provider: string;
  onSignIn: (provider: string) => void;
  isLoading: boolean;
}

export interface OAuthProvidersListProps {
  providers: string[] | null | undefined;
  onSignIn: (provider: string) => void;
  loadingProvider: string | null;
}

export interface AuthMethodTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  oAuthProviders: string[] | null | undefined;
  onSignIn: (provider: string) => void;
  loadingProvider: string | null;
}

export interface ErrorAlertProps {
  error: string | null;
}

// For MagicSignInForm, assuming it has props like this
export interface MagicSignInFormProps {
  onSubmitAction: (data: { email: string; callbackUrl?: string }) => Promise<{
    message: string;
    success: boolean;
  }>;
}
