import { useState, useEffect, useCallback } from 'react';
import {
  loadIndex,
  deleteSession,
  renameSession,
  loadIndexFromServer,
  deleteSessionFromServer,
} from '../services/storage';
import type { SessionMeta } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const local = loadIndex();
    setSessions(local);
    // 后台拉取服务端列表合并
    loadIndexFromServer().then((serverList) => {
      if (serverList.length === 0) return;
      setSessions((prev) => {
        const merged = new Map<string, SessionMeta>();
        for (const s of serverList) merged.set(s.id, s);
        for (const s of prev) {
          if (!merged.has(s.id)) merged.set(s.id, s);
        }
        return Array.from(merged.values());
      });
    });
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sessions_index') {
        setSessions(loadIndex());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const remove = useCallback(
    (id: string) => {
      deleteSession(id);
      deleteSessionFromServer(id);
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
