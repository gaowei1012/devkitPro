import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/copyToClipboard';

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      } else {
        setCopied(false);
      }
      return ok;
    },
    [timeout]
  );

  return { copied, copy };
}
