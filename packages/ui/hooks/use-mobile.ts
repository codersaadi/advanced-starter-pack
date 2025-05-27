import { useState, useEffect } from "react";

/**
 * Configuration options for the useIsMobile hook
 */
interface UseIsMobileOptions {
  /** Width threshold in pixels to consider as mobile (default: 768px) */
  breakpoint?: number;
}

/**
 * Custom hook to detect if the current viewport is mobile-sized
 * Uses the matchMedia API for better performance and browser compatibility
 *
 * @param options - Configuration options
 * @returns boolean indicating if the current viewport is mobile-sized
 *
 * @example
 * // Basic usage
 * const isMobile = useIsMobile();
 *
 * @example
 * // With custom breakpoint
 * const isTablet = useIsMobile({ breakpoint: 1024 });
 */
export const useIsMobile = (options?: UseIsMobileOptions): boolean => {
  const { breakpoint = 768 } = options || {};

  // Initialize with a safe default for SSR
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Skip effect during SSR
    if (typeof window === "undefined") return;

    // Create media query
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Define handler function
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Modern event listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]); // Only re-run effect if breakpoint changes

  return isMobile;
};

export default useIsMobile;

// depricated
// import * as React from "react";

// const MOBILE_BREAKPOINT = 768;

// export function useIsMobile() {
// 	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
// 		undefined
// 	);

// 	React.useEffect(() => {
// 		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
// 		const onChange = () => {
// 			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
// 		};
// 		mql.addEventListener("change", onChange);
// 		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
// 		return () => mql.removeEventListener("change", onChange);
// 	}, []);

// 	return !!isMobile;
// }
