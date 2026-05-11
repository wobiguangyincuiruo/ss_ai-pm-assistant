import { useState, useEffect, useCallback } from 'react';
import { loadIndex, deleteSession, renameSession } from '../services/storage';
import type { SessionMeta } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setSessions(loadIndex());
  }, []);

  useEffect(() => {
    setSessions(loadIndex());
    setLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sessions_index') {
        setSessions(loadIndex());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const remove = useCallback(
    (id: string) => {
      deleteSession(id);
      refresh();
    },
    [refresh]
  );

  const rename = useCallback(
    (id: string, newTitle: string) => {
      renameSession(id, newTitle);
      refresh();
    },
    [refresh]
  );

  return { sessions, loading, refresh, remove, rename };
}
