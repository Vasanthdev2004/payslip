import { createPublicClient, http, type PublicClient } from "viem";
import { arcTestnet } from "@/config/arc";

/** Server-side Arc client for API routes (income indexing, /verify recompute). */
export function serverClient(): PublicClient {
  return createPublicClient({
    chain: arcTestnet,
    transport: http(),
  }) as PublicClient;
}
