import { cn } from "@/lib/utils";
import type { TokenSymbol } from "@/lib/tokens";

const CONF: Record<
  TokenSymbol,
  { c1: string; c2: string; glyph: string }
> = {
  // USDC — Circle blue; EURC — teal to differentiate at a glance.
  USDC: { c1: "#3B8FE0", c2: "#2775CA", glyph: "$" },
  EURC: { c1: "#37C39B", c2: "#1C9E84", glyph: "€" },
};

/**
 * Brand-style token coin (self-contained SVG). `animated` adds a glint that
 * travels around the rim.
 */
export function TokenLogo({
  symbol,
  className,
  animated = false,
}: {
  symbol: TokenSymbol;
  className?: string;
  animated?: boolean;
}) {
  const { c1, c2, glyph } = CONF[symbol];
  const gid = `tl-${symbol}`;
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={symbol}
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="26%" r="85%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${gid})`} />
      {/* top sheen */}
      <ellipse cx="20" cy="12" rx="13" ry="7" fill="#fff" opacity="0.12" />
      <circle
        cx="20"
        cy="20"
        r="15.5"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="1.4"
      />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="21"
        fontWeight="700"
        fill="#fff"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
      >
        {glyph}
      </text>
      {animated && (
        <circle
          cx="20"
          cy="20"
          r="15.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="6 92"
          opacity="0.85"
          className="[animation:spin_3.5s_linear_infinite] motion-reduce:[animation:none]"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      )}
    </svg>
  );
}
