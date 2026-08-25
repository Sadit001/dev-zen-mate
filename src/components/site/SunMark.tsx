export function SunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M2 37h60" />
        <path d="M14 37a18 18 0 0 1 36 0" />
        <path d="M32 2v6M14.5 7.5l3 5.2M49.5 7.5l-3 5.2M3 18.5l5.5 2.4M61 18.5l-5.5 2.4M7 11l4.2 4.2M57 11l-4.2 4.2" />
      </g>
    </svg>
  );
}
