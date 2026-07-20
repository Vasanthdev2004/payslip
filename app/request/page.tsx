import type { Metadata } from "next";
import { RequestBuilder } from "@/components/request-builder";

export const metadata: Metadata = {
  title: "Request a payment · Payslip",
};

export default function RequestPage() {
  return (
    <div className="container max-w-5xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">Request a payment</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-muted-foreground">
        Generate a link that attaches an invoice/project memo to the incoming
        payment — so when your client pays, it lands in your Payslip already
        categorized. No account needed on their side.
      </p>
      <RequestBuilder />
    </div>
  );
}
