"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { usePreviewAddress } from "@/lib/preview";

export interface TagRecord {
  id: string;
  address: string;
  txHash: string;
  logIndex: number;
  client: string | null;
  project: string | null;
  category: string | null;
  invoice: string | null;
  period: string | null;
  note: string | null;
}

export interface TagInput {
  txHash: string;
  logIndex?: number;
  client?: string | null;
  project?: string | null;
  category?: string | null;
  invoice?: string | null;
  period?: string | null;
  note?: string | null;
}

/** All manual tags for the connected wallet, keyed later by tx hash. */
export function useTags() {
  const { address: wagmiAddress } = useAccount();
  const preview = usePreviewAddress();
  const address = wagmiAddress ?? preview;
  return useQuery({
    queryKey: ["tags", address],
    enabled: Boolean(address),
    staleTime: 30_000,
    queryFn: async (): Promise<TagRecord[]> => {
      const res = await fetch(`/api/tags?address=${address}`);
      if (!res.ok) throw new Error("Failed to load tags");
      return (await res.json()).tags as TagRecord[];
    },
  });
}

/** Upsert a manual tag; invalidates the tag cache so the feed updates. */
export function useSetTag() {
  const { address } = useAccount();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TagInput): Promise<TagRecord> => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, ...input }),
      });
      if (!res.ok) throw new Error("Failed to save tag");
      return (await res.json()).tag as TagRecord;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags", address] }),
  });
}
