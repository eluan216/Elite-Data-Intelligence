export default function OpsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-5xl">
        <h1 className="display-lg mb-4">Internal Ops Dashboard</h1>
        <p className="mb-12 max-w-xl text-muted">
          Restricted view for pipeline health, credit spend, agent status, and risk register.
          Access will be limited to the founder and designated senior core.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 text-sm font-medium text-muted">Pipeline</h2>
            <p className="text-2xl font-semibold">—</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 text-sm font-medium text-muted">Credit Spend</h2>
            <p className="text-2xl font-semibold">—</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 text-sm font-medium text-muted">Agent Health</h2>
            <p className="text-2xl font-semibold">—</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 text-sm font-medium text-muted">Open Risks</h2>
            <p className="text-2xl font-semibold">—</p>
          </div>
        </div>
      </div>
    </main>
  );
}
