'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCopied = (timeout = 2000) => {
  const [copied, setCopy] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopy(false);
    }, timeout);

    return () => {
      clearTimeout(timer);
    };
  }, [copied, timeout]);

  const setCopied = useCallback(() => setCopy(true), []);

  return useMemo(() => ({ copied, setCopied }), [copied, setCopied]);
};