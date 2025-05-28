import { cn } from '@repo/ui/lib/utils';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import type React from 'react';
import { type ReactNode, forwardRef, memo } from 'react';

// Types
type IconType = React.ForwardRefExoticComponent<
  React.SVGProps<SVGSVGElement> & { size?: string | number }
>;
export type LogoProps = {
  extra?: string;
  size?: number;
  className?: string;
  brandingText: string;
  brandingImage: StaticImport | string;
  style?: React.CSSProperties;
  type?: '3d' | 'flat' | 'mono' | 'text' | 'combine';
};

const CustomTextLogo = memo<{
  size: number;
  style?: React.CSSProperties;
  className?: string;
  brandingText: string;
}>(({ size, style, className, brandingText }) => {
  return (
    <div
      className={cn('select-none font-bold', className)}
      style={{
        height: size,
        fontSize: size / 1.5,
        ...style,
      }}
    >
      {brandingText}
    </div>
  );
});
CustomTextLogo.displayName = 'CustomTextLogo';

const CustomImageLogo = memo<{
  size: number;
  brandingName: string;
  src: string | StaticImport;
  style?: React.CSSProperties;
  className?: string;
}>(({ size, style, className, src, brandingName }) => {
  return (
    <Image
      alt={brandingName}
      height={size}
      width={size}
      src={src}
      unoptimized={true}
      className={className}
      style={style}
    />
  );
});
CustomImageLogo.displayName = 'CustomImageLogo';

const Divider: IconType = forwardRef(
  ({ size = '1em', style, ...rest }, ref) => (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      fill="none"
      height={size}
      ref={ref}
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none leading-none"
      style={style}
      viewBox="0 0 24 24"
      width={size}
      {...rest}
    >
      <path d="M16.88 3.549L7.12 20.451" />
    </svg>
  )
);
Divider.displayName = 'Divider';

const CustomLogo = memo<LogoProps>(
  ({
    extra,
    size = 32,
    className,
    style,
    brandingImage,
    brandingText,
    type,
    ...rest
  }) => {
    let logoComponent: ReactNode;

    switch (type) {
      case '3d':
      case 'flat': {
        logoComponent = (
          <CustomImageLogo
            src={brandingImage}
            brandingName={brandingText}
            size={size}
            style={style}
          />
        );
        break;
      }
      case 'mono': {
        logoComponent = (
          <CustomImageLogo
            src={brandingImage}
            brandingName={brandingText}
            size={size}
            style={{ filter: 'grayscale(100%)', ...style }}
          />
        );
        break;
      }
      case 'text': {
        logoComponent = (
          <CustomTextLogo
            brandingText={brandingText}
            size={size}
            style={style}
          />
        );
        break;
      }
      case 'combine': {
        logoComponent = (
          <>
            <CustomImageLogo
              src={brandingImage}
              brandingName={brandingText}
              size={size}
            />
            <CustomTextLogo
              brandingText={brandingText}
              size={size}
              style={{ marginLeft: Math.round(size / 4) }}
            />
          </>
        );

        if (!extra)
          logoComponent = (
            <div className="flex flex-none items-center" {...rest}>
              {logoComponent}
            </div>
          );

        break;
      }
      default: {
        logoComponent = (
          <CustomImageLogo
            brandingName={brandingText}
            src={brandingImage}
            size={size}
            style={style}
          />
        );
        break;
      }
    }

    if (!extra) return logoComponent;

    const extraSize = Math.round((size / 3) * 1.9);

    return (
      <div className={cn('flex flex-none items-center', className)} {...rest}>
        {logoComponent}
        <Divider size={extraSize} style={{ color: 'var(--color-fill)' }} />
        <div
          className="whitespace-nowrap font-light"
          style={{ fontSize: extraSize }}
        >
          {extra}
        </div>
      </div>
    );
  }
);

CustomLogo.displayName = 'CustomLogo';

export default CustomLogo;
