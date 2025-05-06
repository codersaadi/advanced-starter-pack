'use client';

import Link from 'next/link';
import { memo } from 'react';
import { Button } from '../ui/button';

const NotFound = memo(() => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4">
      {/* Large blurred background 404 text */}
      <h1 className="absolute z-0 m-0 font-bold text-8xl opacity-10 blur-lg md:text-9xl">
        404
      </h1>

      {/* Emoji */}
      <div className="mb-2 text-6xl">👀</div>

      {/* Title */}
      <h2 className="mt-4 text-center font-bold text-2xl">Page Not Found</h2>

      {/* Description */}
      <p className="mb-8 text-center leading-7">
        The page you're looking for doesn't exist or has been moved.
        <br />
        <span className="block text-center">
          Please check the URL or try navigating from the home page.
        </span>
      </p>

      {/* Back home button */}
      <Link href="/">
        <Button variant="default">Back to Home</Button>
      </Link>
    </div>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
