export function Arrow({ diagonal = false, className = "" }: { diagonal?: boolean; className?: string }) {
  return (
    <svg className={`edi-arrow ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {diagonal ? <path d="M5 19 19 5M5 5h14v14" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path d="M2 2h11v11H2zM17 2h11v11H17zM2 17h11v11H2z" fill="currentColor" />
      <path d="M17 17h11v11H17z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
