"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const SPARK = [34, 41, 38, 52, 47, 63, 58, 72];

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const sparkGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const bar = {
  hidden: { scaleY: 0, opacity: 0.3 },
  show: { scaleY: 1, opacity: 1, transition: { duration: 0.55, ease: EASE } },
};

/**
 * The signature "Verified Income Passport" card. Ships with illustrative sample data
 * on the hero; animates itself into view (tilt-in, count-up, growing bars, staggered
 * sections). The /verify route renders its own static version with real figures.
 */
export function PassportCard({
  className,
  total = "$48,250.00",
  period = "Q1 2026",
  clients = 4,
  payments = 17,
  hashes = ["0x9f2c…a41d", "0x1b77…c0e9", "0x4ad0…7f52"],
}: {
  className?: string;
  total?: string;
  period?: string;
  clients?: number;
  payments?: number;
  hashes?: string[];
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const max = Math.max(...SPARK);

  // count-up on the headline figure
  const prefix = total.replace(/[\d.,].*$/, "");
  const targetNum = Number(total.replace(/[^0-9.]/g, "")) || 0;
  const [value, setValue] = useState(reduce ? targetNum : 0);
  useEffect(() => {
    if (reduce) return setValue(targetNum);
    if (!inView) return;
    const controls = animate(0, targetNum, {
      duration: 1.1,
      delay: 0.35,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, targetNum, reduce]);
  const shown = `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div ref={ref} className={cn("[perspective:1200px]", className)}>
      <motion.div
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 44, scale: 0.93, rotateX: 9 }
        }
        animate={
          inView
            ? { opacity: 1, y: 0, scale: 1, rotateX: 0 }
            : undefined
        }
        transition={{ duration: 0.85, ease: EASE }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="animate-float">
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="gradient-border hairline-top relative overflow-hidden rounded-xl bg-card/80 p-6 shadow-glow backdrop-blur-xl"
          >
            {/* inner ambient wash */}
            <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand/20 blur-3xl" />

            {/* header */}
            <motion.div
              variants={item}
              className="relative flex items-center justify-between"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Income Proof
              </span>
              <div className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-brand/30 bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                <ShieldCheck className="size-3.5" />
                Verified on Arc
                <span className="pointer-events-none absolute inset-0 -skew-x-12">
                  <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </span>
              </div>
            </motion.div>

            {/* amount */}
            <motion.div variants={item} className="relative mt-6">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Verified income · {period}
              </div>
              <div className="mt-1 font-mono text-4xl font-semibold tracking-tight tabular-nums">
                {shown}
              </div>
            </motion.div>

            {/* sparkline — bars grow up, staggered */}
            <motion.div
              variants={sparkGroup}
              className="relative mt-5 flex h-14 items-end gap-1.5"
            >
              {SPARK.map((v, i) => (
                <motion.div
                  key={i}
                  variants={bar}
                  className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-brand/30 to-brand"
                  style={{ height: `${(v / max) * 100}%` }}
                />
              ))}
            </motion.div>

            {/* meta row */}
            <motion.div
              variants={item}
              className="relative mt-5 flex items-center gap-4 text-sm"
            >
              <div>
                <div className="font-semibold tabular-nums">{payments}</div>
                <div className="text-xs text-muted-foreground">payments</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="font-semibold tabular-nums">{clients}</div>
                <div className="text-xs text-muted-foreground">clients</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="font-semibold tabular-nums">100%</div>
                <div className="text-xs text-muted-foreground">on-chain</div>
              </div>
            </motion.div>

            {/* tx hashes */}
            <motion.div
              variants={item}
              className="relative mt-5 border-t border-border pt-4"
            >
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Backed by transactions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashes.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {h}
                    <ArrowUpRight className="size-3" />
                  </span>
                ))}
                <span className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  +14
                </span>
              </div>
            </motion.div>

            {/* footer */}
            <motion.div
              variants={item}
              className="relative mt-4 flex items-center gap-2"
            >
              <Logo className="text-xs opacity-70" />
              <span className="ml-auto text-[11px] text-muted-foreground">
                Recomputed from Arc, not our database
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
