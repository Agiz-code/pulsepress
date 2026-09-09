export function InfoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M10 7.5v1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10 11.5v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function BookmarkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5.5 3.5h9a1 1 0 0 1 1 1v12.5l-6-4-6 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M7 8.5V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10 4.5 10 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M6.5 9.5 10 6 13.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13.5h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function MoreHorizontalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="5" cy="10" r="1.25" fill="currentColor" />
      <circle cx="10" cy="10" r="1.25" fill="currentColor" />
      <circle cx="15" cy="10" r="1.25" fill="currentColor" />
    </svg>
  );
}
