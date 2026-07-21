import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Address, Hex } from "viem";
import { db } from "@/lib/db";
import { serverClient } from "@/lib/rpc";
import { recompute } from "@/lib/verify";
import { disclosureDigest, readAnchor } from "@/lib/registry";
import { VerifyView } from "@/components/verify-view";

// Cache each verify render briefly so a flood on one link can't amplify into an RPC
// storm; still recomputes from chain (just at most once per window).
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Verified income",
  description: "Income proof recomputed live from Arc on-chain data.",
};

export default async function VerifyPage({
  params,
}: {
  params: { id: string };
}) {
  const d = await db.disclosure.findUnique({ where: { id: params.id } });
  if (!d) notFound();

  let txHashes: Hex[] = [];
  let fields: string[] = [];
  try {
    const rawTx = JSON.parse(d.txHashes);
    txHashes = Array.isArray(rawTx)
      ? rawTx.filter((h): h is Hex => typeof h === "string")
      : [];
    const rawFields = JSON.parse(d.fields);
    fields = Array.isArray(rawFields)
      ? rawFields.filter((f): f is string => typeof f === "string")
      : [];
  } catch {
    /* corrupt record — recompute will simply verify nothing */
  }

  const client = serverClient();
  const result = await recompute(client, d.address as Address, txHashes);

  // F6: is this exact disclosure anchored on-chain? Digest is recomputed from the
  // stored content and checked against the KredRegistry — the DB is never trusted.
  const digest = disclosureDigest({
    address: d.address,
    periodStart: d.periodStart,
    periodEnd: d.periodEnd,
    txHashes,
  });
  const anchor = await readAnchor(
    client,
    d.address as Address,
    digest,
    d.anchorTxHash,
  );

  return (
    <VerifyView
      disclosure={{
        address: d.address,
        periodStart: d.periodStart,
        periodEnd: d.periodEnd,
        label: d.label,
      }}
      fields={new Set(fields)}
      result={result}
      anchor={anchor}
    />
  );
}
