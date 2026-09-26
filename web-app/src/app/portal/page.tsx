export default function PortalPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-5xl">
        <h1 className="display-lg mb-4">Client Portal</h1>
        <p className="mb-12 max-w-xl text-muted">
          Authenticated area for project status, deliverables, validation reports, and support.
          Authentication and live data connections will be added in the next iteration.
        </p>
        <div className="rounded-xl border border-border bg-card p-8">
          <p className="text-sm text-muted">
            Portal shell ready. Login, project list, and status views will land here according to the
            PRD.
          </p>
        </div>
      </div>
    </main>
  );
}
