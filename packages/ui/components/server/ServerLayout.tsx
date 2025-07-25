import type { FC, PropsWithChildren, ReactNode } from 'react';

import type { DynamicLayoutProps } from '@repo/shared/types/next';
import { RouteVariants } from '@repo/shared/utils/route-variants';

interface ServerLayoutProps<T> {
  Desktop: FC<T>;
  Mobile: FC<T>;
}

interface ServerLayoutInnerProps extends DynamicLayoutProps {
  children: ReactNode;
}

const ServerLayout =
  <T extends PropsWithChildren>({
    Desktop,
    Mobile,
  }: ServerLayoutProps<T>): FC<T> =>
  // @ts-expect-error
  async (props: ServerLayoutInnerProps) => {
    const { params: paramsPromise, ...res } = props;
    if (!paramsPromise) {
      throw new Error(
        'paramsPromise is required for ServerLayout, please pass params props to ServerLayout'
      );
    }

    const isMobile = await RouteVariants.getIsMobile(props);

    return isMobile ? <Mobile {...(res as T)} /> : <Desktop {...(res as T)} />;
  };

ServerLayout.displayName = 'ServerLayout';

export default ServerLayout;
