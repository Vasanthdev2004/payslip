"use client";

import { useEffect, useState } from "react";
import { getAddress, isAddress, type Address } from "viem";

/**
 * DEV-ONLY design aid. `?preview=0x…` renders the connected (wallet) UI for any
 * address using its public on-chain data, so the authenticated surfaces can be
 * designed without a wallet. Disabled in production — real users must connect.
 */
export function usePreviewAddress(): Address | undefined {
  const [addr, setAddr] = useState<Address>();
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    try {
      const p = new URLSearchParams(window.location.search).get("preview");
      if (p && isAddress(p)) setAddr(getAddress(p));
    } catch {
      /* ignore */
    }
  }, []);
  return addr;
}
