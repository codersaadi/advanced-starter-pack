import type { SupportedLocales } from '@repo/i18n/settings';
import Link, { type LinkProps as NextLinkProps } from 'next/link';
import type React from 'react'; // Keep for React.ReactNode, React.Ref
import { useActiveLocale } from '../hooks/useActiveLocale';

export interface LocalizedLinkProps
  extends Omit<NextLinkProps, 'locale' | 'href'>, // Omit NextLink's locale and href
    // We don't need to extend AnchorHTMLAttributes directly if NextLinkProps already covers common ones
    // and we type `ref` specifically. But if you need more specific anchor props, you can add them.
    Pick<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'className' | 'target' | 'rel' /* add others as needed */
    > {
  /**
   * The path or URL to navigate to. Can be a string or a URL object.
   */
  href: NextLinkProps['href'];
  /**
   * Optionally override the locale for this specific link.
   * Defaults to the current active locale.
   * Set to `false` to opt-out of Next.js i18n routing for this link.
   */
  locale?: SupportedLocales | false;
  children: React.ReactNode;
  // `ref` is now a standard prop for function components in React 19
  ref?: React.Ref<HTMLAnchorElement>; // Explicitly type the ref prop
}

/**
 * A wrapper around `next/link` that automatically sets the `locale` prop
 * based on the current active locale or an explicitly provided one.
 * Compatible with React 19's direct ref handling.
 */
export function LocalizedLink({
  href,
  locale: explicitLocale,
  children,
  ref, // Destructure the ref prop
  ...restProps
}: LocalizedLinkProps) {
  const activeLocale = useActiveLocale();

  const linkLocale =
    explicitLocale === undefined ? activeLocale : explicitLocale;

  return (
    <Link href={href} locale={linkLocale} {...restProps} ref={ref}>
      {' '}
      {/* Pass the ref directly */}
      {children}
    </Link>
  );
}

// Setting displayName is still good practice for debugging tools
LocalizedLink.displayName = 'LocalizedLink';
