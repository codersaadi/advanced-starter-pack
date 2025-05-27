import { SignIn } from '@clerk/nextjs';
import { enableClerk } from '@repo/core/config/auth';
import { BRANDING_NAME } from '@repo/core/const/branding';
import {
  type DynamicLayoutProps,
  RouteVariants,
} from '@repo/i18n/route-variants';

import { metadataModule } from '@repo/core/utils/metadata';
import { translation } from '@repo/i18n/translation';
import { notFound } from 'next/navigation';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('clerk', locale);
  return metadataModule.generate({
    description: t('signIn.start.subtitle'),
    title: t('signIn.start.title', { applicationName: BRANDING_NAME }),
    url: '/login',
  });
};

const Page = () => {
  if (!enableClerk) return notFound();

  return <SignIn path="/login" />;
};

Page.displayName = 'Login';

export default Page;
