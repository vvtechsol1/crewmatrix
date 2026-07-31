export default function WorkspaceLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-12" role="status" aria-label="Loading workspace">
      <div className="h-4 w-40 rounded bg-ink-800" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="h-9 max-w-3xl rounded bg-ink-800" />
          <div className="mt-4 h-5 w-80 max-w-full rounded bg-ink-800" />
          <div className="mt-10 h-72 rounded-xl border border-ink-800 bg-ink-900" />
        </div>
        <div className="space-y-4">
          <div className="h-52 rounded-xl border border-ink-800 bg-ink-900" />
          <div className="h-64 rounded-xl border border-ink-800 bg-ink-900" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
