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
    console.log(`[useSessions] 刷新列表: localStorage 有 ${local.length} 条会话`);
    setSessions(local);
    // 后台拉取服务端列表合并
    loadIndexFromServer().then((serverList) => {
      if (serverList.length === 0) return;
      console.log(`[useSessions] 服务端合并: ${serverList.length} 条`);
      setSessions((prev) => {
        const merged = new Map<string, SessionMeta>();
        for (const s of serverList) merged.set(s.id, s);
        for (const s of prev) {
          if (!merged.has(s.id)) merged.set(s.id, s);
        }
        return Array.from(merged.values());
      });
    }).catch((err) => {
      console.error('[useSessions] 服务端查询失败:', err);
    });
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);

    // 跨标签页同步
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sessions_index') {
        setSessions(loadIndex());
      }
    };
    window.addEventListener('storage', onStorage);

    // 同窗口内同步（AutoSaver 保存 / 删除 / 重命名）
    const onSessionUpdated = () => {
      setSessions(loadIndex());
    };
    window.addEventListener('session-updated', onSessionUpdated);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('session-updated', onSessionUpdated);
    };
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
