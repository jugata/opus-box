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
      <p className="text-sm text-gray-400 mt-8">
        <a href="/login" className="underline hover:text-black">Log in</a> to record a listening session.
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
          className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          Log listen
        </button>
        {status === "success" && (
          <span className="text-sm text-green-600">Logged!</span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 border rounded-lg p-5 max-w-sm flex flex-col gap-4">
      <h3 className="font-medium text-sm">Log a listening session</h3>

      <div>
        <label className="text-xs text-gray-500 block mb-1.5">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? null : n)}
              className={`w-8 h-8 rounded text-sm font-medium border transition-colors ${
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

      <div>
        <label className="text-xs text-gray-500 block mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="What did you think?"
          className="w-full border rounded px-3 py-2 text-sm resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-xs">{errorMsg}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
