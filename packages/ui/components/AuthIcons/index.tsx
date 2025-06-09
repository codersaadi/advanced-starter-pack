// Import all your icon components
import type React from 'react';
import Auth0Icon from './Auth0';
import AutheliaIcon from './Authelia';
import AuthentikIcon from './Authentik';
import CasdoorIcon from './Casdoor';
import ClerkIcon from './Clerk';
import GoogleIcon from './Google';
import LogtoIcon from './Logto';
import MicrosoftEntraIcon from './MicrosoftEntra';
import NextAuthIcon from './NextAuth'; // Might be a generic icon for next-auth itself
import ZitadelIcon from './Zitadel';

// Default/Fallback Icon (using one of your existing icons or a generic one)
import { KeyRoundIcon as DefaultAuthIcon } from 'lucide-react'; // Example default

// Define the props your icon components expect (from your Auth0.tsx example)
export interface AuthIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  // Add any other common props your icons might take
}

// Create a mapping from provider ID (string) to the icon component
// Ensure the keys here match the strings you get in `oAuthSSOProviders`
// It's good practice to use lowercase keys for consistency.
export const providerIconMap: Record<string, React.FC<AuthIconProps>> = {
  auth0: Auth0Icon,
  authelia: AutheliaIcon,
  authentik: AuthentikIcon,
  casdoor: CasdoorIcon,
  clerk: ClerkIcon,
  logto: LogtoIcon,
  'microsoft-entra-id': MicrosoftEntraIcon, // Example if provider ID has hyphens
  microsoftentra: MicrosoftEntraIcon, // Alias if needed
  nextauth: NextAuthIcon, // Or perhaps this isn't a provider but a concept
  zitadel: ZitadelIcon,
  // Add other providers from your next-auth setup:
  google: GoogleIcon, // Replace with actual Google icon component
  github: DefaultAuthIcon, // Replace with actual GitHub icon component
  // ... etc.
};

// Function to get an icon component
export const getAuthIcon = (providerId?: string): React.FC<AuthIconProps> => {
  if (!providerId) return DefaultAuthIcon;
  return providerIconMap[providerId.toLowerCase()] || DefaultAuthIcon;
};
