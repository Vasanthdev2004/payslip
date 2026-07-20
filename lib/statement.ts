/**
 * Pure aggregation for the income statement (F4). Totals are kept as bigint (base
 * units) so they equal the on-chain sums exactly; chart/breakdown figures are derived
 * numbers for display. Client/category come from the effective memo (on-chain memo
 * first, then the user's manual tag).
 */
import { formatUnits, type Hex } from "viem";
import type { Payment } from "@/lib/indexer";
import type { TokenSymbol } from "@/lib/tokens";

export interface TagLike {
  client?: string | null;
  category?: string | null;
}

export interface TokenTotal {
  amount: bigint;
  decimals: number;
  count: number;
}

export interface BreakdownRow {
  name: string;
  USDC: number;
  EURC: number;
  count: number;
}

export interface MonthPoint {
  month: string; // YYYY-MM
  USDC: number;
  EURC: number;
}

export interface StatementTx {
  txHash: Hex;
  timestamp: number;
  from: string;
  client?: string;
  category?: string;
  symbol: TokenSymbol;
  amount: bigint;
  decimals: number;
}

export interface Statement {
  from: string;
  to: string;
  totals: Partial<Record<TokenSymbol, TokenTotal>>;
  byMonth: MonthPoint[];
  byClient: BreakdownRow[];
  byCategory: BreakdownRow[];
  txs: StatementTx[];
}

const ym = (ts: number) => new Date(ts).toISOString().slice(0, 7);
const num = (amount: bigint, decimals: number) => Number(formatUnits(amount, decimals));

/** Enumerate the YYYY-MM strings from `from`..`to` inclusive. */
function monthsBetween(from: string, to: string): string[] {
  if (!from || !to) return [];
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export function buildStatement(
  payments: Payment[],
  tagByTx: Map<string, TagLike>,
  from: string,
  to: string,
): Statement {
  const inRange = payments.filter((p) => {
    const m = ym(p.timestamp);
    return (!from || m >= from) && (!to || m <= to);
  });

  const totals: Partial<Record<TokenSymbol, TokenTotal>> = {};
  const monthMap = new Map<string, MonthPoint>();
  const clientMap = new Map<string, BreakdownRow>();
  const categoryMap = new Map<string, BreakdownRow>();
  const txs: StatementTx[] = [];

  for (const m of monthsBetween(from, to)) {
    monthMap.set(m, { month: m, USDC: 0, EURC: 0 });
  }

  const bump = (
    map: Map<string, BreakdownRow>,
    key: string,
    sym: TokenSymbol,
    value: number,
  ) => {
    const row = map.get(key) ?? { name: key, USDC: 0, EURC: 0, count: 0 };
    row[sym] += value;
    row.count += 1;
    map.set(key, row);
  };

  for (const p of inRange) {
    const tag = tagByTx.get(p.txHash.toLowerCase());
    const client = p.memo?.client ?? tag?.client ?? "Untitled client";
    const category = p.memo?.category ?? tag?.category ?? "uncategorized";
    const sym = p.tokenSymbol;
    const value = num(p.amount, p.tokenDecimals);

    const t = totals[sym] ?? { amount: 0n, decimals: p.tokenDecimals, count: 0 };
    t.amount += p.amount;
    t.count += 1;
    totals[sym] = t;

    const month = monthMap.get(ym(p.timestamp));
    if (month) month[sym] += value;

    bump(clientMap, client, sym, value);
    bump(categoryMap, category, sym, value);

    txs.push({
      txHash: p.txHash,
      timestamp: p.timestamp,
      from: p.from,
      client: p.memo?.client ?? tag?.client ?? undefined,
      category: p.memo?.category ?? tag?.category ?? undefined,
      symbol: sym,
      amount: p.amount,
      decimals: p.tokenDecimals,
    });
  }

  const rank = (m: Map<string, BreakdownRow>) =>
    [...m.values()].sort((a, b) => b.USDC + b.EURC - (a.USDC + a.EURC));

  txs.sort((a, b) => b.timestamp - a.timestamp);

  return {
    from,
    to,
    totals,
    byMonth: [...monthMap.values()],
    byClient: rank(clientMap),
    byCategory: rank(categoryMap),
    txs,
  };
}
