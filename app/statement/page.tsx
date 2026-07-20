import type { Metadata } from "next";
import { Statement } from "@/components/statement";

export const metadata: Metadata = {
  title: "Income statement · Payslip",
};

export default function StatementPage() {
  return (
    <div className="container max-w-5xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">Income statement</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted-foreground">
        Aggregate any period into totals by client and category, with a monthly trend —
        then export a branded PDF where every line is backed by an on-chain tx hash.
      </p>
      <Statement />
    </div>
  );
}
