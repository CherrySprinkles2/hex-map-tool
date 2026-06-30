import React, { useEffect, useState } from 'react';
import { StoragePersistenceIntroModal } from '../StoragePersistenceIntroModal/StoragePersistenceIntroModal';
import {
  hasSeenPersistencePrompt,
  isPersistenceSupported,
  isStoragePersisted,
  markPersistencePromptSeen,
  requestPersistentStorage,
} from '../../utils/storagePersistence';

// Short defer so the first route paints before the explainer appears.
const SHOW_DELAY_MS = 400;

/**
 * App-level host for the one-time persistent-storage explainer. Shown on first
 * app load on any route, only if it has never been shown, the API is supported,
 * and storage isn't already persisted. Any close marks it as seen (never again).
 */
export const PersistencePromptHost = (): React.ReactElement => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      if (hasSeenPersistencePrompt()) return;
      // Unsupported (no secure context / old browser): nothing to ask for. We don't
      // mark it seen — the check is free, so a later supporting context can still prompt.
      if (!isPersistenceSupported()) return;
      if (await isStoragePersisted()) return; // already durable; nothing to ask
      if (!cancelled) setOpen(true);
    }, SHOW_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleEnable = (): void => {
    void requestPersistentStorage();
    markPersistencePromptSeen();
    setOpen(false);
  };

  const handleDismiss = (): void => {
    markPersistencePromptSeen();
    setOpen(false);
  };

  return (
    <StoragePersistenceIntroModal open={open} onEnable={handleEnable} onDismiss={handleDismiss} />
  );
};
