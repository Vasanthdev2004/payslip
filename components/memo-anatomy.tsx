"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { TokenLogo } from "./token-logo";

/* ------------------------------------------------------- syntax tokens */
const C = ({ children }: { children: ReactNode }) => (
  <span className="text-white/35">{children}</span>
);
const Fn = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold text-emerald-300">{children}</span>
);
const P = ({ children }: { children: ReactNode }) => (
  <span className="text-white/40">{children}</span>
);
const K = ({ children }: { children: ReactNode }) => (
  <span className="text-sky-300">{children}</span>
);
const S = ({ children }: { children: ReactNode }) => (
  <span className="text-emerald-200/90">{children}</span>
);
const V = ({ children }: { children: ReactNode }) => (
  <span className="text-white/90">{children}</span>
);
const D = ({ children }: { children: ReactNode }) => (
  <span className="text-white/25">{children}</span>
);

type Line = { lvl?: number; hl?: boolean; node: ReactNode };

const LINES: Line[] = [
  { node: <C># your client signs once, the memo rides along</C> },
  { node: (<><Fn>Memo.memo</Fn><P>(</P></>) },
  { lvl: 1, node: (<><K>target</K><P>:</P> <V>USDC</V> <D>· 0x3600…0000</D></>) },
  { lvl: 1, node: (<><K>data</K><P>:</P>{"   "}<V>transfer(</V><D>you</D><V>, 1,250.00)</V></>) },
  { lvl: 1, node: (<><K>memoId</K><P>:</P> <S>keccak256(&quot;2026-03:INV-2026-014&quot;)</S></>) },
  { lvl: 1, hl: true, node: (<><K>memo</K><P>: {"{"}</P></>) },
  { lvl: 2, hl: true, node: (<><K>&quot;client&quot;</K><P>:</P>{"  "}<S>&quot;Acme Inc&quot;</S><P>,</P></>) },
  { lvl: 2, hl: true, node: (<><K>&quot;project&quot;</K><P>:</P> <S>&quot;Website redesign&quot;</S><P>,</P></>) },
  { lvl: 2, hl: true, node: (<><K>&quot;invoice&quot;</K><P>:</P> <S>&quot;INV-2026-014&quot;</S><P>,</P></>) },
  { lvl: 2, hl: true, node: (<><K>&quot;period&quot;</K><P>:</P>{"  "}<S>&quot;2026-03&quot;</S></>) },
  { lvl: 1, hl: true, node: <P>{"}"}</P> },
  { node: <P>)</P> },
];

const CALL_TEXT = `Memo.memo(
  target: USDC,
  data:   transfer(you, 1250.00),
  memoId: keccak256("2026-03:INV-2026-014"),
  memo: {
    "client":  "Acme Inc",
    "project": "Website redesign",
    "invoice": "INV-2026-014",
    "period":  "2026-03"
  }
)`;

const EASE = [0.16, 1, 0.3, 1] as const;
const cardIn = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } } };
const linesIn = { hidden: {}, show: { transition: { staggerChildren: 0.045 } } };
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const lineItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
};
const viewport = { once: true, amount: 0.25 } as const;

function CodeCard() {
  const [copied, setCopied] = useState(false);
  return (
    <motion.div
      variants={cardIn}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      className="gradient-border relative flex h-full flex-col overflow-hidden rounded-xl bg-[#0a0f14] shadow-glow"
    >
      {/* header */}
      <motion.div
        variants={item}
        className="flex items-center gap-2 border-b border-white/10 px-4 py-3"
      >
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-white/45">
          pay-with-memo.ts
        </span>
        <span className="ml-auto rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 font-mono text-[10px] text-brand-3">
          Arc Testnet
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(CALL_TEXT);
            setCopied(true);
            toast.success("Contract call copied");
            setTimeout(() => setCopied(false), 1600);
          }}
          aria-label="Copy call"
          className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <Check className="size-3.5 text-brand-3" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </motion.div>

      {/* code — lines assemble one by one */}
      <motion.div
        variants={linesIn}
        className="flex-1 overflow-x-auto py-4 font-mono text-[12.5px] leading-[1.9]"
      >
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            variants={lineItem}
            className="flex items-stretch pr-4"
          >
            <span className="w-10 shrink-0 select-none pr-3 text-right text-white/20">
              {i + 1}
            </span>
            <div
              className={cn(
                "flex-1 whitespace-pre",
                line.hl && "border-l-2 border-brand/50 bg-brand/[0.06]",
              )}
              style={{
                paddingLeft: (line.lvl ?? 0) * 16 + (line.hl ? 10 : 12),
              }}
            >
              {line.node}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/** "Event emitted" broadcast pulse. */
function EmitPulse() {
  return (
    <span className="relative flex size-9 items-center justify-center">
      <span className="absolute size-9 rounded-full border border-brand-3/40 [animation:ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] motion-reduce:hidden" />
      <span className="absolute size-6 rounded-full border border-brand-3/30" />
      <span className="relative size-2.5 rounded-full bg-brand-3 shadow-[0_0_10px_hsl(var(--brand-3)/0.8)]" />
    </span>
  );
}

function EventCard({
  icon,
  kind,
  children,
}: {
  icon: ReactNode;
  kind: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="font-mono text-[11px] uppercase tracking-wider text-white/45">
          {kind} event
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-white/70">
      {children}
    </span>
  );
}

function Outcome() {
  return (
    <motion.div
      variants={cardIn}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      className="flex h-full flex-col"
    >
      <motion.div
        variants={item}
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40"
      >
        Emits, in one transaction
      </motion.div>

      <EventCard
        kind="Transfer"
        icon={<TokenLogo symbol="USDC" animated className="size-9" />}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-semibold text-white tabular-nums">
            1,250.00
          </span>
          <span className="text-sm text-white/50">USDC → you</span>
        </div>
        <div className="mt-1 text-xs text-white/40">
          from Acme Inc · payer preserved via CALL_FROM
        </div>
      </EventCard>

      {/* bundle connector */}
      <motion.div
        variants={item}
        className="relative my-2 flex justify-center"
      >
        <span className="flex size-6 items-center justify-center rounded-full border border-white/10 bg-[#0a0f14] text-sm text-brand-3">
          +
        </span>
      </motion.div>

      <EventCard kind="Memo" icon={<EmitPulse />}>
        <div className="flex flex-wrap gap-1.5">
          <Chip>client: Acme Inc</Chip>
          <Chip>invoice: INV-2026-014</Chip>
          <Chip>period: 2026-03</Chip>
        </div>
      </EventCard>

      <div className="mt-5 space-y-2.5">
        {[
          "No approve needed. The payer signs a single transaction.",
          "Kred reads both events back and files it under Acme Inc, automatically.",
        ].map((t) => (
          <motion.div
            key={t}
            variants={item}
            className="flex items-start gap-2 text-sm text-white/60"
          >
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-3" />
            <span>{t}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function MemoAnatomy() {
  return (
    <section className="relative px-5 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-72 bg-brand/[0.05] blur-3xl" />
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand-3">The Arc-native part</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            The memo travels{" "}
            <span className="text-gradient">with the money</span>
          </h2>
          <p className="mt-4 text-white/55">
            Arc&apos;s Memo contract wraps the transfer and emits structured
            context in the <span className="text-white/80">same transaction</span>,{" "}
            not a note in our database. On-chain, forever, verifiable by anyone.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <CodeCard />
          <Outcome />
        </div>
      </div>
    </section>
  );
}
