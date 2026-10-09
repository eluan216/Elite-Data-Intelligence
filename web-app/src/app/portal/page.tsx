import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal — Elite-Data-Intelligence",
  robots: { index: false, follow: false },
};

/**
 * Placeholder only. No authentication — no client documents or project data.
 */
export default function PortalPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-5xl">
        <h1 className="display-lg mb-4">Client Portal</h1>
        <p className="mb-6 max-w-xl text-muted">
          Portal shell only. Login and live project data are not connected yet.
        </p>
        <p className="text-sm text-muted">
          Use the public contact form for discovery. Authenticated client access will be added
          before any confidential deliverables are hosted here.
        </p>
      </div>
    </main>
  );
}
