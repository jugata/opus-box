import Link from "next/link";
import {
  getWork,
  getComposer,
  getRecordings,
  getConductor,
  getOrchestra,
  type Recording,
} from "../../lib/api";

async function withPerformers(recording: Recording) {
  const [conductor, orchestra] = await Promise.all([
    recording.conductor_id ? getConductor(recording.conductor_id) : null,
    recording.orchestra_id ? getOrchestra(recording.orchestra_id) : null,
  ]);
  return { recording, conductor, orchestra };
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await getWork(id);
  const [composer, recordings] = await Promise.all([
    getComposer(work.composer_id),
    getRecordings(id),
  ]);
  const performances = await Promise.all(recordings.map(withPerformers));

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href={`/composers/${composer.id}`} className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Back to {composer.name}
      </Link>
      <h1 className="text-3xl font-bold mb-1">{work.title}</h1>
      {work.opus_number && <p className="text-gray-500 mb-8">{work.opus_number}</p>}

      <h2 className="text-xl font-semibold mb-4">Recordings</h2>
      {performances.length === 0 ? (
        <p className="text-gray-500">No recordings found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {performances.map(({ recording, conductor, orchestra }) => (
            <Link
              key={recording.id}
              href={`/recordings/${recording.id}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow block"
            >
              <p className="font-medium">
                {[conductor?.name, orchestra?.name].filter(Boolean).join(" · ") ||
                  "Unknown performers"}
              </p>
              {recording.year && <p className="text-sm text-gray-500">{recording.year}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
