import * as React from "react";
import { cn } from "@/lib/utils";

/** Base frosted-glass surface classes (no padding — add your own). */
export const glassClass =
  "group relative overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-md backdrop-blur-xl transition-all duration-300";

/**
 * Frosted-glass surface: translucent + backdrop-blur, a thin light seam along the
 * top edge, and an optional colored corner glow. `interactive` adds the lift + glow
 * hover. Content is auto-stacked above the decorative layers.
 */
export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
    glow?: string;
    sheen?: boolean;
  }
>(
  (
    { className, children, interactive = false, glow, sheen = true, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        glassClass,
        interactive &&
          "hover:-translate-y-0.5 hover:border-border hover:shadow-xl",
        className,
      )}
      {...props}
    >
      {sheen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
        />
      )}
      {glow && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  ),
);
GlassCard.displayName = "GlassCard";
