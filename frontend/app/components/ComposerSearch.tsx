"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchComposers, importComposer, type ComposerSearchResult } from "../lib/api";

export default function ComposerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ComposerSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      setResult(await searchComposers(query.trim()));
    } catch (err: any) {
      setError(err.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(mbid: string) {
    setImportingId(mbid);
    setError("");
    try {
      const composer = await importComposer(mbid);
      router.push(`/composers/${composer.id}`);
    } catch (err: any) {
      setError(err.message ?? "Import failed");
      setImportingId(null);
    }
  }

  return (
    <div className="mb-10">
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search composers…"
          className="field flex-1"
        />
        <button type="submit" disabled={loading} className="pill-btn">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="text-sm mt-2" style={{ color: "var(--violet)" }}>{error}</p>}

      {result && (
        <div className="mt-5 flex flex-col gap-5 max-w-md">
          {result.local.length > 0 && (
            <div>
              <p className="label-tag mb-2">Already in OpusBox</p>
              <div className="flex flex-col gap-2">
                {result.local.map((c) => (
                  <Link key={c.id} href={`/composers/${c.id}`} className="app-card text-sm block">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.candidates.length > 0 && (
            <div>
              <p className="label-tag mb-2">Found on MusicBrainz</p>
              <div className="flex flex-col gap-2">
                {result.candidates.map((c) => (
                  <div key={c.musicbrainz_id} className="app-card flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{c.name}</p>
                      {(c.disambiguation || c.nationality) && (
                        <p className="label-tag truncate mt-0.5">
                          {[c.disambiguation, c.nationality].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleImport(c.musicbrainz_id)}
                      disabled={importingId === c.musicbrainz_id}
                      className="pill-btn shrink-0"
                    >
                      {importingId === c.musicbrainz_id ? "Adding…" : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.local.length === 0 && result.candidates.length === 0 && (
            <p className="text-sm" style={{ color: "var(--faint)" }}>No matches found.</p>
          )}
        </div>
      )}
    </div>
  );
}
