import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent app-page header: eyebrow chip, title, description, optional actions. */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  icon?: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative mb-8", className)}>
      <div className="pointer-events-none absolute -left-24 -top-24 -z-10 size-64 rounded-full bg-brand/[0.07] blur-3xl" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
            {Icon && <Icon className="size-3" />}
            {eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
