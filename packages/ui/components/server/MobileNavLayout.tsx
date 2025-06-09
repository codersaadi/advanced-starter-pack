import { cn } from '@repo/ui/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface MobileContentLayoutProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  withNav?: boolean;
  children: ReactNode;
}

const MobileContentLayout = ({
  children,
  withNav,
  style,
  header,
  id = 'lobe-mobile-scroll-container',
  className,
  ...rest
}: MobileContentLayoutProps) => {
  const content = (
    <div
      id={id}
      className={cn(
        'relative h-full w-full overflow-y-auto overflow-x-hidden',
        withNav && 'pb-12', // pb-12 = 48px for TabNav height
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );

  if (!header) return content;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {header}
      <div
        id="lobe-mobile-scroll-container"
        className={cn(
          'relative h-full w-full overflow-y-auto overflow-x-hidden',
          withNav && 'pb-12', // pb-12 = 48px for TabNav height
          className
        )}
        style={style}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
};

MobileContentLayout.displayName = 'MobileContentLayout';

export default MobileContentLayout;
