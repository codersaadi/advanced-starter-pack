'use client';

import { Loader2 } from 'lucide-react';
import { memo } from 'react';

const MobileSwitchLoading = memo(() => {
  return (
    <div className="relative h-full w-full select-none">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        {/* Product Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <span className="font-bold text-primary text-xl">App</span>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
});

MobileSwitchLoading.displayName = 'MobileSwitchLoading';

export default MobileSwitchLoading;
