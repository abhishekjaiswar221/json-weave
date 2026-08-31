interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/** Geometric mark: two corner brackets framing a data node — parsing/structure, not a literal `{}`. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#12131A" />
      <path d="M10 8H8a2 2 0 0 0-2 2v2" stroke="#8B7CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 24h2a2 2 0 0 0 2-2v-2" stroke="#8B7CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3" fill="#8BE9FD" />
      <path d="M13.3 13.3 10.5 10.5" stroke="#3A3D4D" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18.7 18.7 21.5 21.5" stroke="#3A3D4D" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 24, withWordmark = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && <span className="font-semibold tracking-tight text-[15px] text-text">ParseNest</span>}
    </div>
  );
}
