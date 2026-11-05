import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, BrandMark } from "@/components/BrandIcons";
import AnalyzeWorkbench from "@/components/AnalyzeWorkbench";
import "./analyze.css";

export const metadata: Metadata = {
  title: "Data workbench",
  description: "Explore CSV data with browser-local profiles, quality checks, charts, and exports.",
};

export default function AnalyzePage() {
  return (
    <div className="aw-app">
      <a className="edi-skip-link" href="#analyze-content">Skip to workbench</a>
      <header className="edi-header">
        <div className="edi-frame edi-header-row">
          <Link href="/" className="edi-brand" aria-label="Elite Data Intelligence home"><BrandMark /><span>ELITE DATA<span>INTELLIGENCE</span></span></Link>
          <nav className="aw-top-nav" aria-label="Workbench navigation">
            <span aria-current="page">Data workbench</span>
            <Link href="/">Home</Link>
            <Link href="/#contact" aria-label="Discuss a project">Discuss a project<Arrow diagonal /></Link>
          </nav>
        </div>
      </header>
      <main id="analyze-content" tabIndex={-1}><AnalyzeWorkbench /></main>
      <footer className="aw-footer edi-frame"><span>Elite Data Intelligence / Data workbench</span><span>Descriptive analysis · Processed on your device</span><Link href="/privacy">Privacy<Arrow diagonal /></Link></footer>
    </div>
  );
}
