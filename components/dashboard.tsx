"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowRight, FileText, Link2, Send } from "lucide-react";
import { shorten } from "@/lib/utils";
import { explorerAddress } from "@/config/arc";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NetworkGuard } from "@/components/network-guard";
import { BalanceCards } from "@/components/balance-cards";
import { IncomeSection } from "@/components/income";

const COMING_NEXT = [
  {
    icon: FileText,
    title: "Generate income statement",
    body: "Aggregate a period into a branded PDF, each figure backed by a tx hash.",
    milestone: "M4",
  },
  {
    icon: Link2,
    title: "Share a verify link",
    body: "Publish a selective-disclosure page a verifier can confirm against Arc.",
    milestone: "M5",
  },
];

export function Dashboard() {
  const { address } = useAccount();

  return (
    <>
      <NetworkGuard />
      <div className="container space-y-8 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Connected as{" "}
              {address ? (
                <a
                  href={explorerAddress(address)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-foreground hover:text-primary hover:underline"
                >
                  {shorten(address, 6)}
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          <Badge variant="outline">Arc Testnet</Badge>
        </div>

        <BalanceCards />

        <IncomeSection />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Get paid
          </h2>
          <Link href="/request" className="block">
            <Card className="gradient-border hairline-top group relative overflow-hidden p-6 transition-colors hover:bg-secondary/30">
              <div className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-brand/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <Send className="size-5" />
                </span>
                <div>
                  <h3 className="flex items-center gap-1.5 font-semibold">
                    Request payment with memo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                    Send a client a link that attaches an invoice/project memo to the
                    payment — so it arrives here already categorized.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <div className="grid gap-4 sm:grid-cols-2">
            {COMING_NEXT.map((a) => (
              <Card key={a.title} className="relative p-5">
                <Badge variant="muted" className="absolute right-3 top-3">
                  {a.milestone}
                </Badge>
                <a.icon className="size-6 text-primary" />
                <h3 className="mt-3 font-semibold">{a.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{a.body}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
