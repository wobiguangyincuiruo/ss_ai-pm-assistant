import type { SessionMeta, SessionData } from '../types';

const SESSIONS_INDEX_KEY = 'sessions_index';
const SESSION_PREFIX = 'session_';

export function loadIndex(): SessionMeta[] {
  try {
    const raw = localStorage.getItem(SESSIONS_INDEX_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export function saveIndex(list: SessionMeta[]): void {
  try {
    localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(list));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadSession(id: string): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function saveSession(data: SessionData): void {
  try {
    const id = data.meta.id;
    localStorage.setItem(SESSION_PREFIX + id, JSON.stringify(data));

    const index = loadIndex();
    const existingIdx = index.findIndex((m) => m.id === id);
    if (existingIdx >= 0) {
      index[existingIdx] = data.meta;
    } else {
      index.unshift(data.meta);
    }
    saveIndex(index);
  } catch {
    // silently ignore
  }
}

export function renameSession(id: string, newTitle: string): void {
  try {
    const data = loadSession(id);
    if (!data) return;
    data.meta.title = newTitle;
    localStorage.setItem(SESSION_PREFIX + id, JSON.stringify(data));

    const index = loadIndex();
    const existingIdx = index.findIndex((m) => m.id === id);
    if (existingIdx >= 0) {
      index[existingIdx] = data.meta;
      saveIndex(index);
    }
  } catch {
    // silently ignore
  }
}

export function deleteSession(id: string): void {
  try {
    localStorage.removeItem(SESSION_PREFIX + id);
    const index = loadIndex().filter((m) => m.id !== id);
    saveIndex(index);
  } catch {
    // silently ignore
  }
}

// ---- Server-side persistence (dual-write) ----

export async function saveSessionToServer(data: SessionData): Promise<void> {
  try {
    await fetch('/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // server not available — silently skip
  }
}

export async function deleteSessionFromServer(id: string): Promise<void> {
  try {
    await fetch('/api/delete-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch {
    // silently skip
  }
}

export async function loadSessionFromServer(id: string): Promise<SessionData | null> {
  try {
    const res = await fetch(`/api/sessions/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loadIndexFromServer(): Promise<SessionMeta[]> {
  try {
    const res = await fetch('/api/sessions');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
