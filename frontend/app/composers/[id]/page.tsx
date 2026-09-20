import Link from "next/link";
import { getComposer, getWorks } from "../../lib/api";
import WorkSearch from "../../components/WorkSearch";

export default async function ComposerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [composer, works] = await Promise.all([
    getComposer(id),
    getWorks(id),
  ]);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/composers" className="text-link text-sm mb-6 block">
        ← Back to Composers
      </Link>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-display)" }}>{composer.name}</h1>
      {composer.nationality && (
        <p className="mb-8" style={{ color: "var(--soft)" }}>{composer.nationality}</p>
      )}
      <h2 className="text-xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)" }}>
        Works
      </h2>
      <WorkSearch composerId={composer.id} />
      {works.length === 0 ? (
        <p style={{ color: "var(--soft)" }}>
          No works added yet — search above to find and add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <Link key={work.id} href={`/works/${work.id}`}>
              <div className="app-card cursor-pointer">
                <h3 className="font-bold" style={{ fontFamily: "var(--font-display)" }}>{work.title}</h3>
                {work.opus_number && (
                  <p className="label-tag mt-1.5">{work.opus_number}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
