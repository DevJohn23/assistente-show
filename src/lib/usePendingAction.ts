'use client';

import { useRef, useState } from 'react';

// The ref also blocks repeated clicks before React has rendered disabled buttons.
export function usePendingAction() {
  const pending = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const run = async (action: () => Promise<boolean>): Promise<boolean> => {
    if (pending.current) return false;
    pending.current = true;
    setIsPending(true);
    try {
      return await action();
    } finally {
      pending.current = false;
      setIsPending(false);
    }
  };

  return { isPending, run };
}
