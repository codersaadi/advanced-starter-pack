import type { Metadata } from "next";
import qs from "query-string";

import { formatDescLength, formatTitleLength } from "@repo/core/utils/genOG";
import {
  FALLBACK_LNG,
  LANGUAGES,
  type SupportedLocales,
} from "@repo/i18n/config/client";
import { BRANDING_NAME, ORG_NAME } from "../const/branding";
import { OG_URL } from "../const/url";
import { getCanonicalUrl } from "./url";

export class Meta {
  public generate({
    description = "Typescript turborepo is a smart typesafe turborepo ",
    title,
    image = OG_URL,
    url,
    type = "website",
    tags,
    alternate,
    locale = FALLBACK_LNG,
    canonical,
  }: {
    alternate?: boolean;
    canonical?: string;
    description?: string;
    image?: string;
    locale?: SupportedLocales;
    tags?: string[];
    title: string;
    type?: "website" | "article";
    url: string;
  }): Metadata {
    // eslint-disable-next-line no-param-reassign
    const formatedTitle = formatTitleLength(title, 21);
    // eslint-disable-next-line no-param-reassign
    const formatedDescription = formatDescLength(description, tags);
    const siteTitle = title.includes(BRANDING_NAME)
      ? title
      : `${title} · ${BRANDING_NAME}`;
    return {
      alternates: {
        canonical:
          canonical ||
          getCanonicalUrl(
            alternate ? qs.stringifyUrl({ query: { hl: locale }, url }) : url
          ),
        languages: alternate
          ? this.genAlternateLocales(locale, url)
          : undefined,
      },
      description: formatedDescription,
      openGraph: this.genOpenGraph({
        alternate,
        description,
        image,
        locale,
        title: siteTitle,
        type,
        url,
      }),
      other: {
        robots: "index,follow",
      },
      title: formatedTitle,
      twitter: this.genTwitter({ description, image, title: siteTitle, url }),
    };
  }

  private genAlternateLocales = (locale: SupportedLocales, path = "/") => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const links = {} as any;
    const defaultLink = getCanonicalUrl(path);
    for (const alterLocales of LANGUAGES) {
      links[alterLocales] = qs.stringifyUrl({
        query: { hl: alterLocales },
        url: defaultLink,
      });
    }
    return {
      "x-default": defaultLink,
      ...links,
    };
  };

  private genTwitter({
    description,
    title,
    image,
    url,
  }: {
    description: string;
    image: string;
    title: string;
    url: string;
  }) {
    return {
      card: "summary_large_image",
      description,
      images: [image],
      site: "@your_org",
      title,
      url,
    };
  }

  private genOpenGraph({
    alternate,
    locale = FALLBACK_LNG,
    description,
    title,
    image,
    url,
    type = "website",
  }: {
    alternate?: boolean;
    description: string;
    image: string;
    locale: SupportedLocales;
    title: string;
    type?: "website" | "article";
    url: string;
  }) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const data: any = {
      description,
      images: [
        {
          alt: title,
          url: image,
        },
      ],
      locale,
      siteName: ORG_NAME,
      title,
      type,
      url,
    };

    if (alternate) {
      data.alternateLocale = LANGUAGES;
    }

    return data;
  }
}

export const metadataModule = new Meta();
