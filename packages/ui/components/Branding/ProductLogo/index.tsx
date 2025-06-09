import { BRANDING_LOGO_URL, BRANDING_NAME } from '@repo/shared/const/branding';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { type HtmlHTMLAttributes, memo } from 'react';
import CustomLogo, { type LogoProps } from './Custom';
interface AcmeProps extends HtmlHTMLAttributes<HTMLDivElement>, LogoProps {
  brandingText: string;
  brandingImage: string | StaticImport;
}
export const ProductLogo = memo<AcmeProps>((props) => {
  return (
    <CustomLogo
      {...props}
      brandingImage={BRANDING_LOGO_URL}
      brandingText={BRANDING_NAME}
    />
  );
});
