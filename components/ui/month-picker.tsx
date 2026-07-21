"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parse(value: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(value || "");
  if (!m) return null;
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year: Number(m[1]), month };
}

/**
 * HQ month picker — a styled Popover with a year navigator + a month grid. Emits
 * "YYYY-MM", so it's a drop-in for the native <input type="month">.
 */
export function MonthPicker({
  value,
  onChange,
  placeholder = "Pick a month",
  fromYear = 2020,
  toYear = new Date().getUTCFullYear() + 1,
  className,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  className?: string;
  id?: string;
}) {
  const parsed = parse(value);
  const [open, setOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(
    parsed?.year ?? new Date().getUTCFullYear(),
  );

  // Keep the visible year aligned with the selected value when it changes.
  React.useEffect(() => {
    const p = parse(value);
    if (p) setViewYear(p.year);
  }, [value]);

  const now = new Date();
  const curYear = now.getUTCFullYear();
  const curMonth = now.getUTCMonth();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors hover:border-ring/60 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            !parsed && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {parsed ? `${MONTHS[parsed.month]} ${parsed.year}` : placeholder}
          </span>
          <Calendar className="size-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous year"
            onClick={() => setViewYear((y) => Math.max(fromYear, y - 1))}
            disabled={viewYear <= fromYear}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold tabular-nums">{viewYear}</span>
          <button
            type="button"
            aria-label="Next year"
            onClick={() => setViewYear((y) => Math.min(toYear, y + 1))}
            disabled={viewYear >= toYear}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((m, i) => {
            const selected = parsed?.year === viewYear && parsed?.month === i;
            const isCurrent = viewYear === curYear && i === curMonth;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onChange(`${viewYear}-${String(i + 1).padStart(2, "0")}`);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md py-1.5 text-sm transition-colors",
                  selected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "hover:bg-secondary",
                  !selected && isCurrent && "text-primary ring-1 ring-primary/40",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
