'use client';

import { memo } from 'react';
import { ProviderButton } from './provider-button';
import type { OAuthProvidersListProps } from './types';

export const OAuthProvidersList = memo(
  ({ providers, onSignIn, loadingProvider }: OAuthProvidersListProps) => {
    if (!providers || providers.length === 0) {
      return null; // Or a message indicating no OAuth providers
    }
    return (
      <div className="space-y-3">
        {providers.map((provider) => (
          <ProviderButton
            key={provider}
            provider={provider}
            onSignIn={onSignIn}
            isLoading={loadingProvider === provider}
          />
        ))}
      </div>
    );
  }
);
OAuthProvidersList.displayName = 'OAuthProvidersList';
