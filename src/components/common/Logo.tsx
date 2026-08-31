interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/** Mark: a plain `{ }` on the brand's accent-green background — literal, not abstracted. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#5FBE93" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="17"
        fontWeight="700"
        fill="#0B0C0C"
      >
        {'{}'}
      </text>
    </svg>
  );
}

export function Logo({ size = 24, withWordmark = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && <span className="font-semibold tracking-tight text-[15px] text-text">JSONWeave</span>}
    </div>
  );
}
