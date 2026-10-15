import type { Metadata } from "next";
import Link from "next/link";
import AnalyzeWorkbench from "@/components/AnalyzeWorkbench";

export const metadata: Metadata = {
  title: "Data analysis workbench",
  description:
    "Upload a CSV and explore structure, metrics, charts, and exports in the browser. Local-only processing.",
};

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            Elite-Data-Intelligence
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/#contact" className="hover:text-foreground">
              Contact
            </Link>
            <span className="text-lime">Analyze</span>
          </nav>
        </div>
      </header>
      <AnalyzeWorkbench />
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-muted">
        Browser-side analysis only. Not a substitute for engagement-grade decision systems.{" "}
        <Link href="/privacy" className="text-lime hover:opacity-90">
          Privacy
        </Link>
      </footer>
    </main>
  );
}
