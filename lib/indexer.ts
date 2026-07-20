/**
 * Income indexer. The chain is the source of truth; we read it two ways:
 *   - History via the Arc block explorer's indexed `tokentx` API (fast, full history;
 *     raw eth_getLogs is capped to a 10k block range over ~52M blocks — infeasible).
 *   - Memo enrichment via RPC tx receipts (decode the Memo event in each incoming tx).
 *
 * Both are chain-derived. The DB never stores amounts. The /verify route (F5) reuses
 * `enrichMemos` / receipt recompute on a specific disclosed tx set (trustless, no scan).
 */
import {
  decodeEventLog,
  getAddress,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";
import { ARC } from "@/config/arc";
import { MEMO_ABI } from "@/lib/abi";
import { tokenByAddress, type TokenMeta } from "@/lib/tokens";
import { decodeMemoData, MEMO_ADDRESS, type PayslipMemo } from "@/lib/memo";

export interface Payment {
  txHash: Hex;
  blockNumber: number;
  timestamp: number; // ms epoch
  from: Address; // payer
  to: Address; // recipient (the user)
  tokenAddress: Address;
  tokenSymbol: TokenMeta["symbol"];
  tokenDecimals: number;
  fiat: TokenMeta["fiat"];
  amount: bigint; // base units
  memo: PayslipMemo | null;
  memoId: Hex | null;
}

/** JSON-safe form crossing the API boundary (bigint -> decimal string). */
export type PaymentDTO = Omit<Payment, "amount"> & { amount: string };

export function toDTO(p: Payment): PaymentDTO {
  return { ...p, amount: p.amount.toString() };
}
export function fromDTO(d: PaymentDTO): Payment {
  return { ...d, amount: BigInt(d.amount) };
}

interface TokenTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  blockNumber: string;
  timeStamp: string;
}

const MAX_PAGES = 6;
const PAGE_SIZE = 1000;

/** Pull the address's ERC-20 transfers from the explorer, newest first.
 *  `truncated` is true if we hit the page cap with more history still available. */
async function fetchTokenTx(
  address: Address,
): Promise<{ txs: TokenTx[]; truncated: boolean }> {
  const out: TokenTx[] = [];
  let truncated = false;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `${ARC.explorerUrl}/api?module=account&action=tokentx` +
      `&address=${address}&sort=desc&page=${page}&offset=${PAGE_SIZE}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) break;
    const json = (await res.json()) as { status?: string; result?: TokenTx[] };
    const rows = Array.isArray(json.result) ? json.result : [];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    if (page === MAX_PAGES) truncated = true; // full last page → more remains
  }
  return { txs: out, truncated };
}

/** Keep only incoming USDC/EURC transfers to `address`, as Payment rows (no memo yet). */
function toIncomingPayments(txs: TokenTx[], address: Address): Payment[] {
  const me = address.toLowerCase();
  const payments: Payment[] = [];
  for (const tx of txs) {
    if (tx.to?.toLowerCase() !== me) continue; // incoming only
    const token = tokenByAddress(tx.contractAddress);
    if (!token) continue; // USDC/EURC only
    payments.push({
      txHash: tx.hash as Hex,
      blockNumber: Number(tx.blockNumber),
      timestamp: Number(tx.timeStamp) * 1000,
      from: getAddress(tx.from),
      to: getAddress(tx.to),
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
      fiat: token.fiat,
      amount: BigInt(tx.value),
      memo: null,
      memoId: null,
    });
  }
  return payments;
}

/** Map with a bounded concurrency so we don't flood the RPC with receipt calls. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

const MEMO_ADDR_LC = MEMO_ADDRESS.toLowerCase();

/** Decode the first Memo event in a receipt's logs, if any. */
function memoFromLogs(
  logs: readonly { address: string; topics: readonly Hex[]; data: Hex }[],
): { memo: PayslipMemo | null; memoId: Hex } | null {
  for (const log of logs) {
    if (log.address.toLowerCase() !== MEMO_ADDR_LC) continue;
    try {
      const decoded = decodeEventLog({
        abi: MEMO_ABI,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (decoded.eventName !== "Memo") continue;
      const args = decoded.args as unknown as { memo: Hex; memoId: Hex };
      return { memo: decodeMemoData(args.memo), memoId: args.memoId };
    } catch {
      /* not a Memo log we understand */
    }
  }
  return null;
}

/** Attach decoded memos to payments by reading each tx receipt (bounded). */
export async function enrichMemos(
  client: PublicClient,
  payments: Payment[],
  cap = 250,
): Promise<Payment[]> {
  const targets = payments.slice(0, cap);
  await mapLimit(targets, 8, async (p) => {
    try {
      const receipt = await client.getTransactionReceipt({ hash: p.txHash });
      const found = memoFromLogs(receipt.logs);
      if (found) {
        p.memo = found.memo;
        p.memoId = found.memoId;
      }
    } catch {
      /* receipt unavailable — leave untagged */
    }
  });
  return payments;
}

/** Full income read: explorer history + memo enrichment. Newest first. */
export async function fetchIncome(
  client: PublicClient,
  address: Address,
): Promise<{ payments: Payment[]; truncated: boolean }> {
  const { txs, truncated } = await fetchTokenTx(address);
  const payments = toIncomingPayments(txs, address);
  await enrichMemos(client, payments);
  payments.sort((a, b) => b.blockNumber - a.blockNumber);
  return { payments, truncated };
}
