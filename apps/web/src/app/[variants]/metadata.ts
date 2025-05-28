import type { DynamicLayoutProps } from '@repo/i18n/route-variants';
import type { Metadata } from 'next';
export const generateMetadata = async (
  props: DynamicLayoutProps
): Promise<Metadata> => {
  // const { t } = await translation("metadata", locale);
  return {
    title: 'Typescript Turborepo',
    description: 'An advanced typesafe turborepo for modern saas applications',
  } satisfies Metadata;
};
