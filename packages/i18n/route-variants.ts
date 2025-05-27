import {
  type SupportedLocales,
  fallbackLng,
  languages as locales,
} from './settings';

export type ThemeAppearance = 'light' | 'dark';
export interface PageProps<Params, SearchParams = undefined> {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

export type PagePropsWithId = PageProps<{ id: string }>;

export interface DynamicLayoutProps {
  params: Promise<{ variants: string }>;
}

export interface IRouteVariants {
  isMobile: boolean;
  locale: SupportedLocales;
  theme?: ThemeAppearance;
}

const SUPPORTED_THEMES = ['dark', 'light'] as const;

export const DEFAULT_VARIANTS: IRouteVariants = {
  isMobile: false,
  locale: fallbackLng,
  theme: 'light',
};

const SPLITTER = '__';

// biome-ignore lint/complexity/noStaticOnlyClass: rquired as static
export class RouteVariants {
  static serializeVariants = (variants: IRouteVariants): string => {
    return [variants.locale, Number(variants.isMobile), variants.theme].join(
      SPLITTER
    );
  };

  static deserializeVariants = (serialized: string): IRouteVariants => {
    try {
      const [locale, isMobile, theme] = serialized.split(SPLITTER);

      return {
        isMobile: isMobile === '1',
        locale: this.isValidLocale(locale)
          ? (locale as SupportedLocales)
          : DEFAULT_VARIANTS.locale,
        theme: this.isValidTheme(theme as string)
          ? (theme as ThemeAppearance)
          : DEFAULT_VARIANTS.theme,
      };
    } catch {
      return { ...DEFAULT_VARIANTS };
    }
  };

  static getVariantsFromProps = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    return RouteVariants.deserializeVariants(variants);
  };

  static getIsMobile = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    const { isMobile } = RouteVariants.deserializeVariants(variants);
    return isMobile;
  };

  static getLocale = async (props: DynamicLayoutProps) => {
    const { variants } = await props.params;
    const { locale } = RouteVariants.deserializeVariants(variants);
    return locale;
  };

  static createVariants = (
    options: Partial<IRouteVariants> = {}
  ): IRouteVariants => ({
    ...DEFAULT_VARIANTS,
    ...options,
  });

  private static isValidLocale = (locale?: string): boolean =>
    locales.includes(locale as SupportedLocales);

  private static isValidTheme = (theme: string): boolean =>
    SUPPORTED_THEMES.includes(theme as ThemeAppearance);
}
