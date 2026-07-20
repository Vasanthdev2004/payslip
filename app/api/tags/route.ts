import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const tagInput = z.object({
  address: z.string().refine(isAddress, "invalid address"),
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, "invalid tx hash"),
  logIndex: z.number().int().nonnegative().default(0),
  client: z.string().max(120).optional().nullable(),
  project: z.string().max(120).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  invoice: z.string().max(60).optional().nullable(),
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "period must be YYYY-MM")
    .optional()
    .nullable(),
  note: z.string().max(200).optional().nullable(),
});

/** GET /api/tags?address=0x... → all user tags for that wallet. */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "invalid address" }, { status: 400 });
  }
  const tags = await db.tag.findMany({
    where: { address: address.toLowerCase() },
  });
  return NextResponse.json({ tags });
}

/** POST /api/tags → upsert a tag (metadata only; never affects on-chain amounts). */
export async function POST(req: NextRequest) {
  const parsed = tagInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid tag", detail: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { address, txHash, logIndex, ...fields } = parsed.data;
  const addr = address.toLowerCase();
  const data = {
    client: fields.client ?? null,
    project: fields.project ?? null,
    category: fields.category ?? null,
    invoice: fields.invoice ?? null,
    period: fields.period ?? null,
    note: fields.note ?? null,
  };
  const tag = await db.tag.upsert({
    where: {
      address_txHash_logIndex: { address: addr, txHash, logIndex },
    },
    create: { address: addr, txHash, logIndex, ...data },
    update: data,
  });
  return NextResponse.json({ tag });
}

/** DELETE /api/tags?address=&txHash=&logIndex= → clear a tag. */
export async function DELETE(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const address = p.get("address");
  const txHash = p.get("txHash");
  const logIndex = Number(p.get("logIndex") ?? 0);
  if (!address || !isAddress(address) || !txHash) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }
  await db.tag
    .delete({
      where: {
        address_txHash_logIndex: {
          address: address.toLowerCase(),
          txHash,
          logIndex,
        },
      },
    })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
