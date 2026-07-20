"use client";

import {
  ArrowDownLeft,
  ExternalLink,
  Inbox,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useIncome } from "@/hooks/use-income";
import { type Payment } from "@/lib/indexer";
import { type TokenSymbol } from "@/lib/tokens";
import { ARC, explorerAddress, explorerTx } from "@/config/arc";
import { cn, formatAmount, formatDate, shorten } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TokenBadge } from "@/components/token-badge";

interface Total {
  symbol: TokenSymbol;
  decimals: number;
  amount: bigint;
  count: number;
}

function summarize(payments: Payment[]) {
  const totals = new Map<TokenSymbol, Total>();
  let tagged = 0;
  for (const p of payments) {
    if (p.memo) tagged++;
    const t = totals.get(p.tokenSymbol) ?? {
      symbol: p.tokenSymbol,
      decimals: p.tokenDecimals,
      amount: 0n,
      count: 0,
    };
    t.amount += p.amount;
    t.count += 1;
    totals.set(p.tokenSymbol, t);
  }
  return {
    totals: [...totals.values()],
    count: payments.length,
    taggedPct: payments.length ? Math.round((tagged / payments.length) * 100) : 0,
  };
}

export function IncomeSection() {
  const { data: payments, isLoading, isError, isFetching, refetch } = useIncome();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your income
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 text-muted-foreground"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          {isFetching ? "Syncing…" : "Refresh"}
        </Button>
      </div>

      {isLoading ? (
        <IncomeSkeleton />
      ) : isError ? (
        <IncomeError onRetry={() => refetch()} />
      ) : !payments || payments.length === 0 ? (
        <IncomeEmpty />
      ) : (
        <>
          <IncomeSummary payments={payments} />
          <IncomeTable payments={payments} />
        </>
      )}
    </section>
  );
}

function IncomeSummary({ payments }: { payments: Payment[] }) {
  const { totals, count, taggedPct } = summarize(payments);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {totals.map((t) => (
        <Card key={t.symbol} className="hairline-top relative overflow-hidden p-5">
          <div className="flex items-center gap-2">
            <TokenBadge symbol={t.symbol} size="sm" />
            <span className="text-sm text-muted-foreground">
              Total {t.symbol}
            </span>
          </div>
          <div className="mt-3 font-mono text-2xl font-semibold nums">
            {formatAmount(t.amount, t.decimals)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            across {t.count} payment{t.count === 1 ? "" : "s"}
          </div>
        </Card>
      ))}
      <Card className="p-5">
        <div className="text-sm text-muted-foreground">Payments</div>
        <div className="mt-3 font-mono text-2xl font-semibold nums">{count}</div>
        <div className="mt-1 text-xs text-muted-foreground">incoming, on-chain</div>
      </Card>
      <Card className="p-5">
        <div className="text-sm text-muted-foreground">Memo-tagged</div>
        <div className="mt-3 font-mono text-2xl font-semibold nums">
          {taggedPct}%
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          auto-categorized
        </div>
      </Card>
    </div>
  );
}

const MAX_ROWS = 100;

function IncomeTable({ payments }: { payments: Payment[] }) {
  const rows = payments.slice(0, MAX_ROWS);
  const hidden = payments.length - rows.length;
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">From</th>
              <th className="px-5 py-3 font-medium">Memo</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.txHash}
                className="border-b border-border/60 last:border-0 hover:bg-secondary/40"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                  {formatDate(p.timestamp)}
                </td>
                <td className="px-5 py-3.5">
                  <a
                    href={explorerAddress(p.from)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs hover:text-primary"
                  >
                    <ArrowDownLeft className="size-3.5 text-primary" />
                    {shorten(p.from)}
                  </a>
                </td>
                <td className="px-5 py-3.5">
                  <MemoCell payment={p} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1.5 font-mono font-medium nums">
                    {formatAmount(p.amount, p.tokenDecimals)}
                    <TokenBadge symbol={p.tokenSymbol} size="sm" />
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <a
                    href={explorerTx(p.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    aria-label="View on explorer"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hidden > 0 && (
        <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
          Showing the {MAX_ROWS} most recent · {hidden.toLocaleString()} more counted
          in totals
        </div>
      )}
    </Card>
  );
}

function MemoCell({ payment }: { payment: Payment }) {
  const m = payment.memo;
  if (!m) {
    return (
      <Badge variant="muted" className="font-normal text-muted-foreground">
        untagged
      </Badge>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {m.client && <span className="font-medium">{m.client}</span>}
      {m.project && (
        <span className="text-xs text-muted-foreground">· {m.project}</span>
      )}
      {m.category && (
        <Badge variant="success" className="font-normal capitalize">
          {m.category}
        </Badge>
      )}
      {m.invoice && (
        <span className="font-mono text-[11px] text-muted-foreground">
          {m.invoice}
        </span>
      )}
    </div>
  );
}

function IncomeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[104px] animate-pulse bg-muted/40" />
        ))}
      </div>
      <Card className="divide-y divide-border/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted/50" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted/50" />
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted/50" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function IncomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <TriangleAlert className="size-6 text-destructive" />
      <p className="font-medium">Couldn&apos;t read your income from Arc.</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        The explorer or RPC may be busy. The chain is fine — this is just the read
        path.
      </p>
      <Button size="sm" onClick={onRetry}>
        Try again
      </Button>
    </Card>
  );
}

function IncomeEmpty() {
  return (
    <Card className="flex flex-col items-center gap-2 border-dashed p-10 text-center">
      <Inbox className="size-6 text-muted-foreground" />
      <p className="font-medium">No incoming payments yet.</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Once this wallet receives USDC or EURC on Arc, every payment shows up here —
        auto-categorized from its Transaction Memo.
      </p>
      <a
        href={ARC.faucetUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        Get test USDC/EURC from the Circle faucet
        <ExternalLink className="size-3.5" />
      </a>
    </Card>
  );
}
