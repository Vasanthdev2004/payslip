/**
 * KredRegistry (F6) — the on-chain anchor for income disclosures.
 *
 * A disclosure's "digest" is a keccak256 of its CANONICAL, order-independent content
 * (owner + period + the set of tx hashes). It is computed server-side only — returned
 * once when the disclosure is created (so the client anchors that exact value) and
 * recomputed at /verify — so the anchored digest and the verify check can never drift.
 * The chain, not the DB, is the source of truth for whether/when something was anchored.
 */
import {
  keccak256,
  toHex,
  isAddress,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";

export const KRED_REGISTRY_ABI = [
  {
    type: "function",
    name: "anchor",
    stateMutability: "nonpayable",
    inputs: [{ name: "digest", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "anchoredAt",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "digest", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Anchored",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "digest", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

/** Deployed KredRegistry address, or null when the feature isn't deployed yet.
 *  Env-driven so the anchor UI + verify read stay dormant until a real deployment. */
export function registryAddress(): Address | null {
  const a = process.env.NEXT_PUBLIC_KRED_REGISTRY_ADDRESS;
  return a && isAddress(a) ? (a as Address) : null;
}

export function isRegistryEnabled(): boolean {
  return registryAddress() !== null;
}

/** Canonical, order-independent digest of a disclosure's attested content.
 *  MUST be computed the same way at create-time and verify-time — so keep it pure
 *  and always route disclosure content through it (never hand-roll the JSON). */
export function disclosureDigest(input: {
  address: string;
  periodStart: string;
  periodEnd: string;
  txHashes: string[];
}): Hex {
  const canonical = JSON.stringify({
    v: 1,
    address: input.address.toLowerCase(),
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    txHashes: [...new Set(input.txHashes.map((h) => h.toLowerCase()))].sort(),
  });
  return keccak256(toHex(canonical));
}

export interface AnchorProof {
  /** unix seconds of the on-chain anchor (from the contract, not the DB). */
  anchoredAt: number;
  /** the anchoring tx, if the owner told us about it (display link only). */
  txHash: string | null;
}

/** Read the on-chain anchor for (owner, digest). Returns null if the registry isn't
 *  deployed, the read fails, or the digest was never anchored by this owner. The
 *  timestamp is derived from chain — the DB is never trusted for it. */
export async function readAnchor(
  client: PublicClient,
  owner: Address,
  digest: Hex,
  txHash: string | null,
): Promise<AnchorProof | null> {
  const registry = registryAddress();
  if (!registry) return null;
  try {
    const ts = (await client.readContract({
      address: registry,
      abi: KRED_REGISTRY_ABI,
      functionName: "anchoredAt",
      args: [owner, digest],
    })) as bigint;
    if (ts === 0n) return null;
    return { anchoredAt: Number(ts), txHash };
  } catch {
    return null;
  }
}
