"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  getMyListeningSessions,
  updateListeningSession,
  deleteListeningSession,
  type ListeningSessionRead,
} from "../lib/listeningSessions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="text-xs" style={{ color: "var(--gold)" }}>
      {"★".repeat(value)}
      <span style={{ color: "var(--line)" }}>{"★".repeat(5 - value)}</span>
    </span>
  );
}

function SessionCard({
  session,
  token,
  onUpdated,
  onDeleted,
}: {
  session: ListeningSessionRead;
  token: string;
  onUpdated: (s: ListeningSessionRead) => void;
  onDeleted: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState<number | null>(session.rating ?? null);
  const [notes, setNotes] = useState(session.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const rec = session.recording;
  const work = rec?.work;
  const composer = work?.composer;

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateListeningSession(token, session.id, {
        rating: rating ?? undefined,
        notes: notes.trim() || undefined,
      });
      onUpdated(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove this listening session?")) return;
    setDeleting(true);
    try {
      await deleteListeningSession(token, session.id);
      onDeleted(session.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="app-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {work ? (
            <p className="truncate font-bold" style={{ fontFamily: "var(--font-display)" }}>
              <Link href={`/recordings/${session.recording_id}`} className="text-link">
                {work.title}
              </Link>
            </p>
          ) : (
            <p className="truncate" style={{ color: "var(--faint)" }}>Recording #{session.recording_id}</p>
          )}
          {composer && (
            <p className="text-sm" style={{ color: "var(--soft)" }}>
              <Link href={`/composers/${composer.id}`} className="text-link">
                {composer.name}
              </Link>
            </p>
          )}
          {(rec?.conductor || rec?.orchestra) && (
            <p className="label-tag mt-1">
              {[rec.conductor?.name, rec.orchestra?.name].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="label-tag">{formatDate(session.listened_at)}</p>
          {!editing && <StarRating value={session.rating} />}
        </div>
      </div>

      {!editing ? (
        <>
          {session.notes && (
            <p className="text-sm mt-3 italic" style={{ color: "var(--soft)" }}>
              &ldquo;{session.notes}&rdquo;
            </p>
          )}
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => setEditing(true)}
              className="label-tag text-link"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="label-tag transition-colors disabled:opacity-50"
              style={{ color: "var(--faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--violet)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--faint)")}
            >
              {deleting ? "Removing…" : "Remove"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="label-tag block mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    border: `1px solid ${rating === n ? "var(--violet)" : "var(--line)"}`,
                    background: rating === n ? "var(--violet)" : "transparent",
                    color: rating === n ? "#fff" : "var(--soft)",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notes…"
            className="field resize-none"
          />
          <div className="flex gap-3 items-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="pill-btn"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-link"
              style={{ color: "var(--faint)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<ListeningSessionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { setLoading(false); return; }

    getMyListeningSessions((session as any).accessToken)
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === "loading" || loading) {
    return <main className="min-h-screen p-8 max-w-2xl mx-auto"><p className="label-tag">Loading…</p></main>;
  }

  if (!session) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto">
        <p style={{ color: "var(--soft)" }}>
          <Link href="/login" className="text-link">Log in</Link> to see your listening journal.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)" }}>Journal</h1>
      <p className="label-tag mb-8">Your listening history</p>

      {error && <p className="text-sm mb-4" style={{ color: "var(--violet)" }}>{error}</p>}

      {sessions.length === 0 ? (
        <p style={{ color: "var(--soft)" }}>No sessions logged yet. Find a recording and hit <strong>Log listen</strong>.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              token={(session as any).accessToken}
              onUpdated={(updated) =>
                setSessions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
              }
              onDeleted={(id) =>
                setSessions((prev) => prev.filter((x) => x.id !== id))
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
