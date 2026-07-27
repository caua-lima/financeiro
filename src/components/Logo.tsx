export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const iconBox = size === "lg" ? 52 : 34;
  const word = size === "lg" ? "text-2xl" : "text-base";
  const handle = size === "lg" ? "text-xs" : "text-[10px]";

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={iconBox}
        height={iconBox}
        viewBox="0 0 40 40"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#17c3a2" />
            <stop offset="100%" stopColor="#e0b356" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#logoGrad)" />
        <path
          d="M12 24.5L17 19.5L21.5 23L28 15"
          stroke="#04120e"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M23 15H28V20"
          stroke="#04120e"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="leading-none">
        <p className={`font-semibold tracking-tight text-text ${word}`}>
          financeiro
        </p>
        <p
          className={`font-medium uppercase tracking-[0.18em] text-gold ${handle}`}
        >
          caualimavd
        </p>
      </div>
    </div>
  );
}
