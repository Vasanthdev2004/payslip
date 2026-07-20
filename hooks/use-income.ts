"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { fromDTO, type Payment, type PaymentDTO } from "@/lib/indexer";

/** Loads the connected wallet's incoming USDC/EURC payments from /api/income. */
export function useIncome() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["income", address],
    enabled: Boolean(address),
    staleTime: 30_000,
    queryFn: async (): Promise<Payment[]> => {
      const res = await fetch(`/api/income?address=${address}`);
      if (!res.ok) throw new Error("Failed to load income from Arc");
      const json = (await res.json()) as { payments: PaymentDTO[] };
      return json.payments.map(fromDTO);
    },
  });
}
