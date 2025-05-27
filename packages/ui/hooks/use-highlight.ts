'use client';

import {
    transformerNotationDiff,
    transformerNotationErrorLevel,
    transformerNotationFocus,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { useMemo } from 'react';
import type { BuiltinTheme, CodeToHastOptions } from 'shiki';
import useSWR from 'swr';
import { languages } from '../components/Highlighter/highlighter-consts';

// Fallback language
const FALLBACK_LANG = 'txt';

// Dynamically import shiki's codeToHtml
const shikiFetcher = async () => {
    const { codeToHtml } = await import('shiki');
    return codeToHtml;
};

// Helper to escape HTML for fallback
const escapeHtml = (str: string): string => {
    return str
        .replaceAll('&', '&')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '"')
        .replaceAll("'", '');
};

export const useHighlight = (
    text: string,
    {
        language,
        theme: shikiTheme = 'github-dark', // Default theme
        enableTransformer = true,
    }: {
        language: string;
        theme?: BuiltinTheme;
        enableTransformer?: boolean;
    },
) => {
    const lang = language?.toLowerCase() || FALLBACK_LANG;
    const matchedLanguage = useMemo(
        () => (languages.includes(lang as any) ? lang : FALLBACK_LANG),
        [lang],
    );

    const transformers = useMemo(() => {
        if (!enableTransformer) return [];
        return [
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationWordHighlight(),
            transformerNotationFocus(),
            transformerNotationErrorLevel(),
        ];
    }, [enableTransformer]);

    // SWR key: includes text hash for long texts, language, theme, and transformer status
    const cacheKey = useMemo(() => {
        // Simple hash for cache key, consider a more robust one if needed for very large inputs
        const textHash = text.length > 200 ? text.substring(0, 50) + text.length : text;
        return `highlight-${matchedLanguage}-${shikiTheme}-${enableTransformer}-${textHash}`;
    }, [text, matchedLanguage, shikiTheme, enableTransformer]);

    return useSWR(cacheKey, async () => {
        const codeToHtml = await shikiFetcher();
        if (!text.trim()) return `<pre class="shiki"><code></code></pre>`; // Handle empty string

        try {
            const html = await codeToHtml(text, {
                lang: matchedLanguage,
                theme: shikiTheme,
                transformers: transformers,
            });
            return html;
        } catch (error) {
            console.error('Shiki highlighting failed:', error);
            // Fallback to simple preformatted text
            return `<pre class="shiki shiki-fallback"><code>${escapeHtml(text)}</code></pre>`;
        }
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000, // Reduce deduping for highlighting
    });
};