// lib/listeningSessions.ts
// Typed client helpers for the /listening-sessions API endpoints.
// All mutating calls require a JWT Bearer token from NextAuth.

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ListeningSessionCreate {
  recording_id: number;
  listened_at?: string; // ISO 8601 — omit to default to server now()
  notes?: string;
  rating?: number; // 1-5
}

export interface ListeningSessionUpdate {
  notes?: string;
  rating?: number;
}

export interface ComposerBrief {
  id: number;
  name: string;
}

export interface WorkBrief {
  id: number;
  title: string;
  composer?: ComposerBrief;
}

export interface RecordingBrief {
  id: number;
  label?: string;
  year?: number;
  work?: WorkBrief;
  conductor?: { id: number; name: string };
  orchestra?: { id: number; name: string };
}

export interface ListeningSessionRead {
  id: number;
  recording_id: number;
  listened_at: string;
  notes?: string;
  rating?: number;
  recording?: RecordingBrief;
}

// -----------------------------------------------------------------------
// POST /listening-sessions — log a new session
// -----------------------------------------------------------------------
export async function logListeningSession(
  token: string,
  data: ListeningSessionCreate
): Promise<ListeningSessionRead> {
  const res = await fetch(`${API}/listening-sessions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Failed to log session (${res.status})`);
  }

  return res.json();
}

// -----------------------------------------------------------------------
// GET /listening-sessions/me — authenticated user's history
// -----------------------------------------------------------------------
export async function getMyListeningSessions(
  token: string,
  { skip = 0, limit = 50 }: { skip?: number; limit?: number } = {}
): Promise<ListeningSessionRead[]> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  const res = await fetch(`${API}/listening-sessions/me?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    // No cache — journal should always be fresh
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Failed to fetch journal (${res.status})`);
  }

  return res.json();
}

// -----------------------------------------------------------------------
// PATCH /listening-sessions/:id — edit notes / rating
// -----------------------------------------------------------------------
export async function updateListeningSession(
  token: string,
  id: number,
  data: ListeningSessionUpdate
): Promise<ListeningSessionRead> {
  const res = await fetch(`${API}/listening-sessions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Failed to update session (${res.status})`);
  }

  return res.json();
}

// -----------------------------------------------------------------------
// DELETE /listening-sessions/:id
// -----------------------------------------------------------------------
export async function deleteListeningSession(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API}/listening-sessions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Failed to delete session (${res.status})`);
  }
}
