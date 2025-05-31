"use server";
import fs from "node:fs/promises"; // For server-side file reading
import path, { resolve } from "node:path"; // For server-side path joining
import { get } from "lodash-es";
import {
  type AppNamespaces,
  FALLBACK_LNG,
  type SupportedLocales,
} from "../config/client";
import type { InterpolationValues, Paths, ValueAtPath } from "../types/common";
import type { Resources } from "../types/generated";
import { normalizeLocale } from "../utils";
import { i18nEnvConfig } from "../utils/env";

const { IS_DEV } = i18nEnvConfig;

export const getLocale = async (hl?: string): Promise<SupportedLocales> => {
  return normalizeLocale(hl || FALLBACK_LNG);
};

export type ServerTFunction<
  TNamespace extends AppNamespaces,
  TResources extends Resources = Resources,
> = <
  TKey extends Paths<TResources[TNamespace]>,
  TValue extends string = ValueAtPath<
    TResources[TNamespace],
    TKey
  > extends string
    ? ValueAtPath<TResources[TNamespace], TKey>
    : string,
  TOptions extends InterpolationValues<TValue> = InterpolationValues<TValue>,
>(
  key: TKey,
  options?: TOptions
) => string;
const getFilePath = (lng: SupportedLocales, ns: string) => {
  // hack to get the monorepo path  from the web-server when runningin nextjs
  const MONOREPO_ROOT = resolve(__dirname, "../../../../../../../");

  return path.join(MONOREPO_ROOT, "packages", "locales", lng, `${ns}.json`);
};
export const translation = async <TNamespace extends AppNamespaces>(
  ns: TNamespace,
  hl?: string
) => {
  let i18ns: TNamespace extends keyof Resources
    ? Resources[TNamespace]
    : // biome-ignore lint/suspicious/noExplicitAny:
      object = {} as any;
  const lng = await getLocale(hl);
  const nsString = String(ns);

  try {
    if (IS_DEV && lng === FALLBACK_LNG) {
      // Relative path from this file to default/
      const module = await import(`../default/${nsString}.ts`);
      i18ns = module.default;
    } else {
      // Use the corrected path that points to your actual JSON files
      // THIS IS THE CRITICAL LINE TO FIX with the right PATHS variable:

      const filePath = getFilePath(lng, nsString);
      // Or, if you intend to read from the Next.js app's public folder after copy:
      // const filePath = path.join(PATHS.publicLocalesAppWeb, lng, `${nsString}.json`);

      const fileContent = await fs.readFile(filePath, "utf-8");
      i18ns = JSON.parse(fileContent);
    }
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(
      `[Server Translation] Error loading translation file for ns='${nsString}', lang='${lng}':`,
      (e as Error).message,
      (e as NodeJS.ErrnoException)?.path
        ? `Path: ${(e as NodeJS.ErrnoException).path}`
        : ""
    );
  }

  const tFunction: ServerTFunction<TNamespace> = (key, options) => {
    if (Object.keys(i18ns)?.length === 0) return String(key);
    let content: string | undefined = get(i18ns, key as string);

    if (content === undefined) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.warn(
        `[Server Translation] Key '${String(key)}' not found in ns '${nsString}' for lang '${lng}'.`
      );
      return String(key);
    }
    if (options && typeof content === "string") {
      for (const [optKey, optValue] of Object.entries(options)) {
        content = (content as string).replace(
          new RegExp(`{{${optKey}}}`, "g"),
          String(optValue)
        );
      }
    }
    return content as string;
  };

  return { locale: lng, t: tFunction };
};
