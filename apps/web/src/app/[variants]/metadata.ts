import type { DynamicLayoutProps } from '@repo/shared/utils/route-variants';
import type { Metadata } from 'next';
export const generateMetadata = (
  _props: DynamicLayoutProps
): Promise<Metadata> | Metadata => {
  // const { t } = await translation("metadata", locale);
  return {
    title: 'Typescript Turborepo',
    description: 'An advanced typesafe turborepo for modern saas applications',
  } satisfies Metadata;
};
