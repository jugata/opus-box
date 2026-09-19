// lib/api.ts
// Server-side fetch helpers for the public (no-auth) API endpoints.
// All functions throw on non-OK responses.

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const opts: RequestInit = { cache: "no-store" };

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Composer {
  id: number;
  name: string;
  nationality?: string;
  bio?: string;
  born?: string;
  died?: string;
  musicbrainz_id?: string;
}

export interface Work {
  id: number;
  title: string;
  composer_id: number;
  genre?: string;
  key?: string;
  opus_number?: string;
  year?: number;
  description?: string;
  musicbrainz_id?: string;
}

export interface Conductor {
  id: number;
  name: string;
  nationality?: string;
  born?: string;
  died?: string;
  musicbrainz_id?: string;
}

export interface Orchestra {
  id: number;
  name: string;
  city?: string;
  country?: string;
  founded?: number;
  musicbrainz_id?: string;
}

export interface Recording {
  id: number;
  work_id: number;
  conductor_id?: number;
  orchestra_id?: number;
  label?: string;
  year?: number;
  duration?: number;
  musicbrainz_id?: string;
}

// ---------------------------------------------------------------------------
// Composers
// ---------------------------------------------------------------------------

export function getComposers(): Promise<Composer[]> {
  return apiFetch("/composers");
}

export function getComposer(id: string | number): Promise<Composer> {
  return apiFetch(`/composers/${id}`);
}

export interface ComposerCandidate {
  musicbrainz_id: string;
  name: string;
  disambiguation?: string;
  nationality?: string;
}

export interface ComposerSearchResult {
  local: Composer[];
  candidates: ComposerCandidate[];
}

export function searchComposers(q: string): Promise<ComposerSearchResult> {
  return apiFetch(`/composers/search?q=${encodeURIComponent(q)}`);
}

export async function importComposer(musicbrainzId: string): Promise<Composer> {
  const res = await fetch(`${API}/composers/import/${musicbrainzId}`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to import composer (${res.status})`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Works
// ---------------------------------------------------------------------------

export function getWorks(composerId?: string | number): Promise<Work[]> {
  const qs = composerId != null ? `?composer_id=${composerId}` : "";
  return apiFetch(`/works${qs}`);
}

export function getWork(id: string | number): Promise<Work> {
  return apiFetch(`/works/${id}`);
}

// ---------------------------------------------------------------------------
// Conductors
// ---------------------------------------------------------------------------

export function getConductor(id: string | number): Promise<Conductor> {
  return apiFetch(`/conductors/${id}`);
}

// ---------------------------------------------------------------------------
// Orchestras
// ---------------------------------------------------------------------------

export function getOrchestra(id: string | number): Promise<Orchestra> {
  return apiFetch(`/orchestras/${id}`);
}

// ---------------------------------------------------------------------------
// Recordings
// ---------------------------------------------------------------------------

export function getRecordings(): Promise<Recording[]> {
  return apiFetch("/recordings");
}

export function getRecording(id: string | number): Promise<Recording> {
  return apiFetch(`/recordings/${id}`);
}
