export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const iconBox = size === "lg" ? 40 : 26;
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
        <path
          d="M6 6H34V14L14 26H34V34H6V26L26 14H6V6Z"
          fill="var(--color-brand)"
        />
      </svg>
      <div className="leading-none">
        <p
          className={`font-heading font-bold tracking-tight text-text ${word}`}
        >
          financeiro
        </p>
        <p
          className={`font-medium uppercase tracking-[0.18em] text-brand ${handle}`}
        >
          caualimavd
        </p>
      </div>
    </div>
  );
}
