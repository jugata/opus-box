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
    <span className="text-xs text-gray-500">
      {"★".repeat(value)}{"☆".repeat(5 - value)}
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
    <div className="border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {work ? (
            <p className="font-medium truncate">
              <Link href={`/recordings/${session.recording_id}`} className="hover:underline">
                {work.title}
              </Link>
            </p>
          ) : (
            <p className="font-medium text-gray-400">Recording #{session.recording_id}</p>
          )}
          {composer && (
            <p className="text-sm text-gray-500">
              <Link href={`/composers/${composer.id}`} className="hover:underline">
                {composer.name}
              </Link>
            </p>
          )}
          {(rec?.conductor || rec?.orchestra) && (
            <p className="text-xs text-gray-400 mt-0.5">
              {[rec.conductor?.name, rec.orchestra?.name].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400">{formatDate(session.listened_at)}</p>
          {!editing && <StarRating value={session.rating} />}
        </div>
      </div>

      {!editing ? (
        <>
          {session.notes && (
            <p className="text-sm text-gray-600 mt-3 italic">"{session.notes}"</p>
          )}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  className={`w-7 h-7 rounded text-xs font-medium border transition-colors ${
                    rating === n
                      ? "bg-black text-white border-black"
                      : "text-gray-500 hover:border-gray-400"
                  }`}
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
            placeholder="Notes..."
            className="w-full border rounded px-3 py-2 text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white text-xs px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 hover:text-black transition-colors"
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
    return <main className="min-h-screen p-8 max-w-2xl mx-auto"><p className="text-gray-400">Loading...</p></main>;
  }

  if (!session) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto">
        <p className="text-gray-500">
          <Link href="/login" className="underline hover:text-black">Log in</Link> to see your listening journal.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Journal</h1>
      <p className="text-gray-400 text-sm mb-8">Your listening history</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions logged yet. Find a recording and hit <strong>Log listen</strong>.</p>
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
