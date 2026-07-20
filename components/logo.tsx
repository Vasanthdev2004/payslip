import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="hsl(var(--primary))" />
        {/* K */}
        <path
          d="M11.5 8.5V23.5M20.5 8.5 12.5 16.2M12.5 15.8 20.5 23.5"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tracking-tight">Kred</span>
    </span>
  );
}
