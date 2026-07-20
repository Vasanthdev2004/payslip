import { cn } from "@/lib/utils";

/** Kred K-mark: split-stroke K, emerald→cyan gradient. */
export function KMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient
          id="kred-mark"
          x1="20"
          y1="16"
          x2="82"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#31DB90" />
          <stop offset="1" stopColor="#1FC7E6" />
        </linearGradient>
      </defs>
      <g
        fill="url(#kred-mark)"
        stroke="url(#kred-mark)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      >
        {/* stem */}
        <rect x="25" y="23" width="16" height="54" rx="5" strokeWidth="0" />
        {/* upper arm */}
        <path d="M44 47 L61 23 L79 23 Z" />
        {/* lower leg */}
        <path d="M44 53 L55 53 L80 77 L69 77 Z" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <KMark className="size-[1.15em]" />
      <span className="tracking-tight">Kred</span>
    </span>
  );
}
