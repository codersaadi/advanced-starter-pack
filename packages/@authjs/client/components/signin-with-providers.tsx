'use client';
import { useMemo } from 'react';

import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';
import { GithubIcon, GoogleIcon } from './auth-icons';

export type AvailableProviders = 'credentials' | 'github' | 'google' | 'email';

interface Provider {
  name: string;
  Icon: React.FC<{
    size: number;
    className?: string;
  }>;
}
export interface SigninWithProvidersProps {
  action: (provider: AvailableProviders) => Promise<void>;
  withDescription?: boolean;
  orPosition?: 'top' | 'bottom';
}
export default function SigninWithProviders({
  action,
  orPosition,
  withDescription,
}: SigninWithProvidersProps) {
  // Define your providers array and use `as const` to ensure the type inference
  const providers = useMemo<Provider[]>(
    () => [
      {
        name: 'google',
        Icon: GoogleIcon,
      },
      {
        name: 'github',
        Icon: GithubIcon,
      },
    ],
    []
  );

  return (
    <div className="w-full space-y-6 py-2">
      {orPosition === 'top' && <OrComponent />}
      <div
        className={cn(
          'grid w-full place-content-center place-items-center gap-4 ',
          withDescription ? 'grid-cols-1' : 'grid-cols-3 '
        )}
      >
        {providers.map((provider) => (
          <Button
            key={provider.name}
            onClick={() => action(provider.name as AvailableProviders)}
            className={cn(
              '',
              withDescription
                ? 'w-full gap-3 rounded-md px-4 py-2'
                : 'aspect-square rounded-full p-2'
            )}
          >
            <provider.Icon size={24} />
            {withDescription && (
              <span className="text-sm ">Continue with {provider.name}</span>
            )}
          </Button>
        ))}
      </div>
      {orPosition === 'bottom' && <OrComponent />}
    </div>
  );
}

function OrComponent() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full border-gray-300 border-t dark:border-gray-600" />
      <span className="w-full text-nowrap px-3 text-gray-500 text-sm dark:text-gray-400">
        or continue with
      </span>
      <div className="w-full border-gray-300 border-t dark:border-gray-600" />
    </div>
  );
}
