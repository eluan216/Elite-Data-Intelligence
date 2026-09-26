import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite-Data-Intelligence | AI & Advanced Analytics Consulting",
  description:
    "Specialized AI, data science, and advanced analytics consulting. Measurable enterprise outcomes through disciplined human oversight and agent leverage.",
  openGraph: {
    title: "Elite-Data-Intelligence",
    description: "AI & Advanced Analytics Consulting Agency",
    type: "website",
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
