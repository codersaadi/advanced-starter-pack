import { SignUp } from '@clerk/nextjs';
import { enableClerk } from '@repo/core/config/auth';
import { serverFeatureFlags } from '@repo/core/config/featureFlags';
import { metadataModule } from '@repo/core/utils/metadata';
import {
  type DynamicLayoutProps,
  RouteVariants,
} from '@repo/core/utils/route-variants';
import { translation } from '@repo/i18n/functions/translation';
import { notFound, redirect } from 'next/navigation';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('clerk', locale);
  return metadataModule.generate({
    description: t('signUp.start.subtitle'),
    title: t('signUp.start.title'),
    url: '/signup',
  });
};

const Page = () => {
  if (!enableClerk) return notFound();

  const enableClerkSignUp = serverFeatureFlags().enableClerkSignUp;

  if (!enableClerkSignUp) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info('Clerk sign-up is disabled. Redirecting to login page.');
    redirect('/login');
  }

  return <SignUp path="/signup" />;
};

Page.displayName = 'SignUp';

export default Page;
