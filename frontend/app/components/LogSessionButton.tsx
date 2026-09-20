"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { logListeningSession } from "../lib/listeningSessions";

export default function LogSessionButton({ recordingId }: { recordingId: number }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!session) {
    return (
      <p className="text-sm mt-8" style={{ color: "var(--faint)" }}>
        <a href="/login" className="text-link">Log in</a> to record a listening session.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await logListeningSession((session as any).accessToken, {
        recording_id: recordingId,
        rating: rating ?? undefined,
        notes: notes.trim() || undefined,
      });
      setStatus("success");
      setOpen(false);
      setRating(null);
      setNotes("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "Something went wrong");
    }
  }

  if (!open) {
    return (
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => { setOpen(true); setStatus("idle"); }}
          className="pill-btn"
        >
          Log listen
        </button>
        {status === "success" && (
          <span className="label-tag" style={{ color: "var(--gold)" }}>Logged!</span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="app-card mt-8 max-w-sm flex flex-col gap-4">
      <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>Log a listening session</h3>

      <div>
        <label className="label-tag block mb-1.5">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? null : n)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
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

      <div>
        <label className="label-tag block mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="What did you think?"
          className="field resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-xs" style={{ color: "var(--violet)" }}>{errorMsg}</p>
      )}

      <div className="flex gap-3 items-center">
        <button
          type="submit"
          disabled={status === "loading"}
          className="pill-btn"
        >
          {status === "loading" ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-link"
          style={{ color: "var(--faint)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
