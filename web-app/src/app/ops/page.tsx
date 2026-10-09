import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ops — Elite-Data-Intelligence",
  robots: { index: false, follow: false },
};

/**
 * Placeholder only. No auth yet — do not put secrets, client data, or metrics here
 * until authentication and authorization are implemented (Phase 4).
 */
export default function OpsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-5xl">
        <h1 className="display-lg mb-4">Internal Ops</h1>
        <p className="mb-6 max-w-xl text-muted">
          This route is a shell only. It is not authenticated. No live pipeline data, credentials,
          or client information is loaded here.
        </p>
        <p className="text-sm text-muted">
          Access control and real metrics land in a later phase. Until then, treat this page as
          non-operational.
        </p>
      </div>
    </main>
  );
}
