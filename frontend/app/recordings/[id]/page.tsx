import Link from "next/link";
import { getRecording, getWork, getComposer, getConductor, getOrchestra } from "../../lib/api";
import LogSessionButton from "../../components/LogSessionButton";

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

  const rows: [string, string | number][] = [
    ...(conductor ? [["Conductor", conductor.name] as [string, string]] : []),
    ...(orchestra ? [["Orchestra", orchestra.name] as [string, string]] : []),
    ...(recording.label ? [["Label", recording.label] as [string, string]] : []),
    ...(recording.year ? [["Year", recording.year] as [string, number]] : []),
    ...(duration ? [["Duration", duration] as [string, string]] : []),
    ...(work.genre ? [["Genre", work.genre] as [string, string]] : []),
    ...(work.key ? [["Key", work.key] as [string, string]] : []),
    ...(work.opus_number ? [["Opus", work.opus_number] as [string, string]] : []),
  ];

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <Link href="/composers" className="text-link text-sm mb-6 block">
        ← Back to Composers
      </Link>

      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-display)" }}>{work.title}</h1>
      <p className="mb-8">
        <Link href={`/composers/${composer.id}`} className="text-link" style={{ color: "var(--soft)" }}>
          {composer.name}
        </Link>
      </p>

      <div className="app-card">
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className="grid grid-cols-[8rem_1fr] gap-x-6 py-2.5"
            style={{ borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--line)" }}
          >
            <dt className="label-tag self-center">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </div>

      <LogSessionButton recordingId={recording.id} />
    </main>
  );
}
