'use client';

import { useIsMobile } from '@repo/ui/hooks/use-mobile';
import type { Loader } from 'next/dist/shared/lib/dynamic';
import dynamic from 'next/dynamic';
import { type FC, memo } from 'react';
import MobileSwitchLoading from '../../loading/mobile-switch-loading';

interface ClientResponsiveContentProps {
  Desktop: FC;
  Mobile: Loader;
}

const ClientResponsiveContent = ({
  Mobile,
  Desktop,
}: ClientResponsiveContentProps) => {
  const MobileComponent = dynamic(Mobile, {
    loading: MobileSwitchLoading,
    ssr: false,
  });

  const Content = memo(() => {
    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    const mobile = useIsMobile();

    return mobile ? <MobileComponent /> : <Desktop />;
  });

  Content.displayName = 'ClientResponsiveContent';

  return Content;
};

export default ClientResponsiveContent;
