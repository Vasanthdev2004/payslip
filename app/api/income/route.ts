import { type NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { serverClient } from "@/lib/rpc";
import { fetchIncome, toDTO } from "@/lib/indexer";

export const dynamic = "force-dynamic";

/** GET /api/income?address=0x... → incoming USDC/EURC payments, memo-enriched. */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("address");
  if (!raw || !isAddress(raw)) {
    return NextResponse.json({ error: "invalid address" }, { status: 400 });
  }

  try {
    const { payments, truncated } = await fetchIncome(
      serverClient(),
      getAddress(raw),
    );
    return NextResponse.json({ payments: payments.map(toDTO), truncated });
  } catch (err) {
    console.error("income index failed", err);
    return NextResponse.json(
      { error: "index failed", detail: String(err) },
      { status: 502 },
    );
  }
}
