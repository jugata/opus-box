import Link from "next/link";
import { getRecording, getWork, getComposer, getConductor, getOrchestra } from "../../lib/api";

export default async function RecordingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recording = await getRecording(id);

  const [work, conductor, orchestra] = await Promise.all([
    getWork(recording.work_id),
    recording.conductor_id ? getConductor(recording.conductor_id) : null,
    recording.orchestra_id ? getOrchestra(recording.orchestra_id) : null,
  ]);

  const composer = await getComposer(work.composer_id);

  const duration = recording.duration
    ? `${Math.floor(recording.duration / 60)}:${String(recording.duration % 60).padStart(2, "0")}`
    : null;

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href="/composers" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Back to Composers
      </Link>

      <h1 className="text-3xl font-bold mb-1">{work.title}</h1>
      <p className="text-gray-500 mb-8">
        <Link href={`/composers/${composer.id}`} className="hover:underline">
          {composer.name}
        </Link>
      </p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
        {conductor && (
          <>
            <dt className="text-gray-500 font-medium">Conductor</dt>
            <dd>{conductor.name}</dd>
          </>
        )}
        {orchestra && (
          <>
            <dt className="text-gray-500 font-medium">Orchestra</dt>
            <dd>{orchestra.name}</dd>
          </>
        )}
        {recording.label && (
          <>
            <dt className="text-gray-500 font-medium">Label</dt>
            <dd>{recording.label}</dd>
          </>
        )}
        {recording.year && (
          <>
            <dt className="text-gray-500 font-medium">Year</dt>
            <dd>{recording.year}</dd>
          </>
        )}
        {duration && (
          <>
            <dt className="text-gray-500 font-medium">Duration</dt>
            <dd>{duration}</dd>
          </>
        )}
        {work.genre && (
          <>
            <dt className="text-gray-500 font-medium">Genre</dt>
            <dd>{work.genre}</dd>
          </>
        )}
        {work.key && (
          <>
            <dt className="text-gray-500 font-medium">Key</dt>
            <dd>{work.key}</dd>
          </>
        )}
        {work.opus_number && (
          <>
            <dt className="text-gray-500 font-medium">Opus</dt>
            <dd>{work.opus_number}</dd>
          </>
        )}
      </dl>
    </main>
  );
}
