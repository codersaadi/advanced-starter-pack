import { useState, useEffect } from "react";

/**
 * A React hook that tracks the state of a CSS media query.
 * It returns `true` if the query matches, and `false` otherwise.
 * This hook is server-side rendering (SSR) safe.
 *
 * @param query The media query string to watch (e.g., '(min-width: 768px)').
 * @returns A boolean indicating whether the media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    // `getMatches` is used here to ensure `window` is defined
    // and to get the initial state on the client side.
    // This is especially useful for handling hydration mismatches.
    const mediaQueryList = window.matchMedia(query);

    // Event listener callback
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set the initial state
    setMatches(mediaQueryList.matches);

    // Listen for changes
    // Using `addEventListener` is the modern, recommended approach.
    mediaQueryList.addEventListener("change", handleChange);

    // Cleanup function to remove the listener when the component unmounts
    // or when the query string changes.
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]); // Re-run the effect if the query string changes

  return matches;
}
