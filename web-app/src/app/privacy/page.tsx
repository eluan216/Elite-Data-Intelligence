import Link from "next/link";

export const metadata = {
  title: "Privacy — Elite-Data-Intelligence",
  description: "How we handle contact and website data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Home
        </Link>
        <h1 className="display-lg mt-8 mb-6">Privacy</h1>
        <div className="space-y-6 text-sm leading-relaxed text-muted">
          <p>
            Elite-Data-Intelligence uses the website contact form only to respond to discovery
            inquiries. We do not sell contact data or run marketing lists from form submissions.
          </p>
          <p>
            <strong className="text-foreground">What we collect:</strong> name, work email, and the
            problem description you submit. Delivery is by email to the founder.
          </p>
          <p>
            <strong className="text-foreground">Retention:</strong> inquiry email is kept as long as
            needed to respond and, if relevant, to run an engagement. You may ask for deletion of
            inquiry records that are not required for an active contract or legal obligation.
          </p>
          <p>
            <strong className="text-foreground">Logs:</strong> technical logs may record request
            metadata (for example approximate time and email domain) to operate and protect the
            service. We avoid logging full message bodies.
          </p>
          <p>
            <strong className="text-foreground">Contact:</strong>{" "}
            <a href="mailto:ogumaeluan@gmail.com" className="text-lime hover:opacity-90">
              ogumaeluan@gmail.com
            </a>
          </p>
          <p className="text-xs">This page describes current website practice. It is not a full legal privacy policy for every jurisdiction. Update with counsel when you expand regions or data processing.</p>
        </div>
      </div>
    </main>
  );
}
