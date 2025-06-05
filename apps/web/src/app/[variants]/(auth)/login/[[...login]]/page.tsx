import { SignIn } from '@clerk/nextjs';
import { enableClerk } from '@repo/shared/config/auth';
import { BRANDING_NAME } from '@repo/shared/const/branding';
import {
  type DynamicLayoutProps,
  RouteVariants,
} from '@repo/shared/utils/route-variants';

import { translation } from '@repo/i18n/functions/translation';
import { metadataModule } from '@repo/shared/utils/metadata';
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
