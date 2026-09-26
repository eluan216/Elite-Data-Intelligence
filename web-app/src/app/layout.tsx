import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Elite-Data-Intelligence | AI & Advanced Analytics Consulting",
    template: "%s | Elite-Data-Intelligence",
  },
  description:
    "Specialized AI, data science, and advanced analytics consulting. Production-grade systems with senior human oversight and measurable enterprise outcomes.",
  keywords: [
    "AI consulting",
    "data science",
    "machine learning",
    "MLOps",
    "decision sciences",
    "enterprise analytics",
    "responsible AI",
  ],
  authors: [{ name: "Elite-Data-Intelligence" }],
  openGraph: {
    title: "Elite-Data-Intelligence",
    description:
      "AI & Advanced Analytics Consulting — measurable outcomes through disciplined delivery.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite-Data-Intelligence",
    description:
      "AI & Advanced Analytics Consulting — measurable outcomes through disciplined delivery.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
