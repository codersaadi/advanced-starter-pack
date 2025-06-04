'use client';

import { useIsMobile } from '@repo/ui/hooks/use-mobile';
import dynamic from 'next/dynamic';
import { type FC, type PropsWithChildren, memo } from 'react';
import MobileSwitchLoading from '../../loading/mobile-switch-loading';

interface ClientResponsiveLayoutProps {
  Desktop: FC<PropsWithChildren>;
  Mobile: () => Promise<{ default: FC<PropsWithChildren> }>;
}

const ClientResponsiveLayout = ({
  Desktop,
  Mobile,
}: ClientResponsiveLayoutProps) => {
  const MobileComponent = dynamic(Mobile, {
    loading: () => <MobileSwitchLoading />,
    ssr: false,
  });

  const isMobile = useIsMobile();

  const Layout = memo<PropsWithChildren>(({ children }) => {
    return isMobile ? (
      <MobileComponent>{children}</MobileComponent>
    ) : (
      <Desktop>{children}</Desktop>
    );
  });

  Layout.displayName = 'ClientLayout';

  return Layout;
};

export default ClientResponsiveLayout;
