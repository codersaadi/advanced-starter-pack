'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/ui/tabs'; // Ensure path
import { LockIcon, MailIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MagicLinkSection } from './magic-link-section';
import { OAuthProvidersList } from './oauth-providers-list';
import type { AuthMethodTabsProps } from './types';

export const AuthMethodTabs = memo(
  ({
    activeTab,
    onTabChange,
    oAuthProviders,
    onSignIn,
    loadingProvider,
  }: AuthMethodTabsProps) => {
    const { t } = useTranslation('signin');

    return (
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted/30 p-1 backdrop-blur-sm">
          <TabsTrigger
            value="oauth"
            className="h-10 rounded-lg bg-transparent font-medium text-sm transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm" // Adjusted shadow
          >
            <div className="flex items-center space-x-2">
              <LockIcon className="h-4 w-4" />
              <span>{t('tabs.sso')}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="magic"
            className="h-10 rounded-lg bg-transparent font-medium text-sm transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm" // Adjusted shadow
          >
            <div className="flex items-center space-x-2">
              <MailIcon className="h-4 w-4" />
              <span>{t('tabs.email')}</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oauth" className="mt-6 space-y-4">
          <OAuthProvidersList
            providers={oAuthProviders}
            onSignIn={onSignIn}
            loadingProvider={loadingProvider}
          />
        </TabsContent>
        <TabsContent value="magic" className="mt-6">
          <MagicLinkSection />
        </TabsContent>
      </Tabs>
    );
  }
);
AuthMethodTabs.displayName = 'AuthMethodTabs';

export const NoAuthMethodsMessage = memo(() => {
  const { t } = useTranslation('signin');
  return (
    <div className="py-8 text-center md:py-12">
      {' '}
      {/* Added padding */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 ring-1 ring-border/50 md:h-20 md:w-20">
        <div className="h-8 w-8 rounded-xl border-2 border-muted-foreground/30 border-dashed md:h-10 md:w-10" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground text-lg">
        {t('noMethods.title')}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t('noMethods.description')}
      </p>
    </div>
  );
});
NoAuthMethodsMessage.displayName = 'NoAuthMethodsMessage';
