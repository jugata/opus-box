import Link from "next/link";
import { getWorks, getComposers } from "../lib/api";

export default async function WorksPage() {
  const [works, composers] = await Promise.all([getWorks(), getComposers()]);
  const composerNames = new Map(composers.map((c) => [c.id, c.name]));

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Works
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Link key={work.id} href={`/works/${work.id}`}>
            <div className="app-card cursor-pointer">
              <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>{work.title}</h2>
              <p className="text-sm mt-1" style={{ color: "var(--soft)" }}>
                {composerNames.get(work.composer_id) ?? "Unknown composer"}
              </p>
              {work.opus_number && (
                <p className="label-tag mt-1.5">{work.opus_number}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
