import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isPersistenceSupported,
  isStoragePersisted,
  requestPersistentStorage,
} from '../utils/storagePersistence';
import { getAppStorageUsageBytes } from '../utils/mapsStorage';

export interface StoragePersistenceState {
  /** Whether the StorageManager persist API exists (secure context). */
  supported: boolean;
  /** Whether storage is currently marked persistent. */
  persisted: boolean;
  /** Bytes this app's own saved data (maps + settings) occupies in localStorage. */
  usageBytes: number | null;
  /** True while an async read is in flight. */
  loading: boolean;
  /** Request persistence, then refresh status + usage. */
  enable: () => Promise<void>;
  /** Re-read persisted status and usage estimate. */
  refresh: () => Promise<void>;
}

/**
 * Shared persistence status/estimate/enable logic for the first-visit intro modal
 * and the Settings modal's Storage section.
 *
 * @param active when false, skips the initial async read (e.g. while a modal is closed).
 */
export const useStoragePersistence = (active = true): StoragePersistenceState => {
  const supported = isPersistenceSupported();
  const [persisted, setPersisted] = useState(false);
  const [usageBytes, setUsageBytes] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Guards against committing async results after the consumer (e.g. the Settings
  // modal's Storage section) unmounts mid-read.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    const nowPersisted = await isStoragePersisted();
    if (!mountedRef.current) return;
    setPersisted(nowPersisted);
    setUsageBytes(getAppStorageUsageBytes());
    setLoading(false);
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    await requestPersistentStorage();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if (active) void refresh();
  }, [active, refresh]);

  return { supported, persisted, usageBytes, loading, enable, refresh };
};
