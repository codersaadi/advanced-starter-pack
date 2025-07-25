'use client';
export const TITLE = 'Authentik';
export const COLOR_PRIMARY = '#FD4B2D';

import type { IconType } from '@icons-pack/react-simple-icons';
import { memo } from 'react';

const Icon: IconType = memo(({ size = '1em', style, ...rest }) => {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      height={size}
      style={{ flex: 'none', lineHeight: 1, ...style }}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{TITLE}</title>
      <path
        clipRule="evenodd"
        d="M23.97 6.337h.004A3.77 3.77 0 0020.226 3H9.388a3.769 3.769 0 00-1.503.312l-.099.045c-.103.048-.204.101-.301.16a3.61 3.61 0 00-.287.184 3.853 3.853 0 00-.626.562l-.014.016-.013.015c-.031.035-.063.07-.086.1l-.092.12a3.824 3.824 0 00-.053.072l-.009.012-.012.017-.012.018-.021.03v.006l-.002.003a3.73 3.73 0 00-.639 2.097v4.424c-.035-.05-.07-.1-.108-.15-.588-.796-1.47-1.599-2.447-1.599a3.062 3.062 0 00-2.69 1.597H.371c-1.117 1.946.427 4.572 2.692 4.513 1.75 0 3.196-2.6 3.196-3.06 0-.17-.199-.635-.538-1.15h6.163v-.003h.002V8.005h-.002V7.68h1.234v1.518h.84V7.68h1.345v.893h.84V7.68h1.588v6.521H5.62v3.417a3.773 3.773 0 003.77 3.763h1.599v-3.692h7.64v3.692h1.596A3.773 3.773 0 0024 17.618v-6.277H24V6.77a3.61 3.61 0 00-.03-.432zM4.01 11.044c-.667-.702-1.58-.546-2.211-.003H1.8c-2.11 2.057 1.333 5.557 3.296 1.45a5.342 5.342 0 00-1.088-1.447z"
      />
    </svg>
  );
});

export default Icon;
